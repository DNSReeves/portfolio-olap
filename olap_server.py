#!/usr/bin/env python3
"""No-cache static server for the OLAP dashboard (com.dnsr.olap) + the 'Load 3F' endpoint.

Static: like `python -m http.server` but every response carries Cache-Control: no-store,
so browsers — iPad Safari especially — never serve a stale index.html / CSS / JS after an
edit. LAN/tailnet-only; serves this file's own directory on 0.0.0.0:8787.

Load 3F (2026-07-16): POST /api/load3f accepts the operator's THREE native exports —
comprehensive Schwab CSV + comprehensive Fidelity CSV + two typed TIAA balances (the TIAA
PDF is vector-rendered and un-parseable, so those two numbers are entered by hand) — stages
the CSVs, runs the mature Python consolidation (portfolio_analysis.py, with EXPORT_DIR and
TIAA overrides), and returns a JSON summary. The existing '📥 Load Full Book' path then
loads the freshly-written consolidated_holdings.csv. The consolidation is REUSED, not
re-implemented in JS (no Python/JS divergence). LAN-only; runs one fixed script, never
arbitrary input.
"""
import json
import os
import shutil
import subprocess
from email.parser import BytesParser
from email.policy import default as _email_default
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PORT = 8787

# Sibling repos under agentic_software_from_scratch/ (olap's parent).
_ASF = os.path.dirname(DIRECTORY)
_AGENT_DIR = os.path.join(_ASF, "dnsr-agent")
_PA_DIR = os.path.join(_ASF, "portfolio-analysis")
_PA_SCRIPT = os.path.join(_PA_DIR, "portfolio_analysis.py")
_VENV_PY = os.path.join(_AGENT_DIR, ".venv", "bin", "python3.12")
_STAGING = os.path.join(DIRECTORY, "staging_3f")
_RUN_TIMEOUT = 600


def _to_num(s):
    try:
        return float(str(s).replace(",", "").replace("$", "").strip())
    except (TypeError, ValueError):
        return None


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def _json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_multipart(self):
        """Parse multipart/form-data via the stdlib email parser (robust boundary handling).
        Returns (fields:dict[str,str], files:dict[str,(filename,bytes)])."""
        ctype = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in ctype:
            return None
        length = int(self.headers.get("Content-Length", 0) or 0)
        body = self.rfile.read(length)
        msg = BytesParser(policy=_email_default).parsebytes(
            b"Content-Type: " + ctype.encode() + b"\r\n\r\n" + body)
        fields, files = {}, {}
        for part in msg.iter_parts():
            name = part.get_param("name", header="Content-Disposition")
            filename = part.get_param("filename", header="Content-Disposition")
            payload = part.get_payload(decode=True) or b""
            if filename:
                files[name] = (filename, payload)
            elif name:
                fields[name] = payload.decode("utf-8", "replace").strip()
        return fields, files

    def do_POST(self):
        if self.path.rstrip("/") != "/api/load3f":
            return self._json(404, {"ok": False, "error": "unknown endpoint"})
        try:
            parsed = self._read_multipart()
            if parsed is None:
                return self._json(400, {"ok": False, "error": "expected multipart/form-data"})
            fields, files = parsed
            if "schwab_csv" not in files or "fidelity_csv" not in files:
                return self._json(400, {"ok": False,
                                        "error": "both a Schwab CSV and a Fidelity CSV are required"})

            # Stage the two native CSVs (keep their native filenames — content-detect uses them).
            shutil.rmtree(_STAGING, ignore_errors=True)
            os.makedirs(_STAGING, exist_ok=True)
            for key in ("schwab_csv", "fidelity_csv"):
                fname, data = files[key]
                safe = os.path.basename(fname) or (key + ".csv")
                with open(os.path.join(_STAGING, safe), "wb") as f:
                    f.write(data)

            env = dict(os.environ)
            env["EXPORT_DIR_OVERRIDE"] = _STAGING
            env["PYTHONPATH"] = _AGENT_DIR + os.pathsep + env.get("PYTHONPATH", "")
            trad, cref = _to_num(fields.get("tiaa_traditional")), _to_num(fields.get("tiaa_cref"))
            if trad is not None and cref is not None:
                env["TIAA_OVERRIDE_JSON"] = json.dumps({"traditional": trad, "cref": cref})

            proc = subprocess.run([_VENV_PY, _PA_SCRIPT], cwd=_PA_DIR, env=env,
                                  capture_output=True, text=True, timeout=_RUN_TIMEOUT)
            out = (proc.stdout or "") + "\n" + (proc.stderr or "")

            import re
            mt = re.search(r"TOTAL across \d+ accounts: \$([\d,]+)", out)
            total = mt.group(1) if mt else None
            as_of_m = re.search(r"Source exports as-of:\s*([^\n]+)", out)
            reconcile_bad = ("did NOT print clean" in out) or ("does NOT reconcile" in out)
            warnings = [ln.strip() for ln in out.splitlines() if "⚠" in ln][:12]
            ok = (proc.returncode == 0) and (total is not None)
            return self._json(200 if ok else 500, {
                "ok": ok,
                "total": total,
                "as_of": (as_of_m.group(1).strip() if as_of_m else None),
                "reconcile_ok": (not reconcile_bad),
                "warnings": warnings,
                "tail": "\n".join(out.splitlines()[-18:]),
            })
        except subprocess.TimeoutExpired:
            return self._json(504, {"ok": False, "error": f"consolidation exceeded {_RUN_TIMEOUT}s"})
        except Exception as e:  # noqa: BLE001 — surface any failure to the UI, never 500-silent
            return self._json(500, {"ok": False, "error": f"{type(e).__name__}: {e}"})


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", PORT), NoCacheHandler).serve_forever()
