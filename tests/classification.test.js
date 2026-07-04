/**
 * tests/classification.test.js — P3-14/15/16 (2026-07-03) shared-classifier rule quality.
 *
 * Runs the REAL app.js autoClassify against the generated classification_rules.json
 * (injected via a fetch stub + loadClassificationRules) and locks the adversarial
 * names the review flagged: longest-matched-keyword-wins (not first-match), bare
 * 'gold'/'clo'/'trend' dropped, and the option-expiry fallback firing.
 *
 * Wired as part of `npm test`.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const rules = require("../classification_rules.json");

function loadApp() {
  const src = fs.readFileSync(path.join(__dirname, "..", "src", "app.js"), "utf8");
  const proxy = new Proxy(function () {}, { get: () => proxy, apply: () => proxy, construct: () => proxy, set: () => true });
  const sandbox = {
    document: proxy, window: proxy, indexedDB: proxy, localStorage: proxy, navigator: proxy,
    location: proxy, confirm: () => true, setTimeout: () => 0, clearTimeout: () => 0, console,
    // real fetch stub so loadClassificationRules() can populate CLASSIFICATION_RULES
    fetch: async () => ({ ok: true, json: async () => rules }),
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  try { vm.runInContext(src, sandbox, { filename: "app.js" }); } catch (_) { /* DOM boot no-ops under the proxy */ }
  return sandbox;
}

(async () => {
  const app = loadApp();
  await app.loadClassificationRules();   // sets CLASSIFICATION_RULES from the injected JSON

  let failures = 0;
  const name = (code) => rules.codeToName[code] || code;
  function eq(actual, expected, msg) {
    if (actual !== expected) { failures += 1; console.error(`✗ ${msg}\n   expected ${JSON.stringify(expected)}\n   got      ${JSON.stringify(actual)}`); }
    else console.log(`✓ ${msg}`);
  }
  const ac = (ticker, desc) => app.autoClassify(ticker, desc);

  // P3-16: longest matched keyword wins (specificity beats array order).
  eq(ac("912828XX0", "US TREASURY BOND 4.75% DUE 2044"), name("TREASURIES"), "'treasury' (8) beats 'bond' (4)");
  eq(ac("DFAIQ", "DIMENSIONAL INTERNATIONAL CORE EQUITY"), name("INTERNATIONAL"), "'international' beats 'core equity'");
  // P3-15: bare 'gold' / 'clo' dropped.
  eq(ac("38141GXZ5", "GOLDMAN SACHS GROUP INC 4.25% NT"), name("BONDS"), "Goldman bond → Bonds (not Precious Metals)");
  eq(ac("ZGDX", "VANECK GOLD MINERS FUND"), name("EQUITY_PRECIOUS_METALS"), "'gold miners' still classifies");
  eq(ac("ZEVCE", "EATON VANCE CLOSED END FUND"), null, "closed-end fund not swept to Bonds via 'clo'");
  // P3-14: option-expiry fallback fires.
  eq(ac("SPY 09/18/2026 585.00 P", "PUT STATE STREET SPDR"), name("OPTIONS"), "option-expiry fallback → Options");
  // exact ticker beats name keywords.
  eq(ac("TLT", "ISHARES 20+ YEAR TREASURY BOND ETF"), name("TREASURIES"), "pinned ticker TLT → Treasuries");

  if (failures) { console.error(`\n${failures} classification assertion(s) FAILED`); process.exit(1); }
  console.log("\nall classification assertions passed");
})().catch((e) => { console.error(e); process.exit(1); });
