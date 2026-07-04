/**
 * tests/sleeve_precedence.test.js — manual-vs-imported sleeve precedence (2026-07 review).
 *
 * classifyHolding must resolve a holding's sleeve as: MANUAL override > imported (CSV Sleeve
 * column) > auto-classify > Unclassified. The old order (imported > manual) silently discarded a
 * user's manual correction on the next Load Full Book, contradicting the UI's own saveNote.
 *
 * Drives the REAL app.js (rules injected via the fetch stub + loadClassificationRules).
 * Wired as part of `npm test`.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const rules = require("../classification_rules.json");

function loadApp() {
  let src = fs.readFileSync(path.join(__dirname, "..", "src", "app.js"), "utf8");
  // test-only hooks in the SAME lexical scope so we can seed the module's `state.assignments`
  src += "\nglobalThis.__t = {" +
    " setAssign: (t, n, s) => { state.assignments[assignmentKey(t, n)] = s; }," +
    " clearAssign: () => { for (const k in state.assignments) delete state.assignments[k]; }," +
    " classify: (t, n, imp) => classifyHolding(t, n, imp) };\n";
  const proxy = new Proxy(function () {}, { get: () => proxy, apply: () => proxy, construct: () => proxy, set: () => true });
  const sandbox = {
    document: proxy, window: proxy, indexedDB: proxy, localStorage: proxy, navigator: proxy,
    location: proxy, confirm: () => true, setTimeout: () => 0, clearTimeout: () => 0, console,
    fetch: async () => ({ ok: true, json: async () => rules }),
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  try { vm.runInContext(src, sandbox, { filename: "app.js" }); } catch (_) { /* DOM boot no-ops under the proxy */ }
  return sandbox;
}

(async () => {
  const app = loadApp();
  await app.loadClassificationRules();

  let failures = 0;
  function eq(actual, expected, msg) {
    const a = JSON.stringify(actual), e = JSON.stringify(expected);
    if (a !== e) { failures += 1; console.error(`✗ ${msg}\n   expected ${e}\n   got      ${a}`); }
    else console.log(`✓ ${msg}`);
  }

  const T = app.__t;

  // 1. no manual, imported present → imported wins
  T.clearAssign();
  eq(T.classify("SPY", "SPDR S&P 500 ETF", "Large Blend"),
     { sleeve: "Large Blend", source: "imported" }, "imported sleeve wins when no manual edit");

  // 2. MANUAL override beats a DIFFERENT imported sleeve (the fix)
  T.setAssign("ANGL", "VANECK FALLEN ANGEL", "Junk Bonds");
  eq(T.classify("ANGL", "VANECK FALLEN ANGEL", "Corporate Bonds"),
     { sleeve: "Junk Bonds", source: "manual" }, "manual override beats the imported sleeve");

  // 3. manual also wins when there is no imported sleeve
  eq(T.classify("ANGL", "VANECK FALLEN ANGEL", ""),
     { sleeve: "Junk Bonds", source: "manual" }, "manual wins with no imported sleeve");

  // 4. no manual, no imported → auto-classify by name/ticker
  T.clearAssign();
  const auto = T.classify("TLT", "ISHARES 20+ YEAR TREASURY BOND ETF", "");
  eq(auto.source, "auto", "falls through to auto when no manual + no imported");
  eq(auto.sleeve, rules.codeToName["TREASURIES"] || "TREASURIES", "auto classifies TLT → Treasuries");

  // 5. nothing matches → Unclassified
  eq(T.classify("ZZZZ", "SOME UNKNOWN THING", ""),
     { sleeve: "Unclassified", source: "unclassified" }, "no match → Unclassified");

  if (failures) { console.error(`\n${failures} sleeve-precedence assertion(s) FAILED`); process.exit(1); }
  console.log("\nall sleeve-precedence assertions passed");
})().catch((e) => { console.error(e); process.exit(1); });
