/**
 * tests/book_over_time.test.js — Book Over Time panel (v2.7, 2026-07-23).
 *
 * Pins the PURE seams the chart trusts: botRoster's fixed MV-desc order with
 * the >7 "Other" fold (color-follows-entity depends on order stability),
 * botSliceValue's Other-remainder math, and botFmt. The SVG render is
 * DOM-bound (node --check + live use cover it).
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

const accounts9 = new Map([["A1", 900], ["A2", 800], ["A3", 700], ["A4", 600], ["A5", 500],
                           ["A6", 400], ["A7", 300], ["A8", 200], ["A9", 100]]);

const roster = app.botRoster(accounts9);
check("9 entities fold to 7 + Other", roster.length === 8 && roster[7] === "Other");
check("roster is MV-desc order", roster[0] === "A1" && roster[6] === "A7");
check("roster order stable across calls",
  JSON.stringify(roster) === JSON.stringify(app.botRoster(accounts9)));

check("Other = folded remainder", app.botSliceValue(accounts9, "Other", roster) === 300);
check("named entity reads through", app.botSliceValue(accounts9, "A3", roster) === 700);

const sleeves2 = new Map([["Large Blend", 3000], ["Bond", 1450]]);
const sr = app.botRoster(sleeves2);
check("≤7 entities: no Other", sr.length === 2 && !sr.includes("Other"));
check("missing entity is 0, not NaN", app.botSliceValue(sleeves2, "Ghost", sr) === 0);

check("fmt millions", app.botFmt(16811609) === "$16.81M");
check("fmt thousands", app.botFmt(4500) === "$5k");
check("fmt negative", app.botFmt(-146000) === "$-146k");

// ── server-history merge (2026-07-23 follow-up: IndexedDB is per-browser; the
// history/ archives are the durable record — merged, local wins on date) ─────
const hist = [
  { date: "2026-06-18", total: 100, accounts: { X: 60, Y: 40 }, sleeves: { S: 100 } },
  { date: "2026-07-23", total: 130, accounts: { X: 70, Y: 60 }, sleeves: { S: 130 } },
];
const local = [
  { date: "2026-07-23", total: 131, accounts: new Map([["X", 71], ["Y", 60]]), sleeves: new Map([["S", 131]]) },
];
const merged = app.botMergeTimeline(local, hist);
check("merge: union of dates, sorted", merged.length === 2 && merged[0].date === "2026-06-18");
check("merge: local wins on same date", merged[1].total === 131 && merged[1].accounts.get("X") === 71);
check("merge: server rows become Map-shaped buckets",  // instanceof fails cross-realm (vm)
  typeof merged[0].accounts.get === "function" && merged[0].accounts.get("X") === 60);
check("merge: empty local → pure server", app.botMergeTimeline([], hist).length === 2);
check("merge: empty server → pure local", app.botMergeTimeline(local, []).length === 1);

// ── priority roster (2026-07-23 live report: self-managed must not fold) ────
const pri = new Set(["A8", "A9"]);            // the two smallest are self-managed
const priRoster = app.botRoster(accounts9, pri);
check("priority members lead the roster", priRoster[0] === "A8" && priRoster[1] === "A9");
check("priority members never fold", !priRoster.includes("Other") || (priRoster.includes("A8") && priRoster.includes("A9")));
check("non-priority tail folds instead", priRoster[7] === "Other" && !priRoster.includes("A7"));
check("no priority set → pure MV order", app.botRoster(accounts9)[0] === "A1");


// ── splitter fit-to-content seams (2026-07-23 operator ask) ─────────────────
// fitSplitToContent is DOM-bound, but its clamp inputs are pure: verify the
// constants + clamp behavior the fit relies on.
check("split min respected by clamp", app.clamp(50, 180, 800) === 180);
check("split content fits when under max", app.clamp(430, 180, 800) === 430);
check("split caps at max (internal scroll takes over)", app.clamp(2400, 180, 800) === 800);

process.exit(failures ? 1 : 0);
