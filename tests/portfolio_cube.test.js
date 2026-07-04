/**
 * tests/portfolio_cube.test.js — one unrealized-gain convention (2026-07 review P3-34).
 *
 * The cube-level 'Unrealized gain' (totalValue − Σ(costBasis||0)) counted a missing-basis holding
 * as 100% gain, while the per-sleeve accumulation (costBasis ? mv−cb : 0) counted it as ZERO — so
 * the Planning headline and the embedded-tax-by-sleeve breakdown couldn't reconcile. Now both use
 * the same rule: basis present iff costBasis != null (a genuine $0 counts; a missing field does not),
 * gains summed over present-basis holdings only, missing-basis MV surfaced separately.
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
function ok(cond, msg) {
  if (!cond) { failures += 1; console.error(`✗ ${msg}`); } else console.log(`✓ ${msg}`);
}
const approx = (a, b) => Math.abs(a - b) < 1e-6;

const holdings = [
  { ticker: "A", assetName: "A", sleeve: "Large Blend", marketValue: 10000, costBasis: 6000 },   // +4000 gain
  { ticker: "B", assetName: "B", sleeve: "Large Blend", marketValue: 12591.98, costBasis: 0 },    // genuine $0 basis → +12591.98
  { ticker: "C", assetName: "C", sleeve: "Cash", marketValue: 50000 },                            // NO basis (undefined) → excluded
];

const cube = app.buildPortfolioCube(holdings);

// cube total reconciles with the sum of per-sleeve gains (the whole point of the fix)
const perSleeve = cube.sleeves.reduce((s, sl) => s + sl.unrealizedGain, 0);
ok(approx(cube.unrealizedGain, perSleeve), `cube gain (${cube.unrealizedGain}) == Σ per-sleeve (${perSleeve})`);

// present-basis holdings (incl. the genuine $0) count; the missing-basis one is excluded
ok(approx(cube.unrealizedGain, 4000 + 12591.98), "gain = 4000 + 12591.98 (both present-basis), C excluded");
ok(approx(cube.noBasisValue, 50000), "noBasisValue = C's market value (50000)");
ok(approx(cube.totalCostBasis, 6000), "totalCostBasis excludes the missing-basis holding");

// the old bug: cube would have been totalValue - Σ(costBasis||0) = 72591.98 - 6000 = 66591.98,
// counting C's full 50000 as gain — the fix must NOT do that.
ok(cube.unrealizedGain < 20000, "missing-basis MV is NOT fabricated as gain (old bug gave ~66591)");

if (failures) { console.error(`\n${failures} portfolio-cube assertion(s) FAILED`); process.exit(1); }
console.log("\nall portfolio-cube assertions passed");
