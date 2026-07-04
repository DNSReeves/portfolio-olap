/**
 * tests/taxonomy.test.js — Class-C consolidation (2026-07-03, P3-05/23/27/32).
 *
 * The taxonomy has ONE source of truth: build_classification_rules.py emits
 * sleeves / nameToParent / assetClassOfSleeve into classification_rules.json, and
 * app.js's applyTaxonomyMaps() overrides its literal DEFAULT_SLEEVES / SLEEVE_PARENTS /
 * _AC_* fallbacks from that file at load. This test drives the REAL app.js:
 *   - success  → the maps are overridden from the JSON and the rulesBanner is hidden.
 *   - failure  → literals stay, autoClassify degrades to Unclassified, banner is SHOWN.
 *
 * Introspection: DEFAULT_SLEEVES / SLEEVE_PARENTS are module-level `let`s that don't
 * attach to the vm sandbox global, so we append a getter shim in the SAME lexical scope.
 *
 * Wired as part of `npm test`.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const rules = require("../classification_rules.json");

function loadApp(rulesObj, fetchOk = true) {
  let src = fs.readFileSync(path.join(__dirname, "..", "src", "app.js"), "utf8");
  // test-only introspection into the module's lexical `let` bindings
  src += "\nglobalThis.__t = { defaultSleeves: () => DEFAULT_SLEEVES, sleeveParents: () => SLEEVE_PARENTS, baseAssetClass: (s) => _baseAssetClass(s) };\n";

  const proxy = new Proxy(function () {}, { get: () => proxy, apply: () => proxy, construct: () => proxy, set: () => true });
  // a real object for #rulesBanner so we can observe applyTaxonomyMaps toggling .hidden;
  // every other selector falls through to the no-op proxy (the module's DOM boot).
  const bannerStub = { hidden: null, addEventListener: () => {}, dataset: {} };
  const documentProxy = new Proxy(function () {}, {
    get: (_t, prop) => (prop === "querySelector"
      ? (sel) => (sel === "#rulesBanner" ? bannerStub : proxy)
      : proxy),
    apply: () => proxy, construct: () => proxy, set: () => true,
  });

  const sandbox = {
    document: documentProxy, window: proxy, indexedDB: proxy, localStorage: proxy, navigator: proxy,
    location: proxy, confirm: () => true, setTimeout: () => 0, clearTimeout: () => 0, console,
    fetch: async () => ({ ok: fetchOk, json: async () => rulesObj }),
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  try { vm.runInContext(src, sandbox, { filename: "app.js" }); } catch (_) { /* DOM boot no-ops under the proxy */ }
  sandbox.__bannerStub = bannerStub;
  return sandbox;
}

let failures = 0;
function eq(actual, expected, msg) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { failures += 1; console.error(`✗ ${msg}\n   expected ${e}\n   got      ${a}`); }
  else console.log(`✓ ${msg}`);
}
function ok(cond, msg) { eq(!!cond, true, msg); }

(async () => {
  // ── success path: rules load → maps overridden from the SSOT ──
  const app = loadApp(rules, true);
  await app.loadClassificationRules();

  eq(app.__t.defaultSleeves(), rules.sleeves, "DEFAULT_SLEEVES == generated sleeves list");

  // SLEEVE_PARENTS carries exactly the non-null nameToParent edges.
  const expectedParents = {};
  for (const [n, p] of Object.entries(rules.nameToParent)) if (p) expectedParents[n] = p;
  eq(app.__t.sleeveParents(), expectedParents, "SLEEVE_PARENTS == non-null nameToParent edges");

  // _AC_* rebuilt from assetClassOfSleeve: a sector-equity sleeve the OLD literal
  // _AC_EQUITY missed ("Communications") now resolves to Equity, proving the override.
  eq(app.__t.baseAssetClass("Communications"), "Equity", "_baseAssetClass('Communications') → Equity (was Alternatives in the literal)");
  eq(app.__t.baseAssetClass("Corporate Bonds"), "Bond", "_baseAssetClass('Corporate Bonds') → Bond");
  eq(app.__t.baseAssetClass("Cash"), "Cash", "_baseAssetClass('Cash') → Cash");
  eq(app.__t.baseAssetClass("Liquid Alternatives"), "Alternatives", "_baseAssetClass('Liquid Alternatives') → Alternatives");

  // every sleeve's _baseAssetClass agrees with the emitted assetClassOfSleeve
  for (const [name, ac] of Object.entries(rules.assetClassOfSleeve)) {
    if (app.__t.baseAssetClass(name) !== ac) {
      failures += 1; console.error(`✗ _baseAssetClass('${name}') expected ${ac} got ${app.__t.baseAssetClass(name)}`);
    }
  }
  console.log("✓ every sleeve _baseAssetClass agrees with assetClassOfSleeve");

  ok(app.__bannerStub.hidden === true, "rulesBanner HIDDEN when rules load");

  // ── failure path: fetch not ok → literals stay, degraded, banner SHOWN ──
  const bad = loadApp(null, false);
  await bad.loadClassificationRules();
  eq(bad.autoClassify("SPY", "SPDR S&P 500 ETF"), null, "autoClassify → null when rules fail (no legacy fallback table)");
  ok(bad.__bannerStub.hidden === false, "rulesBanner SHOWN when rules fail to load");

  if (failures) { console.error(`\n${failures} taxonomy assertion(s) FAILED`); process.exit(1); }
  console.log("\nall taxonomy assertions passed");
})().catch((e) => { console.error(e); process.exit(1); });
