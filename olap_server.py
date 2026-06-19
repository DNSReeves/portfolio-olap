#!/usr/bin/env python3
"""No-cache static file server for the OLAP dashboard (com.dnsr.olap).

Same as `python -m http.server` but every response carries Cache-Control: no-store,
so browsers — iPad Safari especially — never serve a stale index.html / CSS / JS
after an edit. LAN-only, read-only; serves this file's own directory on 0.0.0.0:8787.
"""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PORT = 8787


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", PORT), NoCacheHandler).serve_forever()
