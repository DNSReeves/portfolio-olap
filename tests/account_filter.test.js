/**
 * tests/account_filter.test.js — account-source toggles (v2.4).
 *
 * The filter composes UPSTREAM of the sleeve selection: filterByAccounts() feeds the cube and
 * every client-computed panel (via the stateful visibleHoldings() wrapper). Covers: key /
 * visibility semantics (incl. the "(No account)" bucket), cube totals responding to a hidden
 * account, the Self/Advisor preset split, and accountFilterActiveFor() ignoring stale persisted
 * names that no longer exist in the book. Exercises the PURE seams — top-level function
 * declarations are reachable from the vm harness; app consts/state are not.
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

const H = (ticker, mv, account) => ({
  ticker, assetName: ticker, shares: 1, price: mv, marketValue: mv,
  sleeve: "Large Blend", brokerageAccount: account,
});

// a small mixed book: two self accounts, one advisor account, one unlabeled row
const BOOK = [
  H("AAA", 100, "DNSR-IRA"),
  H("BBB", 200, "Bond Account"),
  H("CCC", 400, "Living Trust"),           // advisorAccounts() member
  H("DDD", 50, ""),                        // unlabeled → "(No account)"
];

// ── key / visibility semantics ──────────────────────────────────────────────
check("accountKey labels the unlabeled bucket", app.accountKey(H("X", 1, "")) === "(No account)");
check("no hidden set → same array back (fast path)",
  app.filterByAccounts(BOOK, new Set()) === BOOK);

const hidLT = new Set(["Living Trust"]);
check("hiding an account removes exactly its rows",
  app.filterByAccounts(BOOK, hidLT).map((h) => h.ticker).join(",") === "AAA,BBB,DDD");
check("filter active when a hidden account exists in the book",
  app.accountFilterActiveFor(BOOK, hidLT) === true);

const stale = new Set(["A ghost account from an old import"]);
check("stale persisted name does not flag an active filter",
  app.accountFilterActiveFor(BOOK, stale) === false);
check("stale hidden name excludes nothing", app.filterByAccounts(BOOK, stale).length === 4);

check("the unlabeled bucket is itself toggleable",
  app.filterByAccounts(BOOK, new Set(["(No account)"])).length === 3);

// ── the cube respects the filter (totals shrink by the hidden MV) ───────────
const cube = app.buildPortfolioCube(app.filterByAccounts(BOOK, hidLT));
check("cube total excludes the hidden account", cube.totalValue === 350);

// ── distinct accounts + preset split ────────────────────────────────────────
const names = app.distinctAccountsOf(BOOK).map(([k]) => k);
check("distinctAccountsOf sorted by market value", names[0] === "Living Trust");
const ADV = app.advisorAccounts();
const advisor = names.filter((n) => ADV.has(n));
const self = names.filter((n) => !ADV.has(n));
check("advisor preset captures the advisor account", advisor.join(",") === "Living Trust");
check("self preset captures the rest incl. unlabeled",
  self.sort().join(",") === "(No account),Bond Account,DNSR-IRA");
check("advisor set carries all four managed accounts", ADV.size === 4
  && ADV.has("Partnership") && ADV.has("Fidelity_AQR_FLEX45_Portfolio")
  && ADV.has("Limit Liability Company"));

// ── today() regression (2026-07-06 review): LOCAL date, never the UTC-rolled tomorrow ──
const d = new Date();
const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
check("today() is the local calendar date", app.today() === local);

if (failures) { console.error(`account_filter: ${failures} failure(s)`); process.exit(1); }
console.log("account_filter: all green");
