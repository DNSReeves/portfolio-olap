/**
 * tests/overlay_views.test.js — per-account overlay views (v2.4.2).
 *
 * Pins the client-side math against portfolio_analysis.met()'s conventions:
 * CAGR = (Π(1+r))^(12/n) − 1; vol/downvol = SAMPLE std (ddof=1) ×√12;
 * sortino = CAGR / downvol; mdd on the compounded curve. And the combiner:
 * MV-weighted, null when ANY selected account lacks a view (badge fallback).
 *
 * Wired as part of `npm test`.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

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
const ok = (name, fn) => { fn(); console.log("  ok ", name); };
const approx = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

ok("constant +1%/mo → CAGR (1.01)^12−1, zero downside → sortino NaN-safe", () => {
  const m = app.overlayMetricsFromMonthly(new Array(24).fill(0.01));
  approx(m.cagr, Math.pow(1.01, 12) - 1, 1e-12);
  assert.ok(!Number.isFinite(m.sortino));            // no negative months → no downvol
  approx(m.vol, 0, 1e-12);
  approx(m.mdd, 0, 1e-12);
});

ok("metrics mirror pandas ddof=1 on a mixed series", () => {
  const r = [0.02, -0.03, 0.01, -0.01, 0.04, 0.0, -0.02, 0.03, 0.01, -0.04, 0.02, 0.01];
  const m = app.overlayMetricsFromMonthly(r);
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const std1 = (a) => Math.sqrt(a.reduce((s, x) => s + (x - mean(a)) ** 2, 0) / (a.length - 1));
  const wealth = r.reduce((w, x) => w * (1 + x), 1);
  approx(m.cagr, Math.pow(wealth, 12 / r.length) - 1, 1e-12);
  approx(m.vol, std1(r) * Math.sqrt(12), 1e-12);
  const neg = r.filter((x) => x < 0);
  approx(m.sortino, m.cagr / (std1(neg) * Math.sqrt(12)), 1e-12);
  assert.ok(m.mdd < 0);
});

ok("combine: MV-weighted returns, coverage AND bucket weights", () => {
  const views = {
    A: { mv: 300, coverage: 1.0, monthly: [0.01, 0.02, 0.03], weights: { EQUITY: 0.8, INTL: 0.2 } },
    B: { mv: 100, coverage: 0.8, monthly: [-0.01, 0.0, 0.01], weights: { INTL: 1.0 } },
  };
  const c = app.combineOverlayViews(views, ["A", "B"]);
  approx(c.monthly[0], 0.75 * 0.01 + 0.25 * -0.01);
  approx(c.monthly[2], 0.75 * 0.03 + 0.25 * 0.01);
  approx(c.coverage, 0.75 * 1.0 + 0.25 * 0.8);
  approx(c.weights.EQUITY, 0.75 * 0.8);                 // 60% US
  approx(c.weights.INTL, 0.75 * 0.2 + 0.25 * 1.0);      // 40% intl
  assert.strictEqual(c.n, 2);
});

ok("combine: null when ANY selected account lacks a view (badge fallback)", () => {
  const views = { A: { mv: 300, coverage: 1, monthly: [0.01] } };
  assert.strictEqual(app.combineOverlayViews(views, ["A", "LLC"]), null);
  assert.strictEqual(app.combineOverlayViews(views, []), null);
  assert.strictEqual(app.combineOverlayViews(null, ["A"]), null);
});

console.log("overlay_views: all green");
