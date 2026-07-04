/**
 * tests/column_mapping.test.js — P3-36 (2026-07-03) column-detection regression.
 *
 * The old single-pass detectColumnMapping let a substring alias win over an exact
 * one and let a header serve two fields: Fidelity's "Account Name" was claimed as
 * the asset NAME (because "account name".includes("name")), and a Schwab
 * "% of Acct (% of Account)" column was claimed as the account. This exercises the
 * two-pass / priority / claim-once / ignore-"%" fix against the real fixtures.
 *
 * OLAP has no test framework; this is a standalone Node script. Run:
 *   node tests/column_mapping.test.js     (also wired as `npm test`)
 *
 * app.js boots the DOM at load, so we run it in a vm sandbox with no-op browser
 * globals and pull the (hoisted) pure functions out of the context.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

function loadApp() {
  const src = fs.readFileSync(path.join(__dirname, "..", "src", "app.js"), "utf8");
  const proxy = new Proxy(function () {}, { get: () => proxy, apply: () => proxy, construct: () => proxy, set: () => true });
  const sandbox = {
    document: proxy, window: proxy, indexedDB: proxy, localStorage: proxy, navigator: proxy,
    location: proxy, fetch: proxy, confirm: () => true, setTimeout: () => 0, clearTimeout: () => 0, console,
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  try { vm.runInContext(src, sandbox, { filename: "app.js" }); } catch (_) { /* DOM boot no-ops under the proxy; pure fns are hoisted */ }
  return sandbox;
}

const app = loadApp();
let failures = 0;
function eq(actual, expected, msg) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) { failures += 1; console.error(`✗ ${msg}\n   expected ${e}\n   got      ${a}`); }
  else console.log(`✓ ${msg}`);
}
const detect = (headerLine) => app.detectColumnMapping(headerLine.split(","));

// ── fixtures/fidelity_positions_2026-04-30.csv — the headline P3-36 case ──
const fid = detect("Account Name,Ticker,Security Name,Shares,Last Price,Current Value,Total Cost,Statement Date");
eq(fid.assetName, "Security Name", "fidelity fixture: assetName = Security Name (NOT Account Name)");
eq(fid.account, "Account Name", "fidelity fixture: account = Account Name");
eq(fid.ticker, "Ticker", "fidelity fixture: ticker = Ticker");
eq(fid.marketValue, "Current Value", "fidelity fixture: marketValue = Current Value");
eq(fid.costBasis, "Total Cost", "fidelity fixture: costBasis = Total Cost");
eq(fid.valuationDate, "Statement Date", "fidelity fixture: valuationDate = Statement Date");

// ── real Fidelity export header (Account Number + Account Name + Symbol + Description) ──
const realFid = detect("Account Number,Account Name,Symbol,Description,Quantity,Last Price,Current Value,Total Gain/Loss Dollar");
eq(realFid.assetName, "Description", "real fidelity: assetName = Description (NOT Account Name)");
eq(realFid.ticker, "Symbol", "real fidelity: ticker = Symbol");
if (realFid.assetName === "Account Name" || realFid.assetName === "Account Number") { failures += 1; console.error("✗ real fidelity: assetName must not be an account column"); }

// ── fixtures/schwab_positions_2026-03-31.csv ──
const sch = detect("Account,Symbol,Description,Quantity,Price,Market Value,Cost Basis,As Of Date");
eq(sch.account, "Account", "schwab fixture: account = Account");
eq(sch.ticker, "Symbol", "schwab fixture: ticker = Symbol");
eq(sch.assetName, "Description", "schwab fixture: assetName = Description");
eq(sch.valuationDate, "As Of Date", "schwab fixture: valuationDate = As Of Date");

// ── a Schwab-style percentage column must never be claimed as `account` (P3-36) ──
const pct = detect("Symbol,Description,Quantity,Price,Market Value,Cost Basis,% of Acct (% of Account),As Of Date");
eq(pct.account, undefined, "percent column: `% of Acct (% of Account)` is NOT claimed as account");
eq(pct.assetName, "Description", "percent column: assetName still = Description");
eq(pct.marketValue, "Market Value", "percent column: marketValue = Market Value");

// ── fixtures/generic_positions_no_valuation_date.csv ──
const gen = detect("Brokerage Account,Ticker,Asset Name,Shares,Share Price,Market Value,Cost Basis,Sleeve");
eq(gen.account, "Brokerage Account", "generic fixture: account = Brokerage Account");
eq(gen.assetName, "Asset Name", "generic fixture: assetName = Asset Name");
eq(gen.sleeve, "Sleeve", "generic fixture: sleeve = Sleeve");

// ── a header is never claimed by two fields ──
const claimed = Object.values(fid);
eq(claimed.length, new Set(claimed).size, "fidelity fixture: no header claimed by two fields");

if (failures) { console.error(`\n${failures} assertion(s) FAILED`); process.exit(1); }
console.log("\nall column-mapping assertions passed");
