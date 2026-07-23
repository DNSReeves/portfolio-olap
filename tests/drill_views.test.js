/**
 * tests/drill_views.test.js — v2.5 drill-down seams.
 *
 * Covers the pure functions behind the new drill-down features: sortHoldingsGroups (column
 * sort semantics incl. the assumed-basis gain-$0 convention and deterministic tiebreaks),
 * treemapLayout (squarified geometry — area conservation, bounds, proportionality),
 * donutBreakdown (sleeve-vs-holding dimension pick, Other folding, shorts excluded),
 * gainColor (diverging scale endpoints + null), forgeTickerUrl (ts.net :8443 vs LAN :8765)
 * and isChartableTicker. Exercises the PURE seams — top-level function declarations are
 * reachable from the vm harness; app consts/state are not.
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

const G = (ticker, marketValue, costBasis, extra = {}) => ({
  ticker, assetName: extra.assetName || ticker, sleeve: extra.sleeve || "Large Blend",
  shares: extra.shares || 0, costBasis, marketValue, lots: [], basisAssumed: !!extra.assumed,
});

/* ── sortHoldingsGroups ── */
{
  const rows = [G("SPY", 500, 400), G("AGG", 200, 210), G("IBIT", 300, 100), G("ANNU", 100, null, { assumed: true })];
  const byValDesc = app.sortHoldingsGroups(rows, "value", -1).map((g) => g.ticker);
  check("sort value desc = SPY,IBIT,AGG,ANNU", byValDesc.join() === "SPY,IBIT,AGG,ANNU");
  const byValAsc = app.sortHoldingsGroups(rows, "value", 1).map((g) => g.ticker);
  check("sort value asc reverses", byValAsc.join() === "ANNU,AGG,IBIT,SPY");
  const byTicker = app.sortHoldingsGroups(rows, "ticker", 1).map((g) => g.ticker);
  check("sort ticker asc = AGG,ANNU,IBIT,SPY", byTicker.join() === "AGG,ANNU,IBIT,SPY");
  const byGainDesc = app.sortHoldingsGroups(rows, "gain", -1).map((g) => g.ticker);
  // gains: IBIT +200, SPY +100, ANNU 0 (assumed → $0 by convention), AGG −10
  check("sort gain desc respects assumed-basis $0", byGainDesc.join() === "IBIT,SPY,ANNU,AGG");
  const orig = rows.map((g) => g.ticker).join();
  app.sortHoldingsGroups(rows, "gain", -1);
  check("sort does not mutate the input array", rows.map((g) => g.ticker).join() === orig);
  const tied = [G("BBB", 100, 100), G("AAA", 100, 100)];
  check("value tie breaks by ticker", app.sortHoldingsGroups(tied, "value", -1)[0].ticker === "AAA");
  const shares = [G("XX", 100, 90, { shares: 10 }), G("YY", 100, 90, { shares: 2 })];
  // derived price: XX $10, YY $50
  check("sort by derived price", app.sortHoldingsGroups(shares, "price", -1)[0].ticker === "YY");
  check("unknown key falls back to value", app.sortHoldingsGroups(rows, "bogus", -1)[0].ticker === "SPY");
}

/* ── treemapLayout ── */
{
  const items = [{ n: "a", value: 6 }, { n: "b", value: 6 }, { n: "c", value: 4 }, { n: "d", value: 3 }, { n: "e", value: 2 }, { n: "f", value: 2 }, { n: "g", value: 1 }];
  const W = 600, H = 400;
  const rects = app.treemapLayout(items, W, H);
  check("treemap keeps every positive item", rects.length === items.length);
  const area = rects.reduce((t, r) => t + r.w * r.h, 0);
  check("treemap conserves total area", Math.abs(area - W * H) < 1);
  check("treemap stays in bounds", rects.every((r) =>
    r.x > -1e-6 && r.y > -1e-6 && r.x + r.w < W + 1e-6 && r.y + r.h < H + 1e-6));
  const total = items.reduce((t, i) => t + i.value, 0);
  const propOk = rects.every((r) => Math.abs(r.w * r.h - (r.value / total) * W * H) < 1);
  check("tile area proportional to value", propOk);
  check("treemap drops zero/negative values", app.treemapLayout([{ value: 5 }, { value: 0 }, { value: -3 }], 100, 100).length === 1);
  check("treemap empty input → []", app.treemapLayout([], 100, 100).length === 0);
  const solo = app.treemapLayout([{ value: 7 }], 300, 200);
  check("single item fills the board", solo.length === 1 && Math.abs(solo[0].w - 300) < 1e-6 && Math.abs(solo[0].h - 200) < 1e-6);
}

/* ── donutBreakdown ── */
{
  const multi = [
    { sleeve: "Large Blend", ticker: "SPY", marketValue: 500 },
    { sleeve: "Large Blend", ticker: "VOO", marketValue: 100 },
    { sleeve: "Core Bond", ticker: "AGG", marketValue: 300 },
    { sleeve: "Core Bond", ticker: "SHRT", marketValue: -50 },
  ];
  const d1 = app.donutBreakdown(multi);
  check("multi-sleeve view → Sleeve dimension", d1.dim === "Sleeve");
  check("sleeve slices aggregate + exclude shorts",
    d1.slices.length === 2 && d1.slices[0].label === "Large Blend" && d1.slices[0].value === 600 && d1.slices[1].value === 300);
  const single = [
    { sleeve: "Large Blend", ticker: "SPY", marketValue: 500 },
    { sleeve: "Large Blend", ticker: "VOO", marketValue: 100 },
  ];
  const d2 = app.donutBreakdown(single);
  check("single-sleeve view → Holding dimension", d2.dim === "Holding" && d2.slices[0].label === "SPY");
  const many = Array.from({ length: 20 }, (_, i) => ({ sleeve: "S", ticker: `T${String(i).padStart(2, "0")}`, marketValue: 100 - i }));
  const d3 = app.donutBreakdown(many, 14);
  check("long tail folds into Other", d3.slices.length === 14 && d3.slices[13].other === true);
  const foldedTotal = d3.slices.reduce((t, s) => t + s.value, 0);
  check("Other conserves the total", foldedTotal === many.reduce((t, m) => t + m.marketValue, 0));
}

/* ── gainColor ── */
{
  check("gainColor null → neutral slate", app.gainColor(null) === "rgb(91,100,114)");
  check("gainColor 0 → neutral slate", app.gainColor(0) === "rgb(91,100,114)");
  check("gainColor +30% saturates green", app.gainColor(0.30) === "rgb(22,128,61)" && app.gainColor(2.0) === "rgb(22,128,61)");
  check("gainColor −30% saturates red", app.gainColor(-0.30) === "rgb(190,42,42)" && app.gainColor(-0.9) === "rgb(190,42,42)");
  const mid = app.gainColor(0.15);
  check("gainColor midpoint is between", mid !== app.gainColor(0) && mid !== app.gainColor(0.30));
}

/* ── renderDrillChart smoke: both chart branches must EXECUTE without throwing ──
   Regression for the blank-donut bug (2026-07-07): the donut branch referenced PALETTE,
   which was local to renderPivot — a ReferenceError after the table was hidden left the
   drill-down panel empty. The proxy DOM absorbs the output; what's tested is that every
   expression in each branch resolves. */
{
  const rows = [
    G("SPY", 500, 400, { sleeve: "Large Blend" }),
    G("VXUS", 300, 350, { sleeve: "International" }),
    G("ANNU", 100, null, { assumed: true, sleeve: "Annuity / Stable Value" }),
    G("SHRT", -50, 0, { sleeve: "Options" }),
  ];
  for (const view of ["donut", "treemap", "table"]) {
    let threw = null;
    try { app.renderDrillChart(rows, view); } catch (e) { threw = e; }
    check(`renderDrillChart(${view}) executes without throwing`, threw === null || (() => { console.error(`      ↳ ${threw}`); return false; })());
  }
  // >MAX_TILES treemap path (Other folding) and the single-sleeve donut path too
  const many = Array.from({ length: 70 }, (_, i) => G(`T${String(i).padStart(2, "0")}`, 1000 - i, 900, { sleeve: "Large Blend" }));
  let threw = null;
  try { app.renderDrillChart(many, "treemap"); app.renderDrillChart(many, "donut"); } catch (e) { threw = e; }
  check("renderDrillChart handles 70-row books (Other folding, by-holding donut)", threw === null);
}

/* ── forgeTickerUrl + isChartableTicker ── */
{
  const ts = { hostname: "davids-mac-mini.tail5074b4.ts.net", protocol: "https:" };
  const lan = { hostname: "192.168.1.70", protocol: "http:" };
  check("ts.net origin → TLS :8443 front",
    app.forgeTickerUrl("charts", "SPY", ts) === "https://davids-mac-mini.tail5074b4.ts.net:8443/forge#charts=SPY");
  check("LAN origin → plain :8765",
    app.forgeTickerUrl("etf", "AGG", lan) === "http://192.168.1.70:8765/forge#etf=AGG");
  check("chartable: plain symbols yes", ["SPY", "A", "IBIT", "QQQ"].every(app.isChartableTicker));
  // SWVXX moved to the NO list 2026-07-16 (ef7bae3, the consistent click rule):
  // 5-letter X-suffix = mutual-fund pattern — no MarketForge ETF chart exists,
  // so the click falls back to sleeve-scope by design. The test lagged the code
  // for a week (iss_f84c10e4).
  check("chartable: CUSIPs/placeholders/mutual-funds/blank no",
    ["91282CJZ5", "-", "", "SPY 250117C00600000", "BRK.B", "SWVXX", null].every((t) => !app.isChartableTicker(t)));
}

process.exit(failures ? 1 : 0);
