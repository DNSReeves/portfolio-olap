/**
 * tests/assumed_basis.test.js — assumed cost basis + history export (v2.4.4).
 *
 * Operator convention: missing basis → assume = current value (gain $0), footnoted,
 * flag persisted into snapshot history. Pure seams via the vm harness.
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

ok("missing basis → assumed = market value, flagged; real basis untouched", () => {
  const hs = [
    { ticker: "A", marketValue: 1000, costBasis: null },
    { ticker: "B", marketValue: 500, costBasis: 400 },
    { ticker: "C", marketValue: 200, costBasis: 0 },          // legitimate $0 basis stays
    { ticker: "D", marketValue: null, costBasis: null },      // no MV → nothing to assume
  ];
  app.applyAssumedBasis(hs);
  assert.strictEqual(hs[0].costBasis, 1000);
  assert.strictEqual(hs[0].basisAssumed, true);
  assert.strictEqual(hs[1].costBasis, 400);
  assert.strictEqual(hs[1].basisAssumed, undefined);
  assert.strictEqual(hs[2].costBasis, 0);
  assert.strictEqual(hs[2].basisAssumed, undefined);
  assert.strictEqual(hs[3].costBasis, null);
  // idempotent: a second pass changes nothing
  app.applyAssumedBasis(hs);
  assert.strictEqual(hs[0].costBasis, 1000);
});

ok("glCell: assumed rows show the * footnote, gain $0", () => {
  const cell = app.glCell(1000, 1000, false, true);
  assert.ok(cell.includes("basisNote") && cell.includes("*"), "footnote marker missing");
  assert.ok(cell.includes("$0"), "assumed gain must read $0");
  assert.ok(!app.glCell(1000, 800, false, false).includes("basisNote"));
});

ok("history export: shape, sort, basisAssumed carried", () => {
  const snaps = [
    { id: "s2", portfolioId: "p", valuationDate: "2026-07-01" },
    { id: "s1", portfolioId: "p", valuationDate: "2026-06-18" },
  ];
  const vals = [
    { snapshotId: "s1", valuationDate: "2026-06-18", brokerageAccount: "RMD Receiver",
      ticker: "QUAL", assetName: "iShares MSCI USA Quality", shares: 100, price: 316,
      marketValue: 31605, costBasis: 31605, basisAssumed: true, sleeveName: "Large Blend" },
  ];
  const out = app.buildHistoryExport(snaps, vals);
  assert.strictEqual(out.snapshots[0].valuationDate, "2026-06-18");   // sorted ascending
  assert.strictEqual(out.valuations[0].basisAssumed, true);
  assert.strictEqual(out.valuations[0].account, "RMD Receiver");
  assert.ok(out.note.includes("auto-saved"));
});

console.log("assumed_basis: all green");
