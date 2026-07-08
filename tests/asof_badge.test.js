/**
 * tests/asof_badge.test.js — the v2.6.3 "Current as of: MM/DD/YYYY" header badge.
 *
 * The badge states the BOOK's date from the holdings' own valuationDate (broker
 * as-of), never state.valuationDate (initApp resets that to today — an old book
 * must not read as current). Pure seams: bookAsOf / formatMDY / asOfAgeDays.
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

ok("formatMDY: ISO → MM/DD/YYYY (the operator's requested format)", () => {
  assert.strictEqual(app.formatMDY("2026-07-08"), "07/08/2026");
  assert.strictEqual(app.formatMDY("2026-12-31"), "12/31/2026");
  assert.strictEqual(app.formatMDY("garbage"), "garbage");     // non-ISO passes through
  assert.strictEqual(app.formatMDY(""), "");
});

ok("bookAsOf: newest date wins, mixed dates flagged, empty → null", () => {
  assert.strictEqual(app.bookAsOf([]), null);
  assert.strictEqual(app.bookAsOf([{ ticker: "A" }]), null);   // no valuationDate carried
  // field-wise compares — vm-context objects have a foreign prototype, so deepStrictEqual rejects them
  const uniform = app.bookAsOf([
    { valuationDate: "2026-07-08" }, { valuationDate: "2026-07-08" }]);
  assert.strictEqual(uniform.date, "2026-07-08");
  assert.strictEqual(uniform.minDate, "2026-07-08");
  assert.strictEqual(uniform.mixed, false);
  const mixed = app.bookAsOf([
    { valuationDate: "2026-06-18" }, { valuationDate: "2026-07-08" }]);
  assert.strictEqual(mixed.date, "2026-07-08");
  assert.strictEqual(mixed.minDate, "2026-06-18");
  assert.strictEqual(mixed.mixed, true);
});

ok("asOfAgeDays: noon-anchored day count + the >14d staleness boundary", () => {
  assert.strictEqual(app.asOfAgeDays("2026-07-08", "2026-07-08"), 0);
  assert.strictEqual(app.asOfAgeDays("2026-07-07", "2026-07-08"), 1);
  assert.strictEqual(app.asOfAgeDays("2026-06-24", "2026-07-08"), 14);  // boundary: not yet stale
  assert.strictEqual(app.asOfAgeDays("2026-06-23", "2026-07-08"), 15);  // stale
});

console.log("asof_badge: all green");
