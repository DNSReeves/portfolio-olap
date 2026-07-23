/**
 * tests/pdf_report.test.js — v2.6 full-book PDF report builder.
 *
 * buildReportHtml() is the pure seam: a complete self-contained HTML document from a
 * holdings array. Covers: totals + by-account grouping (advisor tag), asset-class and
 * convex-role rollups present, per-lot detail with assumed-basis footnote, no-basis
 * disclosure, staleness note, HTML escaping of hostile names, and full-book semantics
 * (the builder takes holdings directly — the account filter never reaches it).
 *
 * Wired as part of `npm test`.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

function loadApp() {
  const src = fs.readFileSync(path.join(__dirname, "..", "src", "app.js"), "utf8");
  const proxy = new Proxy(function () {}, { get: () => proxy, apply: () => proxy, construct: () => proxy, set: () => true });
  const sandbox = {
    document: proxy, window: proxy, indexedDB: proxy, localStorage: proxy, navigator: proxy,
    location: proxy, confirm: () => true, setTimeout: () => 0, clearTimeout: () => 0, console,
    fetch: async () => ({ ok: false, json: async () => null }),
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  try { vm.runInContext(src, sandbox, { filename: "app.js" }); } catch (_) { /* DOM boot no-ops */ }
  return sandbox;
}

const app = loadApp();
let failures = 0;
function check(name, cond) {
  if (cond) { console.log(`  ok  ${name}`); }
  else { console.error(`FAIL  ${name}`); failures += 1; }
}

const H = (ticker, mv, cost, acct, sleeve, extra = {}) => ({
  ticker, assetName: extra.name || ticker + " Fund", sleeve: sleeve || "Large Blend",
  shares: extra.shares || 0, marketValue: mv, costBasis: cost,
  brokerageAccount: acct, basisAssumed: !!extra.assumed,
});

const BOOK = [
  H("SPY", 500000, 400000, "Living Trust", "Large Blend"),
  H("AGG", 200000, 210000, "Living Trust", "Core Bond"),
  H("IBIT", 100000, 40000, "DNSR-IRA", "Crypto"),
  H("ANNU", 50000, 50000, "TIAA-CREF", "Annuity / Stable Value", { assumed: true }),
  H("NOBAS", 25000, null, "DNSR-IRA", "Private Equity"),
  H("<script>", 1000, 900, "DNSR-IRA", "Large Blend", { name: 'Evil "Fund" & Co' }),
];

const html = app.buildReportHtml(BOOK, {
  valuationDate: "2026-06-18", appVersion: "vTEST",
  generatedAt: new Date("2026-07-08T12:00:00"),
});

check("is a complete document", html.startsWith("<!DOCTYPE html>") && html.includes("</html>"));
check("header carries as-of + version + full-book note",
  // wording drift (iss_f84c10e4): "account filter is ignored" became
  // "full book, all accounts" in the de-branding pass; same meaning
  html.includes("2026-06-18") && html.includes("vTEST") && html.includes("full book, all accounts"));
check("staleness warning fires at 20 days", html.includes("20 days old"));
check("total value present", html.includes("$876,000"));
check("accounts grouped, largest first",
  html.indexOf("Living Trust") < html.indexOf("DNSR-IRA") && html.includes("TIAA-CREF"));
check("asset-class rollup has buckets + sleeves",
  html.includes("Asset-Class Rollup") && html.includes("Crypto") && html.includes("Core Bond"));
// "Convex-Role View" was de-branded to "Role View" (iss_f84c10e4)
check("role section present", html.includes("Role View"));
check("per-lot detail present with tickers", html.includes("IBIT") && html.includes("Holdings Detail"));
check("assumed-basis footnote wired",
  html.includes("<sup>*</sup>") && html.includes("assumed basis"));
// 2026-07-08: "unknown basis" = missing OR operator-assumed (assumed = MV is display-only) —
// NOBAS $25,000 + ANNU $50,000 assumed. Previously assumed rows counted as KNOWN basis, so the
// disclosure never fired on a live book (applyAssumedBasis fills every row) and the headline
// "Cost basis (known)" was overstated by exactly the assumed value.
check("no-basis disclosure covers missing + assumed rows", html.includes("Basis unknown on $75,000"));
check("Cost basis (known) excludes assumed rows",   // 400000+210000+40000+900, NOT +50000 ANNU
  html.includes("$650,900") && !html.includes("$700,900"));
check("hostile names escaped",
  // v2.6.1: the report page carries its OWN legit <script> (the email handler), so assert
  // the hostile HOLDING data is escaped rather than "no script tag anywhere"
  !html.includes("<td><script>") && html.includes("&lt;script&gt;") && html.includes("Evil &quot;Fund&quot;"));
check("gains colored by sign", html.includes('class="num down">-$10,000') || html.includes("down"));

// fresh book → no stale warning
const fresh = app.buildReportHtml(BOOK, {
  valuationDate: "2026-07-07", appVersion: "vTEST",
  generatedAt: new Date("2026-07-08T12:00:00"),
});
check("fresh book has no stale warning", !fresh.includes("re-export from the brokers"));

// ── v2.6.1: the email option ──
const htmlWithAgent = app.buildReportHtml(BOOK, {
  valuationDate: "2026-07-07", appVersion: "vTEST",
  generatedAt: new Date("2026-07-08T12:00:00"), agentBase: "https://mini.ts.net:8443",
});
check("email button present with the agent base inlined",
  htmlWithAgent.includes("emailReport") && htmlWithAgent.includes("https://mini.ts.net:8443")
  && htmlWithAgent.includes("/api/olap/email_report"));
check("no agentBase → button renders but base is empty string",
  html.includes('AGENT_BASE = ""'));

process.exit(failures ? 1 : 0);

