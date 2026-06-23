const APP_VERSION = "v2.2";

const DEFAULT_SLEEVES = [
  "Equity",
  "Public Equity",
  "Private Equity",
  "Buyout",
  "Growth Equity",
  "Venture Capital",
  "Secondaries",
  "Commodities",
  "Precious Metals",
  "Broad Commodities",
  "Alternatives",
  "Liquid Alternatives",
  "Managed Futures",
  "Trend Following",
  "Trend Following Managed Futures",
  "Large Value",
  "Large Blend",
  "Large Growth",
  "Large Cap Tech",
  "Large Cap Growth",
  "Mid-Cap Value",
  "Mid-Cap Blend",
  "Mid-Cap Growth",
  "Small Value",
  "Small Blend",
  "Small Growth",
  "International",
  "Foreign Large Value",
  "Foreign Large Blend",
  "Foreign Large Growth",
  "Foreign Small/Mid Value",
  "Foreign Small/Mid Blend",
  "Foreign Small/Mid Growth",
  "Emerging Markets",
  "Sector Equity",
  "Communications",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Equity Energy",
  "Equity Precious Metals",
  "Industrials",
  "Infrastructure",
  "Natural Resources",
  "Technology",
  "Health",
  "Financial",
  "Real Estate",
  "Utilities",
  "Miscellaneous Sector",
  "Core / Multisector Bonds",
  "Junk Bonds",
  "Corporate Bonds",
  "Municipal Bonds",
  "Treasuries / Duration",
  "Bank Loans / Floating Rate",
  "Bonds / Credit",
  "Bonds",
  "Private Credit",
  "Direct Lending",
  "CDs",
  "Annuity / Stable Value",
  "Cash",
  "Private Alternatives",
  "Real Assets",
  "Other",
  "Other / Unclassified",
  "Unclassified",
];

const SAMPLE_HOLDINGS = [
  holding("AAPL", "Apple Inc.", 80, 192.32, "Large Cap Tech", 11200),
  holding("MSFT", "Microsoft Corp.", 44, 424.56, "Large Cap Tech", 14600),
  holding("VUG", "Vanguard Growth ETF", 65, 366.8, "Large Cap Growth", 20100),
  holding("VXUS", "Vanguard Total International Stock ETF", 220, 63.12, "International", 12650),
  holding("EEM", "iShares MSCI Emerging Markets ETF", 180, 42.73, "Emerging Markets", 7200),
  holding("GLD", "SPDR Gold Shares", 55, 214.18, "Precious Metals", 10100),
  holding("DBMF", "iMGP DBi Managed Futures Strategy ETF", 280, 27.18, "Trend Following Managed Futures", 7350),
];

const LARGE_SAMPLE_HOLDINGS = buildLargeSampleHoldings();

const COLUMN_ALIASES = {
  account: ["account", "account name", "brokerage account"],
  ticker: ["ticker", "symbol", "security symbol"],
  assetName: ["name", "description", "security", "asset name", "security name"],
  shares: ["shares", "quantity", "qty", "current shares"],
  price: ["price", "last price", "current price", "share price", "market price"],
  marketValue: ["market value", "value", "current value"],
  sleeve: ["sleeve", "category", "asset class", "strategy"],
  costBasis: ["cost basis", "total cost", "basis", "cost"],
  beta: ["beta"],
  valuationDate: ["valuation date", "as of date", "as-of date", "statement date", "price date", "date"],
};

const TICKER_RULES = [
  { sleeve: "Large Cap Tech", tickers: ["AAPL", "MSFT", "NVDA", "GOOGL", "GOOG", "META", "AMZN", "AVGO"], words: ["technology", "software", "semiconductor"] },
  { sleeve: "Large Growth", tickers: ["VUG", "QQQ", "QQQM", "IWF", "SCHG", "SPYG", "VOOG"], words: ["large growth"] },
  { sleeve: "Large Blend", tickers: ["SPY", "VOO", "IVV", "VTI", "ITOT", "SCHB"], words: ["large blend", "total stock market"] },
  { sleeve: "Large Value", tickers: ["VTV", "IVE", "IWD", "SCHV"], words: ["large value"] },
  { sleeve: "Mid-Cap Growth", tickers: ["VOT", "IWP", "MDYG"], words: ["mid cap growth", "mid-cap growth"] },
  { sleeve: "Mid-Cap Blend", tickers: ["VO", "IJH", "IWR", "SCHM"], words: ["mid cap blend", "mid-cap blend"] },
  { sleeve: "Mid-Cap Value", tickers: ["VOE", "IWS", "MDYV"], words: ["mid cap value", "mid-cap value"] },
  { sleeve: "Small Growth", tickers: ["VBK", "IWO", "IJT"], words: ["small growth"] },
  { sleeve: "Small Blend", tickers: ["VB", "IWM", "IJR", "SCHA"], words: ["small blend"] },
  { sleeve: "Small Value", tickers: ["VBR", "IWN", "IJS", "AVUV"], words: ["small value"] },
  { sleeve: "Precious Metals", tickers: ["GLD", "IAU", "SLV", "SGOL"], words: ["gold", "silver", "precious metals"] },
  { sleeve: "Broad Commodities", tickers: ["DBC", "PDBC", "USO"], words: ["commodity", "commodities", "broad basket"] },
  { sleeve: "Trend Following Managed Futures", tickers: ["DBMF"], words: ["trend following managed futures"] },
  { sleeve: "Managed Futures", tickers: ["KMLM", "CTA", "FMF"], words: ["managed futures"] },
  { sleeve: "Trend Following", tickers: ["TFPN", "RSST"], words: ["trend following", "trend"] },
  { sleeve: "International", tickers: ["VXUS"], words: ["international", "developed markets"] },
  { sleeve: "Foreign Large Blend", tickers: ["VEA", "IEFA", "SCHF", "EFA"], words: ["foreign large blend"] },
  { sleeve: "Foreign Large Growth", tickers: ["EFG", "VIGI"], words: ["foreign large growth"] },
  { sleeve: "Foreign Large Value", tickers: ["EFV", "IVLU"], words: ["foreign large value"] },
  { sleeve: "Foreign Small/Mid Blend", tickers: ["VSS", "SCZ", "SCHC"], words: ["foreign small mid", "foreign small/mid blend"] },
  { sleeve: "Emerging Markets", tickers: ["EEM", "VWO", "IEMG", "SCHE"], words: ["emerging"] },
  { sleeve: "Communications", tickers: ["XLC", "VOX", "IYZ"], words: ["communications sector"] },
  { sleeve: "Consumer Cyclical", tickers: ["XLY", "VCR", "IYC"], words: ["consumer cyclical", "consumer discretionary"] },
  { sleeve: "Consumer Defensive", tickers: ["XLP", "VDC", "IYK"], words: ["consumer defensive", "consumer staples"] },
  { sleeve: "Equity Energy", tickers: ["XLE", "VDE", "IYE"], words: ["energy sector", "equity energy"] },
  { sleeve: "Equity Precious Metals", tickers: ["GDX", "GDXJ", "RING"], words: ["equity precious metals", "gold miners"] },
  { sleeve: "Industrials", tickers: ["XLI", "VIS", "IYJ"], words: ["industrials sector"] },
  { sleeve: "Infrastructure", tickers: ["IGF", "PAVE", "IFRA"], words: ["infrastructure"] },
  { sleeve: "Natural Resources", tickers: ["IGE", "GNR", "NANR"], words: ["natural resources"] },
  { sleeve: "Technology", tickers: ["XLK", "VGT", "IYW", "FTEC"], words: ["technology sector"] },
  { sleeve: "Health", tickers: ["XLV", "VHT", "IYH"], words: ["health sector", "healthcare"] },
  { sleeve: "Financial", tickers: ["XLF", "VFH", "IYF"], words: ["financial sector"] },
  { sleeve: "Real Estate", tickers: ["VNQ", "IYR", "XLRE", "SCHH"], words: ["real estate", "reit"] },
  { sleeve: "Utilities", tickers: ["XLU", "VPU", "IDU"], words: ["utilities sector"] },
  { sleeve: "Junk Bonds", tickers: ["HYG", "JNK", "USHY", "SJNK", "HYLB", "ANGL"], words: ["high yield", "junk bond", "below investment grade"] },
  { sleeve: "Corporate Bonds", tickers: ["LQD", "VCIT", "VCLT", "IGIB", "IGSB", "VTC"], words: ["corporate bond", "investment grade corporate"] },
  { sleeve: "Municipal Bonds", tickers: ["MUB", "VTEB", "TFI", "PZA", "HYD", "SHM"], words: ["municipal", "muni", "tax exempt"] },
  { sleeve: "Core / Multisector Bonds", tickers: ["BND", "AGG", "TLT", "IEF", "SHY", "TIP"], words: ["bond", "treasury", "fixed income"] },
  { sleeve: "Direct Lending", tickers: ["BIZD", "PSP"], words: ["direct lending", "middle market lending"] },
  { sleeve: "Private Credit", tickers: ["PC", "PRCR"], words: ["private credit", "private debt"] },
  { sleeve: "Cash", tickers: ["CASH", "SWVXX", "SPAXX", "VMFXX", "FDRXX", "BIL", "SGOV"], words: ["cash", "money market"] },
];

// Shared classifier rules — single source of truth with portfolio_analysis.py.
// Loaded from ./classification_rules.json at boot (see loadClassificationRules / initApp).
// When present it supersedes the legacy TICKER_RULES above; if the fetch fails the app
// degrades gracefully to TICKER_RULES so classification never hard-breaks.
let CLASSIFICATION_RULES = null;

async function loadClassificationRules() {
  try {
    const res = await fetch("./classification_rules.json", { cache: "no-store" });
    if (res.ok) CLASSIFICATION_RULES = await res.json();
  } catch (error) {
    CLASSIFICATION_RULES = null; // legacy TICKER_RULES fallback
  }
}

// Precomputed Sortino-overlay backtest (portfolio_analysis.py → overlay_snapshot.json).
// The overlay needs the dnsr-agent price warehouse so it can't run in-browser; this is a
// read-only snapshot. Absent file → the overlay panel hides itself.
let OVERLAY_SNAPSHOT = null;

async function loadOverlaySnapshot() {
  try {
    const res = await fetch("./overlay_snapshot.json", { cache: "no-store" });
    if (res.ok) OVERLAY_SNAPSHOT = await res.json();
  } catch (error) {
    OVERLAY_SNAPSHOT = null;
  }
}

// Precomputed two-bucket dial grid (portfolio_analysis.py::export_dial_snapshot).
let DIAL_SNAPSHOT = null;

async function loadDialSnapshot() {
  try {
    const res = await fetch("./dial_snapshot.json", { cache: "no-store" });
    if (res.ok) DIAL_SNAPSHOT = await res.json();
  } catch (error) {
    DIAL_SNAPSHOT = null;
  }
}

// Per-ETF look-through region exposure (portfolio_analysis.py::export_region_exposure):
// { TICKER: { "US": pct, "Foreign Developed": pct, "Emerging Markets": pct, "Other": pct } }.
// Joined by ticker for the Pivot panel's weighted Region dimension.
let REGION_EXPOSURE = {};

async function loadRegionExposure() {
  try {
    const res = await fetch("./region_exposure.json", { cache: "no-store" });
    if (res.ok) {
      const raw = await res.json();
      REGION_EXPOSURE = {};
      for (const [t, dist] of Object.entries(raw || {})) REGION_EXPOSURE[String(t).toUpperCase()] = dist;
    }
  } catch (error) {
    REGION_EXPOSURE = {};
  }
}

const SLEEVE_PARENTS = {
  "Public Equity": "Equity",
  "Private Equity": "Equity",
  "Buyout": "Private Equity",
  "Growth Equity": "Private Equity",
  "Venture Capital": "Private Equity",
  "Secondaries": "Private Equity",
  "Large Value": "Public Equity",
  "Large Blend": "Public Equity",
  "Large Growth": "Public Equity",
  "Large Cap Tech": "Public Equity",
  "Large Cap Growth": "Public Equity",
  "Mid-Cap Value": "Public Equity",
  "Mid-Cap Blend": "Public Equity",
  "Mid-Cap Growth": "Public Equity",
  "Small Value": "Public Equity",
  "Small Blend": "Public Equity",
  "Small Growth": "Public Equity",
  "International": "Public Equity",
  "Foreign Large Value": "Public Equity",
  "Foreign Large Blend": "Public Equity",
  "Foreign Large Growth": "Public Equity",
  "Foreign Small/Mid Value": "Public Equity",
  "Foreign Small/Mid Blend": "Public Equity",
  "Foreign Small/Mid Growth": "Public Equity",
  "Emerging Markets": "Public Equity",
  "Diversified Emerging Markets": "Public Equity",
  "Sector Equity": "Public Equity",
  "Communications": "Sector Equity",
  "Consumer Cyclical": "Sector Equity",
  "Consumer Defensive": "Sector Equity",
  "Equity Energy": "Sector Equity",
  "Equity Precious Metals": "Sector Equity",
  "Industrials": "Sector Equity",
  "Infrastructure": "Sector Equity",
  "Natural Resources": "Sector Equity",
  "Technology": "Sector Equity",
  "Health": "Sector Equity",
  "Financial": "Sector Equity",
  "Real Estate": "Sector Equity",
  "Utilities": "Sector Equity",
  "Miscellaneous Sector": "Sector Equity",
  "Core / Multisector Bonds": "Bonds",
  "Bonds": "Bonds / Credit",
  "Junk Bonds": "Bonds",
  "Corporate Bonds": "Bonds",
  "Municipal Bonds": "Bonds",
  "Treasuries / Duration": "Bonds",
  "Bank Loans / Floating Rate": "Bonds",
  "Private Credit": "Bonds / Credit",
  "Direct Lending": "Private Credit",
  "CDs": "Bonds / Credit",
  "Annuity / Stable Value": "Bonds / Credit",
  "Precious Metals": "Commodities",
  "Broad Commodities": "Commodities",
  "Managed Futures": "Liquid Alternatives",
  "Trend Following": "Liquid Alternatives",
  "Trend Following Managed Futures": "Liquid Alternatives",
  "Liquid Alternatives": "Alternatives",
  "Private Alternatives": "Alternatives",
  "Real Assets": "Alternatives",
  "Private Real Estate": "Alternatives",
  "Other": "Other / Unclassified",
  "Unclassified": "Other / Unclassified",
};

const STORAGE_PREFIX = "portfolio-olap:";
const DB_NAME = "portfolio-olap-v2";
const DB_VERSION = 1;
const DEFAULT_PORTFOLIO_ID = "default";
const SPLIT_STORAGE_KEY = "workspaceSplitPercent";
const state = {
  holdings: loadJson("holdings", SAMPLE_HOLDINGS),
  assignments: loadJson("assignments", {}),
  rows: [],
  mapping: {},
  errors: [],
  selectedSleeve: "All",
  selectedBucket: null,                                       // rollup-bucket drill-down (orthogonal to sleeve)
  selectedSubGroup: null,                                     // mid-level sub-group drill-down (e.g. "Bonds")
  collapsedBuckets: new Set(loadJson("collapsedBuckets", [])),
  sidebarView: loadJson("sidebarView", "class"),              // "class" (asset class) | "role" (convex role)
  pivotRow: loadJson("pivotRow", "account"),                  // Pivot panel — rows dimension
  pivotCol: loadJson("pivotCol", "asset_class"),              // Pivot panel — cols dimension ("none" = 1-D)
  pivotCell: null,                                            // transient: a clicked cell → filters the holdings table
  query: "",
  valuationDate: "",
  snapshots: [],
  activeSnapshotId: "",
  db: null,
  dbError: "",
  splitPercent: loadJson(SPLIT_STORAGE_KEY, 45),
  planning: loadJson("planning", { expenses: 360000, reserveTarget: 1500000, taxLT: 0.238, taxST: 0.408 }),
};

const el = {
  sleeveNav: document.querySelector("#sleeveNav"),
  appVersion: document.querySelector("#appVersion"),
  manualVersion: document.querySelector("#manualVersion"),
  metrics: document.querySelector("#dashboard"),
  scopeSummary: document.querySelector("#scopeSummary"),
  planning: document.querySelector("#planning"),
  convexity: document.querySelector("#convexity"),
  pivot: document.querySelector("#pivot"),
  dial: document.querySelector("#dial"),
  overlay: document.querySelector("#overlay"),
  allocationBars: document.querySelector("#allocationBars"),
  topHoldings: document.querySelector("#topHoldings"),
  drillPath: document.querySelector("#drillPath"),
  holdings: document.querySelector("#holdings"),
  holdingsHead: document.querySelector("#holdingsHead"),
  holdingsFoot: document.querySelector("#holdingsFoot"),
  holdingsBody: document.querySelector("#holdingsBody"),
  viewLabel: document.querySelector("#viewLabel"),
  viewTitle: document.querySelector("#viewTitle"),
  holdingsTitle: document.querySelector("#holdingsTitle"),
  mapper: document.querySelector("#mapper"),
  errors: document.querySelector("#errors"),
  rowCount: document.querySelector("#rowCount"),
  emptyImport: document.querySelector("#emptyImport"),
  searchInput: document.querySelector("#searchInput"),
  csvFile: document.querySelector("#csvFile"),
  loadBookButton: document.querySelector("#loadBookButton"),
  bookBanner: document.querySelector("#bookBanner"),
  bookReload: document.querySelector("#bookReload"),
  bookDismiss: document.querySelector("#bookDismiss"),
  sampleButton: document.querySelector("#sampleButton"),
  largeSampleButton: document.querySelector("#largeSampleButton"),
  importPanelButton: document.querySelector("#importPanelButton"),
  snapshotsButton: document.querySelector("#snapshotsButton"),
  importDialog: document.querySelector("#importDialog"),
  importCloseButton: document.querySelector("#importCloseButton"),
  snapshotsDialog: document.querySelector("#snapshotsDialog"),
  snapshotsCloseButton: document.querySelector("#snapshotsCloseButton"),
  workspaceSplit: document.querySelector("#workspaceSplit"),
  splitter: document.querySelector("#splitter"),
  valuationDateInput: document.querySelector("#valuationDateInput"),
  snapshotStatus: document.querySelector("#snapshotStatus"),
  snapshotTimeline: document.querySelector("#snapshotTimeline"),
  performanceSeries: document.querySelector("#performanceSeries"),
  manualButton: document.querySelector("#manualButton"),
  manualDialog: document.querySelector("#manualDialog"),
  manualCloseButton: document.querySelector("#manualCloseButton"),
  manualContent: document.querySelector("#manualContent"),
};

el.csvFile.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const rows = parseCsv(await file.text());
  state.rows = rows;
  state.mapping = detectColumnMapping(Object.keys(rows[0] || {}));
  state.valuationDate = detectValuationDate(rows, state.mapping) || state.valuationDate;
  if (!state.valuationDate) {
    state.valuationDate = prompt("Enter valuation date for this import (YYYY-MM-DD). Upload date is not used for performance history.") || "";
  }
  el.valuationDateInput.value = state.valuationDate;
  await applyImport(file.name);
  event.target.value = "";
});

// Load the full consolidated book served by com.dnsr.olap (consolidated_holdings.csv,
// written by portfolio_analysis.py — all accounts, Flex netted, IRA + TIAA, sleeves set).
// Fetched from the server so it works from any browser without picking a local file.
// Cheap content signature (djb2) so we can tell when the served book has changed since we loaded it.
function bookSignature(text) {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return `${text.length}.${(h >>> 0).toString(36)}`;
}

// Fetch + import the consolidated book; records the signature of what we loaded so a later boot can
// detect a regeneration. Reused by the Load Full Book button AND the "newer book" banner's Reload.
async function loadConsolidatedBook() {
  const res = await fetch("./consolidated_holdings.csv", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} — run portfolio_analysis.py to generate it`);
  const text = await res.text();
  const rows = parseCsv(text);
  if (!rows.length) throw new Error("consolidated_holdings.csv is empty");
  state.rows = rows;
  state.mapping = detectColumnMapping(Object.keys(rows[0] || {}));
  state.valuationDate = detectValuationDate(rows, state.mapping) || today();
  el.valuationDateInput.value = state.valuationDate;
  state.selectedSleeve = "All";
  state.selectedBucket = null; state.selectedSubGroup = null;
  await applyImport("consolidated_holdings.csv");
  localStorage.setItem("olap.bookSignature", bookSignature(text));
  hideBookBanner();
}

function showBookBanner(sig) { if (el.bookBanner) { el.bookBanner.dataset.sig = sig; el.bookBanner.hidden = false; } }
function hideBookBanner() { if (el.bookBanner) el.bookBanner.hidden = true; }

// On boot: if the user previously adopted the consolidated book and the served file has since changed
// (portfolio_analysis.py re-exported it), surface a non-blocking banner — a plain refresh reuses the
// localStorage book, so without this a regenerated book would go unnoticed.
async function checkForNewerBook() {
  const prev = localStorage.getItem("olap.bookSignature");
  if (!prev) return;                          // never loaded the full book → don't nag
  try {
    const res = await fetch("./consolidated_holdings.csv", { cache: "no-store" });
    if (!res.ok) return;
    const sig = bookSignature(await res.text());
    if (sig !== prev && localStorage.getItem("olap.bookBannerDismissed") !== sig) showBookBanner(sig);
  } catch { /* offline / server down → skip silently */ }
}

async function _runBookLoad(btn, busyLabel) {
  const original = btn.textContent;
  btn.disabled = true; btn.textContent = busyLabel;
  try { await loadConsolidatedBook(); }
  catch (error) { window.alert(`Could not load the consolidated book: ${error.message}`); }
  finally { btn.disabled = false; btn.textContent = original; }
}

el.loadBookButton.addEventListener("click", () => _runBookLoad(el.loadBookButton, "Loading…"));
el.bookReload?.addEventListener("click", () => _runBookLoad(el.bookReload, "Reloading…"));
el.bookDismiss?.addEventListener("click", () => {
  const sig = el.bookBanner?.dataset.sig;
  if (sig) localStorage.setItem("olap.bookBannerDismissed", sig);   // don't re-nag until it changes again
  hideBookBanner();
});

// Sample-data loaders now live inside the Guide dialog; close it on click so the
// freshly loaded data is visible behind it.
el.sampleButton.addEventListener("click", () => {
  state.holdings = SAMPLE_HOLDINGS;
  state.rows = [];
  state.mapping = {};
  state.errors = [];
  state.selectedSleeve = "All";
  state.selectedBucket = null; state.selectedSubGroup = null;
  saveJson("holdings", state.holdings);
  if (el.manualDialog?.open) el.manualDialog.close();
  render();
});

el.largeSampleButton.addEventListener("click", () => {
  state.holdings = LARGE_SAMPLE_HOLDINGS;
  state.rows = [];
  state.mapping = {};
  state.errors = [];
  state.selectedSleeve = "All";
  state.selectedBucket = null; state.selectedSubGroup = null;
  saveJson("holdings", state.holdings);
  if (el.manualDialog?.open) el.manualDialog.close();
  render();
});

el.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderHoldings();
});

el.valuationDateInput.addEventListener("change", async (event) => {
  state.valuationDate = event.target.value;
  if (state.rows.length) {
    await applyImport("manual remap");
  }
});

el.importPanelButton.addEventListener("click", () => el.importDialog.showModal());
el.importCloseButton.addEventListener("click", () => el.importDialog.close());
el.snapshotsButton.addEventListener("click", () => el.snapshotsDialog.showModal());
el.snapshotsCloseButton.addEventListener("click", () => el.snapshotsDialog.close());
el.splitter.addEventListener("pointerdown", startSplitDrag);
el.splitter.addEventListener("keydown", handleSplitterKey);

el.manualButton.addEventListener("click", openManual);
el.manualCloseButton.addEventListener("click", () => el.manualDialog.close());

// Sticky section nav-bar → scroll the target panel into view. scrollIntoView handles both scroll
// containers (main on desktop, the page on iPad portrait), unlike a bare fragment link.
document.querySelector(".sectionNav")?.addEventListener("click", (ev) => {
  const a = ev.target.closest("a[href^='#']");
  if (!a) return;
  ev.preventDefault();
  const target = document.querySelector(a.getAttribute("href"));
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Scrollspy — highlight the nav link whose section is currently near the top of the viewport.
{
  const navLinks = [...document.querySelectorAll(".sectionNav a")];
  const order = navLinks.map((a) => (a.getAttribute("href") || "").slice(1));
  const sections = order.map((id) => document.getElementById(id)).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const visible = new Set();
    const spy = new IntersectionObserver((entries) => {
      for (const en of entries) { if (en.isIntersecting) visible.add(en.target.id); else visible.delete(en.target.id); }
      const activeId = order.find((id) => visible.has(id));   // topmost (DOM-order) visible section
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + activeId));
    }, { rootMargin: "-56px 0px -65% 0px", threshold: 0 });    // active zone = just below the sticky bar
    sections.forEach((s) => spy.observe(s));
  }
}

initApp();

function holding(ticker, assetName, shares, price, sleeve, costBasis) {
  return {
    id: `sample-${ticker}`,
    ticker,
    assetName,
    shares,
    price,
    marketValue: shares * price,
    sleeve,
    assignmentSource: "auto",
    costBasis,
    sourceRow: {},
  };
}

function buildLargeSampleHoldings() {
  const seeds = [
    ["AAPL", "Apple Inc.", "Large Cap Tech", 80, 192.32],
    ["MSFT", "Microsoft Corp.", "Large Cap Tech", 44, 424.56],
    ["NVDA", "NVIDIA Corp.", "Large Cap Tech", 25, 930.5],
    ["VUG", "Vanguard Growth ETF", "Large Growth", 65, 366.8],
    ["SPY", "SPDR S&P 500 ETF Trust", "Large Blend", 40, 512.2],
    ["VTV", "Vanguard Value ETF", "Large Value", 70, 161.4],
    ["VO", "Vanguard Mid-Cap ETF", "Mid-Cap Blend", 55, 251.75],
    ["VOT", "Vanguard Mid-Cap Growth ETF", "Mid-Cap Growth", 35, 236.1],
    ["VB", "Vanguard Small-Cap ETF", "Small Blend", 60, 218.8],
    ["VBR", "Vanguard Small-Cap Value ETF", "Small Value", 45, 184.35],
    ["VXUS", "Vanguard Total International Stock ETF", "International", 220, 63.12],
    ["VEA", "Vanguard Developed Markets ETF", "Foreign Large Blend", 180, 50.3],
    ["VWO", "Vanguard Emerging Markets ETF", "Emerging Markets", 175, 43.25],
    ["XLK", "Technology Select Sector SPDR", "Technology", 50, 210.44],
    ["XLV", "Health Care Select Sector SPDR", "Health", 48, 144.15],
    ["XLF", "Financial Select Sector SPDR", "Financial", 120, 42.8],
    ["VNQ", "Vanguard Real Estate ETF", "Real Estate", 85, 83.2],
    ["GLD", "SPDR Gold Shares", "Precious Metals", 55, 214.18],
    ["IAU", "iShares Gold Trust", "Precious Metals", 200, 43.15],
    ["DBC", "Invesco DB Commodity Index Tracking Fund", "Broad Commodities", 300, 23.4],
    ["PDBC", "Invesco Optimum Yield Diversified Commodity Strategy", "Broad Commodities", 280, 14.2],
    ["DBMF", "iMGP DBi Managed Futures Strategy ETF", "Trend Following Managed Futures", 280, 27.18],
    ["KMLM", "KFA Mount Lucas Managed Futures Index Strategy ETF", "Managed Futures", 210, 31.1],
    ["CTA", "Simplify Managed Futures Strategy ETF", "Managed Futures", 190, 28.4],
    ["TFPN", "Blueprint Chesapeake Multi-Asset Trend ETF", "Trend Following", 150, 24.75],
    ["MUB", "iShares National Muni Bond ETF", "Municipal Bonds", 120, 107.45],
    ["VTEB", "Vanguard Tax-Exempt Bond ETF", "Municipal Bonds", 160, 50.25],
    ["LQD", "iShares iBoxx Investment Grade Corporate Bond ETF", "Corporate Bonds", 130, 109.12],
    ["VCIT", "Vanguard Intermediate-Term Corporate Bond ETF", "Corporate Bonds", 90, 80.21],
    ["HYG", "iShares iBoxx High Yield Corporate Bond ETF", "Junk Bonds", 150, 78.32],
    ["JNK", "SPDR Bloomberg High Yield Bond ETF", "Junk Bonds", 120, 94.5],
    ["BND", "Vanguard Total Bond Market ETF", "Core / Multisector Bonds", 200, 72.3],
    ["AGG", "iShares Core U.S. Aggregate Bond ETF", "Core / Multisector Bonds", 160, 98.2],
    ["BIZD", "VanEck BDC Income ETF", "Direct Lending", 200, 16.54],
    ["PRCR", "Private Credit Placeholder", "Private Credit", 1, 25000],
    ["PE-BUYOUT", "Blackstone Capital Partners VIII", "Buyout", 1, 45000],
    ["PE-GROWTH", "Growth Equity Fund II", "Growth Equity", 1, 32000],
    ["PE-VC", "Venture Capital Fund IV", "Venture Capital", 1, 18000],
    ["PE-SEC", "Private Equity Secondaries Fund", "Secondaries", 1, 22000],
    ["SWVXX", "Schwab Value Advantage Money Fund", "Cash", 35000, 1],
    ["SGOV", "iShares 0-3 Month Treasury Bond ETF", "Cash", 180, 100.45],
    ["ALT-REAL", "Private Real Assets Fund", "Real Assets", 1, 27000],
    ["ALT-PA", "Private Alternatives Fund", "Private Alternatives", 1, 19000],
  ];

  return seeds.map(([ticker, assetName, sleeve, shares, price], index) => {
    const item = holding(ticker, assetName, shares, price, sleeve, shares * price * 0.86);
    item.id = `large-${index}-${ticker}`;
    item.brokerageAccount = index % 3 === 0 ? "Schwab IRA" : index % 3 === 1 ? "Fidelity Brokerage" : "Taxable Account";
    item.valuationDate = "2026-05-21";
    return item;
  });
}

async function initApp() {
  el.appVersion.textContent = APP_VERSION;
  el.manualVersion.textContent = APP_VERSION;
  state.valuationDate = today();
  el.valuationDateInput.value = state.valuationDate;
  await loadClassificationRules(); // shared sleeve rules before any classification runs
  await loadOverlaySnapshot();     // read-only precomputed overlay backtest
  await loadDialSnapshot();        // precomputed two-bucket dial grid
  await loadRegionExposure();      // per-ETF look-through region exposure (Pivot Region dim)

  try {
    state.db = await openPortfolioDb();
    await ensureDefaultPortfolio();
    await refreshSnapshots();
    el.snapshotStatus.textContent = "IndexedDB snapshot storage is ready.";
  } catch (error) {
    state.dbError = error.message || String(error);
    el.snapshotStatus.textContent = `IndexedDB unavailable: ${state.dbError}`;
  }
  render();
  checkForNewerBook();   // fire-and-forget: surface a banner if the served book was regenerated
}

async function applyImport(sourceName = "CSV import") {
  if (!state.valuationDate) {
    state.errors = ["Valuation date is required before a snapshot can be saved."];
    render();
    return;
  }

  const normalized = normalizeHoldings(state.rows, state.mapping, state.valuationDate);
  state.holdings = normalized.holdings.length ? normalized.holdings : state.holdings;
  state.errors = normalized.errors;
  state.selectedSleeve = "All";
  state.selectedBucket = null; state.selectedSubGroup = null;
  saveJson("holdings", state.holdings);
  if (normalized.holdings.length && state.db) {
    const snapshot = {
      id: `snapshot-${state.valuationDate}`,
      portfolioId: DEFAULT_PORTFOLIO_ID,
      valuationDate: state.valuationDate,
      importedAt: new Date().toISOString(),
      sourceName,
      brokerPreset: "generic",
      rowCount: normalized.holdings.length,
    };
    await saveSnapshot(snapshot, normalized.holdings.map((holding) => toPositionValuation(holding, snapshot)));
    state.activeSnapshotId = snapshot.id;
    await refreshSnapshots();
  }
  render();
}

function render() {
  const cube = buildPortfolioCube(state.holdings);
  state._cube = cube;   // stashed so the dial slider can re-render without a full rebuild
  applyWorkspaceSplit();
  renderTitle();
  renderSleeves(cube);
  renderMetrics(cube);
  renderPlanning(cube);
  renderConvexity(cube);
  renderPivot();
  renderDial(cube);
  renderOverlay();
  renderAllocation(cube);
  renderTopHoldings(cube);
  renderDrillPath();
  renderMapper();
  renderSnapshots();
  renderPerformanceSeries();
  renderHoldings();
}

function applyWorkspaceSplit() {
  const top = clamp(state.splitPercent, 25, 70);
  el.workspaceSplit.style.setProperty("--top-pane", `${top}%`);
}

function startSplitDrag(event) {
  event.preventDefault();
  el.splitter.setPointerCapture(event.pointerId);
  const onMove = (moveEvent) => {
    const rect = el.workspaceSplit.getBoundingClientRect();
    const offset = moveEvent.clientY - rect.top;
    state.splitPercent = clamp((offset / rect.height) * 100, 25, 70);
    saveJson(SPLIT_STORAGE_KEY, state.splitPercent);
    applyWorkspaceSplit();
  };
  const onUp = () => {
    el.splitter.removeEventListener("pointermove", onMove);
    el.splitter.removeEventListener("pointerup", onUp);
  };
  el.splitter.addEventListener("pointermove", onMove);
  el.splitter.addEventListener("pointerup", onUp);
}

function handleSplitterKey(event) {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
  event.preventDefault();
  state.splitPercent = clamp(state.splitPercent + (event.key === "ArrowUp" ? -5 : 5), 25, 70);
  saveJson(SPLIT_STORAGE_KEY, state.splitPercent);
  applyWorkspaceSplit();
}

function renderTitle() {
  const all = isAllScope();
  el.viewLabel.textContent = all ? "Portfolio overview" : (state.selectedBucket ? "Bucket drill-down" : "Sleeve drill-down");
  el.viewTitle.textContent = all ? "Investment Portfolio" : selectionLabel();
  el.holdingsTitle.textContent = all ? "All Holdings" : `${selectionLabel()} Holdings`;
}

// ── Rollup taxonomy: granular sleeves → ~7 top-level buckets (the liquidity-aware view). A sleeve's
// bucket is the first anchor found walking its taxonomy ancestor chain (SLEEVE_PARENTS). ─────────
const ROLLUP_BUCKETS = [
  { name: "Public Equity", anchors: ["Public Equity"] },
  { name: "Private Equity", anchors: ["Private Equity"] },
  { name: "Fixed Income", anchors: ["Bonds", "CDs", "Annuity / Stable Value"] },
  { name: "Private Credit", anchors: ["Private Credit"] },
  { name: "Liquid Alts", anchors: ["Liquid Alternatives"] },
  { name: "Commodities", anchors: ["Commodities", "Precious Metals", "Broad Commodities"] },
  { name: "Real Assets", anchors: ["Real Assets"] },                                          // liquid real-asset ETFs (RAAX/RLY)
  { name: "Private Real Assets", anchors: ["Private Real Estate", "Private Alternatives"] },  // Stallion/BREIT + reinsurance
  { name: "Multi-Asset", anchors: ["Multi-Asset"] },
  { name: "Options", anchors: ["Options"] },
  { name: "Cash", anchors: ["Cash"] },
  { name: "Other", anchors: ["Other / Unclassified", "Other", "Unclassified"] },
];
const _bucketCache = new Map();
function bucketOfSleeve(sleeveName) {
  if (_bucketCache.has(sleeveName)) return _bucketCache.get(sleeveName);
  const chain = [sleeveName, ...parentPath(sleeveName)];
  const hit = ROLLUP_BUCKETS.find((b) => b.anchors.some((a) => chain.includes(a)));
  const name = hit ? hit.name : "Other";
  _bucketCache.set(sleeveName, name);
  return name;
}

// A sleeve's group in the ACTIVE sidebar view: asset-class bucket, or its convex role.
function groupOfSleeve(sleeveName) {
  return state.sidebarView === "role" ? (convexRoleForSleeve(sleeveName) || "Other") : bucketOfSleeve(sleeveName);
}

// Optional mid-level sub-group within a bucket (asset-class view only): a sleeve whose taxonomy chain
// includes an anchor renders under that sub-header (the bond TYPES nest under "Bonds", while CDs and
// Annuity sit directly under Fixed Income).
const SUB_GROUPS = { "Bonds": "Bonds" };
function subGroupOfSleeve(sleeveName) {
  if (state.sidebarView !== "class") return null;
  const chain = parentPath(sleeveName);
  for (const [anchor, label] of Object.entries(SUB_GROUPS)) if (chain.includes(anchor)) return label;
  return null;
}

// Drill scope = "All" | a single sleeve | a whole bucket | a sub-group (wider scopes keep selectedSleeve "All").
function inSelection(holding) {
  if (state.selectedSubGroup) return subGroupOfSleeve(holding.sleeve) === state.selectedSubGroup;
  if (state.selectedBucket) return groupOfSleeve(holding.sleeve) === state.selectedBucket;
  if (state.selectedSleeve !== "All") return holding.sleeve === state.selectedSleeve;
  return true;
}
function isAllScope() { return !state.selectedBucket && !state.selectedSubGroup && state.selectedSleeve === "All"; }
function selectionLabel() { return state.selectedSubGroup || state.selectedBucket || (state.selectedSleeve === "All" ? "All" : state.selectedSleeve); }
function revealHoldings() { el.holdings?.scrollIntoView({ behavior: "smooth", block: "start" }); }
function selectScope({ sleeve = "All", bucket = null, subGroup = null }) {
  state.selectedSleeve = sleeve;
  state.selectedBucket = bucket;
  state.selectedSubGroup = subGroup;
  render();
  if (!isAllScope()) revealHoldings();             // jump to the holdings table on any drill-in
  else window.scrollTo({ top: 0, behavior: "smooth" });   // "All Portfolio" → back to the top
}

// The "View by: Asset Class | Convex Role" switch atop the sidebar nav.
function viewToggle() {
  const wrap = document.createElement("div");
  wrap.className = "viewToggle";
  const lbl = document.createElement("div");
  lbl.className = "viewToggleLabel";
  lbl.textContent = "View by";
  wrap.appendChild(lbl);
  const row = document.createElement("div");
  row.className = "viewToggleBtns";
  for (const [v, text] of [["class", "Asset Class"], ["role", "Convex Role"]]) {
    const btn = document.createElement("button");
    btn.className = `viewToggleBtn ${state.sidebarView === v ? "active" : ""}`;
    btn.textContent = text;
    btn.addEventListener("click", () => {
      if (state.sidebarView === v) return;
      state.sidebarView = v;
      saveJson("sidebarView", v);
      state.selectedSleeve = "All"; state.selectedBucket = null; state.selectedSubGroup = null;   // group names differ between views → reset scope
      render();
    });
    row.appendChild(btn);
  }
  wrap.appendChild(row);
  return wrap;
}

function renderSleeves(cube) {
  const nav = [viewToggle(), navButton("All Portfolio", () => selectScope({ sleeve: "All" }), "", isAllScope())];
  // group the live sleeves under the active grouping — asset-class bucket OR convex role
  const groups = new Map();
  for (const s of cube.sleeves) {
    const grp = groupOfSleeve(s.sleeve);
    if (!groups.has(grp)) groups.set(grp, { value: 0, weight: 0, sleeves: [] });
    const g = groups.get(grp);
    g.value += s.value; g.weight += s.weight; g.sleeves.push(s);
  }
  const order = state.sidebarView === "role" ? _CONVEX_ROLE_ORDER : ROLLUP_BUCKETS.map((b) => b.name);
  const ordered = [...order, ...[...groups.keys()].filter((k) => !order.includes(k))];   // any straggler last
  for (const name of ordered) {
    const g = groups.get(name);
    if (!g) continue;                                       // hide empty groups
    const collapsed = state.collapsedBuckets.has(name);
    const group = document.createElement("div");
    group.className = "bucketGroup";

    const header = document.createElement("div");
    header.className = "bucketHeader";
    const toggle = document.createElement("button");
    toggle.className = "bucketToggle";
    toggle.textContent = collapsed ? "▸" : "▾";
    toggle.title = collapsed ? "Expand" : "Collapse";
    toggle.addEventListener("click", () => {
      if (collapsed) state.collapsedBuckets.delete(name); else state.collapsedBuckets.add(name);
      saveJson("collapsedBuckets", [...state.collapsedBuckets]);
      render();
    });
    const label = document.createElement("button");
    label.className = `bucketLabel ${state.selectedBucket === name ? "active" : ""}`;
    label.innerHTML = `<span>${escapeHtml(name)}</span><strong>${percent(g.weight)}</strong>`;
    label.addEventListener("click", () => selectScope({ bucket: name }));
    header.append(toggle, label);
    group.appendChild(header);

    if (!collapsed) {
      const list = document.createElement("div");
      list.className = "bucketSleeves";
      const sleeveBtn = (s) => navButton(s.sleeve, () => selectScope({ sleeve: s.sleeve }),
        percent(s.weight), !state.selectedBucket && !state.selectedSubGroup && state.selectedSleeve === s.sleeve);
      // partition the bucket's sleeves into mid-level sub-groups (e.g. "Bonds") + direct sleeves (CDs, Annuity)
      const subs = new Map();
      const direct = [];
      for (const s of g.sleeves) {
        const sub = subGroupOfSleeve(s.sleeve);
        if (sub) { if (!subs.has(sub)) subs.set(sub, { weight: 0, sleeves: [] }); const sg = subs.get(sub); sg.weight += s.weight; sg.sleeves.push(s); }
        else direct.push(s);
      }
      for (const [subName, sg] of subs) {
        const key = "sub:" + subName;
        const sc = state.collapsedBuckets.has(key);
        const sh = document.createElement("div");
        sh.className = "subHeader";
        const st = document.createElement("button");
        st.className = "bucketToggle";
        st.textContent = sc ? "▸" : "▾";
        st.title = sc ? "Expand" : "Collapse";
        st.addEventListener("click", () => {
          if (sc) state.collapsedBuckets.delete(key); else state.collapsedBuckets.add(key);
          saveJson("collapsedBuckets", [...state.collapsedBuckets]); render();
        });
        const sl = document.createElement("button");
        sl.className = `subLabel ${state.selectedSubGroup === subName ? "active" : ""}`;
        sl.innerHTML = `<span>${escapeHtml(subName)}</span><strong>${percent(sg.weight)}</strong>`;
        sl.addEventListener("click", () => selectScope({ subGroup: subName }));
        sh.append(st, sl);
        list.appendChild(sh);
        if (!sc) {
          const inner = document.createElement("div");
          inner.className = "subSleeves";
          for (const s of sg.sleeves) inner.appendChild(sleeveBtn(s));
          list.appendChild(inner);
        }
      }
      for (const s of direct) list.appendChild(sleeveBtn(s));
      group.appendChild(list);
    }
    nav.push(group);
  }
  el.sleeveNav.replaceChildren(...nav);
}

function navButton(label, onClick, meta, active) {
  const button = document.createElement("button");
  button.className = `sleeve ${active ? "active" : ""}`;
  button.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(meta)}</strong>`;
  button.addEventListener("click", onClick);
  return button;
}

function renderMetrics(cube) {
  const selectedHoldings = isAllScope() ? state.holdings : state.holdings.filter(inSelection);
  const selectedValue = selectedHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const selectedCostBasis = selectedHoldings.reduce((sum, holding) => sum + (holding.costBasis || 0), 0);
  const selectedGain = selectedValue - selectedCostBasis;
  const selectedAllocation = cube.totalValue ? selectedValue / cube.totalValue : 0;
  const selectedLabel = isAllScope() ? "Portfolio Value" : `${selectionLabel()} Value`;

  // Value-weighted beta vs SPY for the current selection (per-holding beta from the imported book).
  const betaDen = selectedHoldings.reduce((s, h) => s + (h.marketValue || 0), 0);
  const betaNum = selectedHoldings.reduce((s, h) => s + (h.marketValue || 0) * (h.beta || 0), 0);
  const hasBeta = selectedHoldings.some((h) => h.beta != null);
  const beta = betaDen ? betaNum / betaDen : 0;

  // Top dashboard: the All-Portfolio summary — always pinned, unchanged on drill-down (as before).
  const allCost = state.holdings.reduce((s, h) => s + (h.costBasis || 0), 0);
  const allGain = cube.totalValue - allCost;
  const allBetaNum = state.holdings.reduce((s, h) => s + (h.marketValue || 0) * (h.beta || 0), 0);
  const allBetaDen = state.holdings.reduce((s, h) => s + (h.marketValue || 0), 0);
  const allHasBeta = state.holdings.some((h) => h.beta != null);
  el.metrics.replaceChildren(
    metric("Portfolio Value", money(cube.totalValue)),
    metric("Total Portfolio", money(cube.totalValue)),
    metric("Portfolio Allocation", percent(1)),
    metric("Selection Gain", money(allGain), allGain >= 0 ? "good" : "warn"),
    ...(allHasBeta ? [metric("Beta vs S&P (est.)", (allBetaDen ? allBetaNum / allBetaDen : 0).toFixed(2))] : []),
  );

  // Scope strip: the drilled asset class's summary, shown just above the drill-down detail.
  // Hidden entirely at the All-Portfolio view (nothing drilled in) to avoid duplicating the top.
  if (el.scopeSummary) {
    if (isAllScope()) {
      el.scopeSummary.replaceChildren();
      el.scopeSummary.style.display = "none";
    } else {
      el.scopeSummary.style.display = "";
      el.scopeSummary.replaceChildren(
        metric(selectedLabel, money(selectedValue), "focus"),
        metric("Portfolio Allocation", percent(selectedAllocation)),
        metric("Selection Gain", money(selectedGain), selectedGain >= 0 ? "good" : "warn"),
        ...(hasBeta ? [metric("Beta vs S&P (est.)", beta.toFixed(2))] : []),
      );
    }
  }
}

function metric(label, value, tone = "") {
  const div = document.createElement("div");
  div.className = `metric ${tone}`;
  div.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
  return div;
}

// sleeve display NAME -> convex role (Cash/Income/Duration/Convexity/Diversifier/
// Other-Alt/Growth/Other), derived from the shared classification rules. Used by the
// Planning panel for reserve (Cash) and the tax rollup.
function convexRoleForSleeve(sleeveName) {
  const R = CLASSIFICATION_RULES;
  if (R && R.sleeveToConvex && R.codeToName) {
    if (!R._nameToConvex) {
      R._nameToConvex = {};
      for (const [code, role] of Object.entries(R.sleeveToConvex)) {
        const name = R.codeToName[code];
        if (name) R._nameToConvex[name] = role;
      }
    }
    if (R._nameToConvex[sleeveName]) return R._nameToConvex[sleeveName];
  }
  const n = (sleeveName || "").toLowerCase();
  if (n.includes("cash") || n.includes("money")) return "Cash";
  if (n === "unclassified" || n.includes("other")) return "Other";
  return "Other";
}

// Reserve + embedded-tax analytics, ported from portfolio_analysis.py. Pure browser-side
// math over the imported holdings + an editable planning config (persisted in localStorage).
// Reserve = the Cash sleeve (money-market + SGOV/BIL short bills classify there); embedded
// tax = sum of positive per-sleeve unrealized gain x the long-term rate (needs cost basis).
function renderPlanning(cube) {
  if (!el.planning) return;
  const cfg = state.planning;
  const reserve = cube.sleeves
    .filter((s) => convexRoleForSleeve(s.sleeve) === "Cash")
    .reduce((sum, s) => sum + s.value, 0);
  const years = cfg.expenses > 0 ? reserve / cfg.expenses : 0;
  const idle = reserve - cfg.reserveTarget;

  const taxableSleeves = cube.sleeves
    .map((s) => ({ name: s.sleeve, gain: s.unrealizedGain, tax: Math.max(0, s.unrealizedGain) * cfg.taxLT }))
    .filter((s) => s.tax > 0)
    .sort((a, b) => b.tax - a.tax);
  const embeddedTax = taxableSleeves.reduce((sum, s) => sum + s.tax, 0);
  const hasCostBasis = cube.totalCostBasis > 0;

  const cards = [
    `<div class="metric"><span>Safe reserve (Cash)</span><strong>${money(reserve)}</strong></div>`,
    `<div class="metric ${years >= 4 ? "good" : "warn"}"><span>Reserve coverage</span><strong>${years.toFixed(1)} yrs</strong></div>`,
    `<div class="metric ${idle >= 0 ? "good" : "warn"}"><span>${idle >= 0 ? "Idle / deployable" : "Reserve shortfall"}</span><strong>${money(Math.abs(idle))}</strong></div>`,
    `<div class="metric"><span>Unrealized gain</span><strong>${hasCostBasis ? money(cube.unrealizedGain) : "—"}</strong></div>`,
    `<div class="metric warn"><span>Embedded LT tax if liquidated</span><strong>${hasCostBasis ? money(embeddedTax) : "—"}</strong></div>`,
  ].join("");

  const taxRows = hasCostBasis && taxableSleeves.length
    ? taxableSleeves.slice(0, 6).map((s) =>
        `<div class="planTaxRow"><span>${escapeHtml(s.name)}</span><em>${money(s.gain)} gain</em><strong>${money(s.tax)}</strong></div>`).join("")
    : `<div class="planNote">${hasCostBasis ? "No embedded gains." : "Import cost basis to compute embedded tax."}</div>`;

  const fmtInt = (n) => Number(n).toLocaleString("en-US");
  const cfgField = (key, label, value, opts = {}) =>
    `<label class="planField"><span>${label}</span><input ${opts.money ? 'type="text" inputmode="numeric"' : 'type="number" step="any"'} data-plan="${key}" value="${opts.money ? fmtInt(value) : value}" />${opts.suffix ? `<em>${opts.suffix}</em>` : ""}</label>`;

  el.planning.innerHTML = `
    <div class="panelHeader">
      <div>
        <p class="eyebrow">Planning &amp; Risk</p>
        <h2>Reserve, Tax &amp; Liquidity</h2>
      </div>
      <div class="planConfig">
        ${cfgField("expenses", "Annual expenses", cfg.expenses, { money: true })}
        ${cfgField("reserveTarget", "Reserve target", cfg.reserveTarget, { money: true })}
        ${cfgField("taxLT", "LT tax %", (cfg.taxLT * 100).toFixed(1))}
      </div>
    </div>
    <div class="planMetrics metrics">${cards}</div>
    <div class="planTax">
      <p class="eyebrow">Embedded tax by sleeve (LT, if sold)</p>
      ${taxRows}
    </div>`;

  el.planning.querySelectorAll("input[data-plan]").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.plan;
      let v = Number(String(input.value).replace(/,/g, ""));   // strip thousands separators
      if (!Number.isFinite(v) || v < 0) return;
      if (key === "taxLT") v = v / 100;
      state.planning = { ...state.planning, [key]: v };
      saveJson("planning", state.planning);
      render();
    });
  });
}

function signPct(value) {
  return (value >= 0 ? "+" : "") + percent(value);
}

// Read-only render of the precomputed Sortino-overlay backtest (overlay_snapshot.json).
// Hidden entirely if the snapshot is absent. Provenance (as-of, window, the consolidated-
// book caveat) is shown inline so it's never mistaken for a live, import-driven number.
function renderOverlay() {
  if (!el.overlay) return;
  const S = OVERLAY_SNAPSHOT;
  if (!S) { el.overlay.innerHTML = ""; el.overlay.style.display = "none"; return; }
  el.overlay.style.display = "";
  const cur = S.current;
  const deployRows = S.deploy.map((d) =>
    `<div class="ovRow"><span>Deploy $${d.usd_m.toFixed(1)}M (${percent(d.pct)}) → trend</span>` +
    `<em>Sortino ${cur.sortino.toFixed(2)} → ${d.sortino.toFixed(2)}</em>` +
    `<em>maxDD ${percent(d.mdd)}</em>` +
    `<strong class="${d.ret_2022 >= 0 ? "good" : "warn"}">2022 ${signPct(d.ret_2022)}</strong></div>`).join("");
  const regRows = Object.entries(S.regime).map(([k, v]) =>
    `<div class="ovRow"><span>${escapeHtml(k)}</span>` +
    `<em>Treasuries ${signPct(v.treasuries)}/yr</em>` +
    `<strong class="${v.trend >= 0 ? "good" : "warn"}">Trend ${signPct(v.trend)}/yr</strong></div>`).join("");
  const win = `${(S.window[0] || "").slice(0, 4)}–${(S.window[1] || "").slice(0, 4)}`;
  el.overlay.innerHTML = `
    <div class="panelHeader">
      <div>
        <p class="eyebrow">Structural convexity &middot; volatility-managed construction</p>
        <h2>Sortino Overlay Backtest</h2>
      </div>
      <span class="pill ovPill" title="${escapeAttr(S.note)}">as-of ${escapeHtml(S.data_as_of || "?")} &middot; ${escapeHtml(win)} monthly</span>
    </div>
    <div class="planMetrics metrics">
      <div class="metric"><span>Current Sortino</span><strong>${cur.sortino.toFixed(2)}</strong></div>
      <div class="metric"><span>Current maxDD</span><strong>${percent(cur.mdd)}</strong></div>
      <div class="metric"><span>Current CAGR</span><strong>${percent(cur.cagr)}</strong></div>
      <div class="metric good"><span>Full Convex 60/20/20 (tax-free target)</span><strong>Sortino ${S.full_convex.sortino.toFixed(2)} &middot; maxDD ${percent(S.full_convex.mdd)}</strong></div>
    </div>
    <div class="ovBlock"><p class="eyebrow">Idle cash &rarr; standalone trend (~$0 tax, cash-funded)</p>${deployRows}</div>
    <div class="ovBlock"><p class="eyebrow">Regime split &mdash; Treasuries vs trend</p>${regRows}</div>
    <div class="planNote"><strong>Structural convexity</strong> — crash resilience generated by <em>sizing &amp; rebalancing</em> (volatility/Sortino targeting), not by what you hold. This is the second convexity source; it pairs with the <em>tactical</em> convexity (held instruments) in the Crash-Shape panel above, and a holdings view cannot see it. ${escapeHtml(S.note)} Trend = ${escapeHtml(S.trend_proxy)}.</div>`;
}

// Convexity panel: (1) live composition by the 7 convex roles, Convexity foregrounded;
// (2) gap to an editable target + the deploy-$ that closes it (from the overlay snapshot);
// (3) precomputed per-role crisis attribution (snapshot.crisis). Convexity here =
// trend / managed-futures / long-short (the LIQALTS + trend roles).
const _CONVEX_ROLE_ORDER = ["Growth","Income","Duration","Convexity","Diversifier","Other-Alt","Cash","Other"];

function renderConvexity(cube) {
  if (!el.convexity) return;
  const total = cube.totalValue || 0;
  const roleTot = {};
  for (const s of cube.sleeves) {
    const r = convexRoleForSleeve(s.sleeve);
    roleTot[r] = (roleTot[r] || 0) + s.value;
  }
  const convexVal = roleTot["Convexity"] || 0;
  const convexPct = total ? convexVal / total : 0;
  // The Convexity role lumps genuine crisis-alpha trend/managed-futures together with
  // long-short equity (AQR Flex / Delphi / CLSE). For the thesis they're NOT the same —
  // only trend/MF is the convex crash hedge — so split them out. The gap + deploy target
  // DEDICATED TREND, the actual lever (and the ~0% Marc flagged).
  const _TREND_SLEEVES = new Set(["Managed Futures", "Trend Following", "Trend Following Managed Futures"]);
  let trendVal = 0;
  for (const s of cube.sleeves) if (_TREND_SLEEVES.has(s.sleeve)) trendVal += s.value;
  const trendPct = total ? trendVal / total : 0;
  const lsVal = Math.max(0, convexVal - trendVal);            // long-short portion of the role
  const target = state.planning.convexTrendTargetPct ?? 0.05; // target DEDICATED TREND %
  const gapPct = target - trendPct;
  const gapUsd = gapPct * total;

  const maxRole = Math.max(1, ..._CONVEX_ROLE_ORDER.map((r) => roleTot[r] || 0));
  const compRows = _CONVEX_ROLE_ORDER.filter((r) => (roleTot[r] || 0) > 0).map((r) => {
    const v = roleTot[r] || 0;
    const hot = r === "Convexity";
    return `<div class="cxRow ${hot ? "cxHot" : ""}"><span class="cxLabel">${r}${hot ? " ◆" : ""}</span>` +
           `<span class="cxBar"><i style="width:${(100 * v / maxRole).toFixed(1)}%"></i></span>` +
           `<strong>${money(v)}</strong><em>${percent(total ? v / total : 0)}</em></div>`;
  }).join("");

  const S = OVERLAY_SNAPSHOT;
  const deployRows = (S && S.deploy ? S.deploy : []).map((d) =>
    `<div class="cxRow"><span class="cxLabel">Deploy $${d.usd_m.toFixed(1)}M (${percent(d.pct)}) → trend</span>` +
    `<em>Sortino ${S.current.sortino.toFixed(2)} → ${d.sortino.toFixed(2)}</em>` +
    `<strong class="${d.ret_2022 >= 0 ? "good" : "warn"}">2022 ${signPct(d.ret_2022)}</strong></div>`).join("");

  let crisisBlock = "";
  if (S && S.crisis && Object.keys(S.crisis).length) {
    const wins = Object.keys(S.crisis);
    const roles = ["Growth", "Income", "Duration", "Convexity", "Cash"];
    const head = `<tr><th>Role</th>${wins.map((w) => `<th>${escapeHtml(w)}</th>`).join("")}</tr>`;
    const body = roles.map((r) => {
      const cells = wins.map((w) => {
        const v = S.crisis[w][r];
        return v == null ? "<td>—</td>" : `<td class="${v >= 0 ? "good" : "warn"}">${signPct(v)}</td>`;
      }).join("");
      return `<tr class="${r === "Convexity" ? "cxHot" : ""}"><td>${r}${r === "Convexity" ? " ◆" : ""}</td>${cells}</tr>`;
    }).join("");
    crisisBlock = `<div class="cxBlock"><p class="eyebrow">Per-role crisis attribution (precomputed)</p>` +
      `<div class="cxScroll"><table class="cxCrisis"><thead>${head}</thead><tbody>${body}</tbody></table></div>` +
      `<div class="planNote">${escapeHtml(S.note || "")} 2008 GFC predates the trend-data window.</div></div>`;
  }

  el.convexity.innerHTML = `
    <div class="panelHeader">
      <div><p class="eyebrow">Tactical convexity &middot; held instruments</p><h2>Crash-Shape &amp; Convexity</h2></div>
      <span class="pill ovPill">Convexity = trend / managed-futures / long-short</span>
    </div>
    <div class="planNote"><strong>Convexity has two sources.</strong> This panel is <em>tactical</em> convexity — the crash-hedge instruments you hold. <em>Structural</em> convexity comes from how the book is sized &amp; rebalanced (volatility targeting) — see the <strong>Sortino Overlay</strong> panel below. A holdings view sees only the tactical half; a vol-managed book can be far more convex than its instruments suggest.</div>
    <div class="planMetrics metrics">
      <div class="metric"><span>Convexity sleeve (broad)</span><strong>${percent(convexPct)} · ${money(convexVal)}</strong></div>
      <div class="metric ${trendPct >= target ? "good" : "warn"}"><span>Dedicated trend / managed-futures</span><strong>${percent(trendPct)} · ${money(trendVal)}</strong></div>
      <label class="metric cxTarget"><span>Target trend %</span><input type="number" step="0.5" data-cx="trend" value="${(target * 100).toFixed(1)}" /></label>
      <div class="metric ${gapPct <= 0 ? "good" : "warn"}"><span>${gapPct > 0 ? "Gap → deploy to trend" : "At/above target"}</span><strong>${gapPct > 0 ? money(gapUsd) : "✓"}</strong></div>
    </div>
    <div class="planNote">The Convexity role's ${money(convexVal)} is mostly <strong>long-short equity</strong> (${money(lsVal)}, AQR Flex / Delphi) — only ${money(trendVal)} is genuine <strong>trend / managed-futures</strong>, the actual crash hedge. The gap + deploy target that.</div>
    <div class="cxBlock"><p class="eyebrow">Composition by convex role</p>${compRows}</div>
    ${deployRows ? `<div class="cxBlock"><p class="eyebrow">Close the gap — idle cash → standalone trend (~$0 tax)</p>${deployRows}</div>` : ""}
    ${crisisBlock}`;

  el.convexity.querySelectorAll("input[data-cx]").forEach((inp) => {
    inp.addEventListener("change", () => {
      const v = Number(inp.value);
      if (!Number.isFinite(v) || v < 0) return;
      state.planning = { ...state.planning, convexTrendTargetPct: v / 100 };
      saveJson("planning", state.planning);
      render();
    });
  });
}

// Two-bucket dial: a live equity slider over the precomputed dial grid. Risk metrics come
// from the snapshot (can't backtest in-browser); the $ buckets + cash-floor years are sized
// live from the real book. The hedge sleeve is held constant across settings.
function renderDial(cube) {
  if (!el.dial) return;
  const S = DIAL_SNAPSHOT;
  if (!S || !S.grid || !S.grid.length) { el.dial.innerHTML = ""; el.dial.style.display = "none"; return; }
  el.dial.style.display = "";
  const total = cube.totalValue || 0;
  const exp = S.expenses_per_yr || 360000;
  const ev = state.planning.dialEquityPct ?? 0.59;
  const g = S.grid.reduce((a, b) => Math.abs(b.equity - ev) < Math.abs(a.equity - ev) ? b : a, S.grid[0]);
  const ae = S.all_equity;
  const cashUsd = g.cash * total, floorYrs = exp ? cashUsd / exp : 0;
  const eqUsd = g.equity * total, trendUsd = (S.hedge.TREND || 0) * total;
  const hedgePill = `hedge fixed: ${Math.round((S.hedge.TREND || 0) * 100)}% trend · ${Math.round((S.hedge.TR || 0) * 100)}% Treas · ${Math.round((S.hedge.GLD || 0) * 100)}% gold`;
  el.dial.innerHTML = `
    <div class="panelHeader">
      <div><p class="eyebrow">Two-bucket dial · set it together</p><h2>Preservation ↔ Growth Dial</h2></div>
      <span class="pill ovPill">${hedgePill}</span>
    </div>
    <div class="dialSlider">
      <span class="dialEnd">Conservative<br><small>your floor</small></span>
      <input type="range" min="40" max="75" step="5" value="${Math.round(g.equity * 100)}" data-dial="equity" />
      <span class="dialEnd">Growth<br><small>her horizon</small></span>
    </div>
    <div class="dialNow">${Math.round(g.equity * 100)}% equity · ${floorYrs.toFixed(0)}-yr cash floor</div>
    <div class="planMetrics metrics">
      <div class="metric"><span>Equity (growth, hedged)</span><strong>${money(eqUsd)}</strong></div>
      <div class="metric ${floorYrs >= 5 ? "good" : "warn"}"><span>Cash floor (Bucket 1)</span><strong>${money(cashUsd)}<em class="cxSub">${floorYrs.toFixed(0)} yrs of spend</em></strong></div>
      <div class="metric good"><span>Sortino (risk-adjusted)</span><strong>${g.sortino.toFixed(2)}<em class="cxSub">vs ${ae.sortino.toFixed(2)} all-equity</em></strong></div>
      <div class="metric ${g.mdd > ae.mdd ? "good" : "warn"}"><span>Modeled max drawdown</span><strong>${percent(g.mdd)}<em class="cxSub">vs ${percent(ae.mdd)} all-equity</em></strong></div>
    </div>
    <div class="cxBlock">
      <div class="cxRow"><span class="cxLabel">CAGR (the cost of protection)</span><strong>${percent(g.cagr)}</strong><em>vs ${percent(ae.cagr)} unhedged</em></div>
      <div class="cxRow"><span class="cxLabel">2022 (the year bonds failed)</span><strong class="${g.y2022 >= 0 ? "good" : "warn"}">${signPct(g.y2022)}</strong><em>vs ${signPct(ae.y2022)} unhedged</em></div>
      <div class="cxRow"><span class="cxLabel">Trend sleeve at this setting</span><strong>${money(trendUsd)}</strong><em>~$0 tax in the IRA</em></div>
    </div>
    <div class="planNote">Slide toward <b>Growth</b> (her 40-yr horizon) or <b>Conservative</b> (your floor) — the hedge stays on at every setting, so any point beats unhedged all-equity on both drawdown and risk-adjusted return. <b>The hedge blends three mechanisms, not one:</b> <b>trend</b> = convexity (the crash-payoff engine), <b>Treasuries</b> = duration / ballast (flight-to-quality — but <em>regime-dependent</em>: it failed in 2022's rate shock, where <b>trend</b> carried the hedge — see the 2022 row), <b>gold</b> = diversifier (low-correlation, <em>not</em> convex). So this is a multi-mechanism crash hedge, not a pure convexity sleeve. ${escapeHtml(S.note || "")}</div>`;
  const inp = el.dial.querySelector("input[data-dial]");
  if (inp) inp.addEventListener("input", () => {
    state.planning = { ...state.planning, dialEquityPct: Number(inp.value) / 100 };
    saveJson("planning", state.planning);
    renderDial(state._cube || cube);   // light re-render — no full rebuild
  });
}

function renderAllocation(cube) {
  el.allocationBars.replaceChildren(
    ...cube.sleeves.map((sleeve) => {
      const button = document.createElement("button");
      button.className = "barRow";
      button.innerHTML = `
        <span class="barLabel">${escapeHtml(sleeve.sleeve)}</span>
        <span class="barTrack"><span class="barFill" style="width:${Math.max(sleeve.weight * 100, 2)}%"></span></span>
        <span class="barValue">${money(sleeve.value)}</span>
        <span class="barPct">${percent(sleeve.weight)}</span>`;
      button.addEventListener("click", () => selectScope({ sleeve: sleeve.sleeve }));
      return button;
    }),
  );
}

function renderTopHoldings(cube) {
  el.topHoldings.replaceChildren(
    ...cube.topHoldings.map((holding) => {
      const button = document.createElement("button");
      button.className = "miniItem";
      button.innerHTML = `<span><strong>${escapeHtml(holding.ticker || holding.assetName)}</strong><small>${escapeHtml(holding.sleeve)}</small></span><span>${money(holding.marketValue)}</span>`;
      button.addEventListener("click", () => selectScope({ sleeve: holding.sleeve }));
      return button;
    }),
  );
}

function renderDrillPath() {
  const holding = representativeHolding();
  if (!holding) {
    el.drillPath.innerHTML = "<p>No holdings available.</p>";
    return;
  }

  const sleeve = state.selectedSleeve === "All" ? holding.sleeve : state.selectedSleeve;
  const path = ["Portfolio", ...parentPath(sleeve), sleeve, holding.ticker || holding.assetName];
  const metrics = [
    ["Level 0", "Portfolio", "All imported and classified holdings"],
    ["Level 1+", parentPath(sleeve).concat(sleeve).join(" > "), "Sleeve hierarchy from taxonomy"],
    ["Leaf", holding.ticker || holding.assetName, `${holding.assetName} | ${money(holding.marketValue)}`],
  ];

  el.drillPath.replaceChildren(
    nodeList(path),
    ...metrics.map(([label, title, detail]) => {
      const item = document.createElement("div");
      item.className = "pathMetric";
      item.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small>`;
      return item;
    }),
  );
}

function representativeHolding() {
  const filtered = state.holdings
    .filter((holding) => isAllScope() || inSelection(holding))
    .sort((a, b) => b.marketValue - a.marketValue);
  return filtered[0] || state.holdings.slice().sort((a, b) => b.marketValue - a.marketValue)[0];
}

function parentPath(sleeve) {
  const path = [];
  let current = SLEEVE_PARENTS[sleeve];
  while (current) {
    path.unshift(current);
    current = SLEEVE_PARENTS[current];
  }
  return path;
}

function nodeList(path) {
  const list = document.createElement("ol");
  list.className = "pathNodes";
  path.forEach((node, index) => {
    const item = document.createElement("li");
    item.innerHTML = `<span>${index}</span><strong>${escapeHtml(node)}</strong>`;
    list.appendChild(item);
  });
  return list;
}

function renderMapper() {
  const headers = Object.keys(state.rows[0] || {});
  el.rowCount.textContent = headers.length ? `${state.rows.length} rows parsed` : "Sample data loaded";
  el.emptyImport.style.display = headers.length ? "none" : "flex";
  el.mapper.style.display = headers.length ? "grid" : "none";
  el.mapper.replaceChildren(
    ...["account", "ticker", "assetName", "shares", "price", "marketValue", "sleeve", "costBasis", "valuationDate"].map((field) => {
      const label = document.createElement("label");
      const select = document.createElement("select");
      select.innerHTML = `<option value="">Not mapped</option>${headers
        .map((header) => `<option value="${escapeAttr(header)}">${escapeHtml(header)}</option>`)
        .join("")}`;
      select.value = state.mapping[field] || "";
      select.addEventListener("change", async () => {
        state.mapping[field] = select.value || undefined;
        state.valuationDate = detectValuationDate(state.rows, state.mapping) || state.valuationDate;
        el.valuationDateInput.value = state.valuationDate;
        await applyImport("column remap");
      });
      label.innerHTML = `<span>${fieldLabel(field)}</span>`;
      label.appendChild(select);
      return label;
    }),
  );
  el.errors.replaceChildren(...state.errors.slice(0, 5).map((error) => span(error)));
}

function renderSnapshots() {
  if (!state.db) {
    el.snapshotTimeline.replaceChildren(span("Snapshot database is not available in this browser context."));
    return;
  }

  if (!state.snapshots.length) {
    el.snapshotTimeline.replaceChildren(span("No saved snapshots yet. Upload a CSV with a valuation date to begin temporal tracking."));
    return;
  }

  el.snapshotStatus.textContent = `${state.snapshots.length} saved snapshot${state.snapshots.length === 1 ? "" : "s"}.`;
  el.snapshotTimeline.replaceChildren(
    ...state.snapshots.map((snapshot) => {
      const item = document.createElement("div");
      item.className = "snapshotItem";
      const active = snapshot.id === state.activeSnapshotId ? "Active" : "Load";
      item.innerHTML = `
        <button type="button">${escapeHtml(active)} ${escapeHtml(snapshot.valuationDate)}</button>
        <small>${escapeHtml(snapshot.sourceName || "Imported snapshot")} | ${snapshot.rowCount} holdings</small>
        <strong>${escapeHtml(new Date(snapshot.importedAt).toLocaleDateString())}</strong>`;
      item.querySelector("button").addEventListener("click", async () => {
        await loadSnapshot(snapshot.id);
      });
      return item;
    }),
  );
}

function renderPerformanceSeries() {
  if (!state.snapshots.length) {
    el.performanceSeries.replaceChildren();
    return;
  }

  const maxValue = Math.max(...state.snapshots.map((snapshot) => snapshot.totalValue || 0), 1);
  el.performanceSeries.replaceChildren(
    ...state.snapshots.map((snapshot) => {
      const item = document.createElement("div");
      item.className = "seriesItem";
      const width = Math.max(((snapshot.totalValue || 0) / maxValue) * 100, 2);
      item.innerHTML = `
        <strong>${escapeHtml(snapshot.valuationDate)}</strong>
        <span class="seriesBar"><span style="width:${width}%"></span></span>
        <small>${money(snapshot.totalValue || 0)}</small>`;
      return item;
    }),
  );
}

// Gain/Loss cell: "$419,935  +76.1%", coloured green (gain) / red (loss). pct omitted when no basis.
function glCell(marketValue, costBasis, hidePct = false) {
  const gain = (marketValue || 0) - (costBasis || 0);
  const pct = costBasis ? gain / costBasis : 0;
  const cls = gain >= 0 ? "up" : "down";
  // % is suppressed for options — short premium inverts the cost-basis math, so the % is meaningless.
  const pctTxt = (costBasis && !hidePct) ? ` <em>${(gain >= 0 ? "+" : "") + (pct * 100).toFixed(1)}%</em>` : "";
  return `<td class="num gl ${cls}">${money(gain)}${pctTxt}</td>`;
}

// ── PIVOT / MATRIX (Phase 1) ──────────────────────────────────────────────────
// Cross-tab the book by any two holding dimensions (1-D when Columns = None). All
// dimensions are derived in-browser from the existing book (no ingestion): asset
// class + convex role reuse the sleeve rollup; style×size + liquidity parse the
// sleeve; account is a book field. (Region — look-through country weights — lands in
// Phase 2 once the export carries it.) Clicking a cell filters the holdings table.
const _PRIVATE_SLEEVES = new Set(["Private Real Estate", "Private Credit", "Private Alternatives", "Buyout"]);

function styleSizeOfSleeve(sleeve) {
  const t = (sleeve || "").toLowerCase();
  const size = /\blarge\b/.test(t) ? "Large" : /\bmid/.test(t) ? "Mid" : /\bsmall\b/.test(t) ? "Small" : null;
  const style = /\bvalue\b/.test(t) ? "Value" : /\bgrowth\b/.test(t) ? "Growth" : /\bblend\b/.test(t) ? "Blend" : null;
  if (size && style) return `${size} ${style}`;
  if (size) return `${size} Blend`;
  if (/technology|industrials?|utilities|energy|real estate|natural resources|materials|health/.test(t)) return "Sector / Thematic";
  return "Non-equity";
}
function liquidityOfSleeve(sleeve) {
  return _PRIVATE_SLEEVES.has(sleeve) ? "Private" : "Liquid";
}

const PIVOT_DIMS = [
  { key: "asset_class", label: "Asset Class", of: (h) => bucketOfSleeve(h.sleeve), order: () => ROLLUP_BUCKETS.map((b) => b.name) },
  { key: "convex_role", label: "Convex Role", of: (h) => convexRoleForSleeve(h.sleeve) || "Other", order: () => _CONVEX_ROLE_ORDER },
  { key: "style_size", label: "Style × Size", of: (h) => styleSizeOfSleeve(h.sleeve) },
  { key: "account", label: "Account", of: (h) => h.brokerageAccount || "—" },
  { key: "liquidity", label: "Liquidity", of: (h) => liquidityOfSleeve(h.sleeve) },
  // Region is a LOOK-THROUGH (weighted) dimension: a fund splits across regions by its
  // country breakdown, so a holding's value is apportioned across cells (not one cell).
  { key: "region", label: "Region (look-through)", order: () => ["US", "Foreign Developed", "Emerging Markets", "Other", "Unknown"],
    dist: (h) => {
      const ex = REGION_EXPOSURE[(h.ticker || "").toUpperCase()];
      if (!ex) return { "Unknown": 1 };
      const out = {}; let tot = 0;
      for (const k in ex) { const f = (+ex[k]) / 100; if (f > 0) { out[k] = f; tot += f; } }
      if (tot <= 0) return { "Unknown": 1 };
      for (const k in out) out[k] /= tot;
      return out;
    } },
  { key: "sleeve", label: "Sleeve", of: (h) => h.sleeve || "—" },
];
const pivotDim = (key) => PIVOT_DIMS.find((d) => d.key === key) || PIVOT_DIMS[0];

// A holding's distribution over a dimension's categories: a plain dim → {cat: 1}; a
// look-through dim (e.g. Region) → {cat: fraction} summing to 1. Unifies the aggregation
// so weighted + single dimensions share one code path.
function _distOf(dim, h) {
  return dim.dist ? dim.dist(h) : { [dim.of(h)]: 1 };
}

function matchesPivotCell(holding) {
  const pc = state.pivotCell;
  if (!pc) return true;
  if (!(_distOf(pivotDim(pc.rowKey), holding)[pc.rowVal] > 0)) return false;
  if (pc.colKey && !(_distOf(pivotDim(pc.colKey), holding)[pc.colVal] > 0)) return false;
  return true;
}

function _pivotCatsByValue(dim, holdings) {
  const totals = {};
  for (const h of holdings) {
    const v = h.marketValue || 0;
    const d = _distOf(dim, h);
    for (const c in d) totals[c] = (totals[c] || 0) + v * d[c];
  }
  let cats = Object.keys(totals).filter((c) => totals[c] > 0);
  if (dim.order) {
    const ord = dim.order();
    cats.sort((a, b) => ((ord.indexOf(a) + 1) || 999) - ((ord.indexOf(b) + 1) || 999) || totals[b] - totals[a]);
  } else {
    cats.sort((a, b) => totals[b] - totals[a]);
  }
  return { cats, totals };
}

function renderPivot() {
  if (!el.pivot) return;
  const rowDim = pivotDim(state.pivotRow);
  const colDim = state.pivotCol === "none" ? null : pivotDim(state.pivotCol);
  const hs = state.holdings;
  const e = escapeHtml;
  if (!hs.length) { el.pivot.innerHTML = ""; return; }
  const grand = hs.reduce((s, h) => s + (h.marketValue || 0), 0) || 1;

  const dimOptions = (sel, withNone) =>
    (withNone ? `<option value="none"${sel === "none" ? " selected" : ""}>— None (1-D) —</option>` : "") +
    PIVOT_DIMS.map((d) => `<option value="${d.key}"${sel === d.key ? " selected" : ""}>${e(d.label)}</option>`).join("");

  let html = `<header class="pivotHead"><h2>Pivot / Matrix</h2>
    <div class="pivotCtl">
      <label>Rows <select id="pivotRowSel">${dimOptions(state.pivotRow, false)}</select></label>
      <label>Columns <select id="pivotColSel">${dimOptions(state.pivotCol, true)}</select></label>
      <button id="pivotFullBtn" class="pivotFullBtn" type="button" title="Toggle full screen">⛶ Full screen</button>
    </div></header>`;

  const { cats: rowCats, totals: rowOnly } = _pivotCatsByValue(rowDim, hs);

  if (!colDim) {
    html += `<table class="pivotTable"><thead><tr><th>${e(rowDim.label)}</th><th class="num">Value</th><th class="num">%</th></tr></thead><tbody>`;
    for (const c of rowCats) {
      const v = rowOnly[c] || 0;
      html += `<tr class="pivotCell" data-row="${e(c)}"><td>${e(c)}</td><td class="num">${money(v)}</td><td class="num">${percent(v / grand)}</td></tr>`;
    }
    html += `<tr class="pivotTotal"><td>Total</td><td class="num">${money(grand)}</td><td class="num">100%</td></tr></tbody></table>`;
  } else {
    const { cats: colCats, totals: colTot } = _pivotCatsByValue(colDim, hs);
    const cell = {};
    for (const h of hs) {
      const v = h.marketValue || 0;
      const rd = _distOf(rowDim, h), cd = _distOf(colDim, h);
      for (const r in rd) for (const c in cd) {
        cell[r + "" + c] = (cell[r + "" + c] || 0) + v * rd[r] * cd[c];
      }
    }
    html += `<div class="pivotScroll"><table class="pivotTable matrix"><thead><tr><th>${e(rowDim.label)} \\ ${e(colDim.label)}</th>`;
    for (const c of colCats) html += `<th class="num">${e(c)}</th>`;
    html += `<th class="num total">Total</th></tr></thead><tbody>`;
    for (const r of rowCats) {
      html += `<tr><th>${e(r)}</th>`;
      for (const c of colCats) {
        const v = cell[r + "" + c] || 0;
        html += v > 0
          ? `<td class="num pivotCell" data-row="${e(r)}" data-col="${e(c)}" title="${e(r)} × ${e(c)} — ${percent(v / grand)} of book">${money(v)}</td>`
          : `<td class="num empty">·</td>`;
      }
      html += `<td class="num total">${money(rowOnly[r] || 0)}</td></tr>`;
    }
    html += `<tr class="pivotTotal"><th>Total</th>`;
    for (const c of colCats) html += `<td class="num">${money(colTot[c] || 0)}</td>`;
    html += `<td class="num total">${money(grand)}</td></tr></tbody></table></div>`;
  }

  {
    // Dependency-free SVG donut shown UNDER the table (always on) — 1-D % breakdown by the Rows
    // dimension (row totals; ignores any column split). Slices carry "pivotSlice" + data-cat for filter.
    const R = 62, W = 30, CIRC = 2 * Math.PI * R, CX = 80, CY = 80;
    const PALETTE = ["#1f77b4", "#2ca02c", "#d62728", "#9467bd", "#ff7f0e", "#17becf", "#8c564b", "#e377c2", "#bcbd22", "#5b8c5a", "#c49c2e", "#7f7f7f"];
    const slices = rowCats.map((c) => ({ c, v: rowOnly[c] || 0 })).filter((s) => s.v > 0);
    if (slices.length && grand) {
      let off = 0, rings = "", legend = "";
      slices.forEach((s, i) => {
        const frac = s.v / grand, len = frac * CIRC, col = PALETTE[i % PALETTE.length];
        rings += `<circle class="pivotSlice" data-cat="${e(s.c)}" cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${col}" stroke-width="${W}" stroke-dasharray="${len.toFixed(2)} ${(CIRC - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"><title>${e(s.c)} — ${percent(frac)} (${money(s.v)})</title></circle>`;
        legend += `<button type="button" class="pivotSlice pivotLegItem" data-cat="${e(s.c)}"><span class="pivotLegSw" style="background:${col}"></span><span class="pivotLegLbl">${e(s.c)}</span><strong>${percent(frac)}</strong><em>${money(s.v)}</em></button>`;
        off += len;
      });
      html += `<div class="pivotChart"><svg class="pivotDonut" viewBox="0 0 160 160" role="img" aria-label="${e(rowDim.label)} breakdown"><g transform="rotate(-90 ${CX} ${CY})">${rings}</g><text x="${CX}" y="${CY - 2}" class="pivotDonutLbl">${e(rowDim.label)}</text><text x="${CX}" y="${CY + 16}" class="pivotDonutTot">${money(grand)}</text></svg><div class="pivotLegend">${legend}</div></div>`;
    }
  }

  if (state.pivotCell) {
    const pc = state.pivotCell;
    const lbl = `${e(pivotDim(pc.rowKey).label)} = ${e(pc.rowVal)}` +
      (pc.colKey ? ` × ${e(pivotDim(pc.colKey).label)} = ${e(pc.colVal)}` : "");
    html += `<div class="pivotFilter">Holdings filtered to <strong>${lbl}</strong> <button id="pivotClear" type="button">✕ clear</button></div>`;
  }
  el.pivot.innerHTML = html;

  el.pivot.querySelectorAll(".pivotSlice").forEach((sl) => {   // donut slice / legend → filter holdings to that row category
    sl.addEventListener("click", () => {
      state.pivotCell = { rowKey: state.pivotRow, rowVal: sl.dataset.cat, colKey: null, colVal: null };
      render();
      if (el.holdings) el.holdings.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Full-screen toggle — CSS overlay (the native Fullscreen API isn't supported for arbitrary
  // elements on iPad Safari). The .pivotFull class lives on #pivot so it survives innerHTML rebuilds.
  const fullBtn = el.pivot.querySelector("#pivotFullBtn");
  if (fullBtn) {
    const syncFull = () => {
      fullBtn.textContent = el.pivot.classList.contains("pivotFull") ? "✕ Exit full screen" : "⛶ Full screen";
    };
    syncFull();
    fullBtn.addEventListener("click", () => {
      const on = el.pivot.classList.toggle("pivotFull");
      document.body.classList.toggle("pivotFullOpen", on);   // lock the background scroll
      syncFull();
    });
  }
  if (!window._pivotEscWired) {                              // global Esc-to-exit, wired once
    window._pivotEscWired = true;
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && el.pivot?.classList.contains("pivotFull")) {
        el.pivot.classList.remove("pivotFull");
        document.body.classList.remove("pivotFullOpen");
        const b = el.pivot.querySelector("#pivotFullBtn");
        if (b) b.textContent = "⛶ Full screen";
      }
    });
  }

  el.pivot.querySelector("#pivotRowSel").addEventListener("change", (ev) => {
    state.pivotRow = ev.target.value; saveJson("pivotRow", state.pivotRow); state.pivotCell = null; render();
  });
  el.pivot.querySelector("#pivotColSel").addEventListener("change", (ev) => {
    state.pivotCol = ev.target.value; saveJson("pivotCol", state.pivotCol); state.pivotCell = null; render();
  });
  const clearBtn = el.pivot.querySelector("#pivotClear");
  if (clearBtn) clearBtn.addEventListener("click", () => { state.pivotCell = null; render(); });
  el.pivot.querySelectorAll(".pivotCell").forEach((td) => {
    td.addEventListener("click", () => {
      state.pivotCell = {
        rowKey: state.pivotRow, rowVal: td.dataset.row,
        colKey: colDim ? state.pivotCol : null, colVal: colDim ? td.dataset.col : null,
      };
      render();
      if (el.holdings) el.holdings.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderHoldings() {
  const query = state.query.trim().toLowerCase();
  const holdings = state.holdings.filter((holding) => {
    const queryMatch =
      !query || holding.ticker.toLowerCase().includes(query) || holding.assetName.toLowerCase().includes(query);
    // A clicked pivot cell takes precedence over the sidebar sleeve selection.
    if (state.pivotCell) return matchesPivotCell(holding) && queryMatch;
    return inSelection(holding) && queryMatch;
  });

  // Columns are value-only-book appropriate: Ticker · Asset · [Sleeve] · Cost · Value · Gain/Loss.
  // Sleeve appears ONLY in the All view (in a sleeve drill-down every row is that sleeve → it's the
  // panel title). Shares (never populated) + Price (it was just the value) + per-row Source dropped.
  const isAll = state.selectedSleeve === "All";

  // MERGE lots of the same ticker (e.g. the same ETF held across accounts) into one row, summing
  // cost + value. Keyed by ticker + sleeve so a ticker that legitimately sits in two sleeves stays
  // separate. Biggest position first.
  const groups = new Map();
  for (const h of holdings) {
    const key = (h.ticker || h.assetName || "").toUpperCase() + "||" + h.sleeve;
    let g = groups.get(key);
    if (!g) { g = { ticker: h.ticker, assetName: h.assetName, sleeve: h.sleeve, shares: 0, costBasis: 0, marketValue: 0, lots: [] }; groups.set(key, g); }
    g.costBasis += h.costBasis || 0;
    g.marketValue += h.marketValue || 0;
    g.shares += h.shares || 0;
    g.lots.push(h);
  }
  const rows = [...groups.values()].sort((a, b) => b.marketValue - a.marketValue);

  // ADAPTIVE Shares + Price columns: only shown when the imported book carries share counts (the
  // value-only consolidated book has none → hidden; a broker CSV with Qty shows them). Price is
  // DERIVED value÷shares so a merged row gets a correct weighted price even when lots differ.
  const hasShares = state.holdings.some((h) => (h.shares || 0) > 0);
  el.holdingsHead.innerHTML =
    `<th>Ticker</th><th>Asset</th>` + (isAll ? `<th>Sleeve</th>` : ``) +
    (hasShares ? `<th class="num">Shares</th><th class="num">Price</th>` : ``) +
    `<th class="num">Cost</th><th class="num">Value</th><th class="num">Gain / Loss</th>`;

  el.holdingsBody.replaceChildren(
    ...rows.map((g) => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td class="ticker">${escapeHtml(g.ticker || "-")}${g.lots.length > 1 ? `<small class="lots" title="${g.lots.length} lots merged">×${g.lots.length}</small>` : ``}</td>` +
        `<td>${escapeHtml(g.assetName)}</td>` +
        (isAll ? `<td class="sleeveCell"></td>` : ``) +
        (hasShares ? `<td class="num">${number(g.shares)}</td><td class="num">${g.shares > 0 ? priceUsd(g.marketValue / g.shares) : "—"}</td>` : ``) +
        `<td class="num">${g.costBasis ? money(g.costBasis) : "—"}</td>` +
        `<td class="num strong">${money(g.marketValue)}</td>` +
        glCell(g.marketValue, g.costBasis, g.sleeve === "Options");
      if (isAll) {
        const select = document.createElement("select");
        select.innerHTML = DEFAULT_SLEEVES.map((sleeve) => `<option value="${escapeAttr(sleeve)}">${escapeHtml(sleeve)}</option>`).join("");
        select.value = g.sleeve;
        select.addEventListener("change", () => {
          for (const h of g.lots) {            // reassigning a merged row moves every underlying lot
            state.assignments[assignmentKey(h.ticker, h.assetName)] = select.value;
            h.sleeve = select.value;
            h.assignmentSource = "manual";
          }
          saveJson("assignments", state.assignments);
          saveJson("holdings", state.holdings);
          render();
        });
        tr.querySelector(".sleeveCell").appendChild(select);
      }
      return tr;
    }),
  );

  // Totals footer for the current view (sleeve total cost / value / gain).
  const tShares = holdings.reduce((s, h) => s + (h.shares || 0), 0);
  const tCost = holdings.reduce((s, h) => s + (h.costBasis || 0), 0);
  const tVal = holdings.reduce((s, h) => s + (h.marketValue || 0), 0);
  const tGain = tVal - tCost;
  const tPct = tCost ? tGain / tCost : 0;
  const optScope = state.selectedBucket === "Options" || state.selectedSleeve === "Options";   // % meaningless for shorts
  el.holdingsFoot.innerHTML = rows.length
    ? `<tr><td colspan="${isAll ? 3 : 2}">${rows.length} holding${rows.length === 1 ? "" : "s"}</td>` +
      (hasShares ? `<td class="num">${number(tShares)}</td><td></td>` : ``) +
      `<td class="num">${money(tCost)}</td><td class="num strong">${money(tVal)}</td>` +
      `<td class="num gl ${tGain >= 0 ? "up" : "down"}">${money(tGain)}${(tCost && !optScope) ? ` <em>${(tGain >= 0 ? "+" : "") + (tPct * 100).toFixed(1)}%</em>` : ""}</td></tr>`
    : "";
}

function buildPortfolioCube(holdings) {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalCostBasis = holdings.reduce((sum, holding) => sum + (holding.costBasis || 0), 0);
  const sleeveMap = new Map();

  holdings.forEach((holding) => {
    const sleeve = holding.sleeve || "Unclassified";
    const current = sleeveMap.get(sleeve) || { sleeve, value: 0, count: 0, unrealizedGain: 0 };
    current.value += holding.marketValue;
    current.count += 1;
    current.unrealizedGain += holding.costBasis ? holding.marketValue - holding.costBasis : 0;
    sleeveMap.set(sleeve, current);
  });

  const sleeves = [...sleeveMap.values()]
    .map((sleeve) => ({ ...sleeve, weight: totalValue ? sleeve.value / totalValue : 0 }))
    .sort((a, b) => b.value - a.value);
  const topHoldings = [...holdings].sort((a, b) => b.marketValue - a.marketValue).slice(0, 8);
  const unclassifiedValue = holdings
    .filter((holding) => holding.sleeve === "Unclassified")
    .reduce((sum, holding) => sum + holding.marketValue, 0);

  return {
    totalValue,
    totalCostBasis,
    unrealizedGain: totalValue - totalCostBasis,
    classifiedValue: totalValue - unclassifiedValue,
    unclassifiedValue,
    sleeves,
    topHoldings,
  };
}

function toPositionValuation(holding, snapshot) {
  const assetKey = assignmentKey(holding.ticker, holding.assetName);
  return {
    id: `${snapshot.id}-${assetKey}-${holding.brokerageAccount || "account"}`,
    snapshotId: snapshot.id,
    portfolioId: snapshot.portfolioId,
    valuationDate: holding.valuationDate || snapshot.valuationDate,
    brokerageAccount: holding.brokerageAccount || "",
    ticker: holding.ticker,
    assetName: holding.assetName,
    assetKey,
    shares: holding.shares,
    price: holding.price,
    marketValue: holding.marketValue,
    costBasis: holding.costBasis,
    sleeveCode: holding.sleeve,
    sleeveName: holding.sleeve,
    sourceRow: holding.sourceRow,
  };
}

async function refreshSnapshots() {
  if (!state.db) return;
  const snapshots = await getAllFromStore("portfolio_snapshots");
  const valuations = await getAllFromStore("position_valuations");
  state.snapshots = snapshots
    .filter((snapshot) => snapshot.portfolioId === DEFAULT_PORTFOLIO_ID)
    .map((snapshot) => ({
      ...snapshot,
      totalValue: valuations
        .filter((valuation) => valuation.snapshotId === snapshot.id)
        .reduce((sum, valuation) => sum + valuation.marketValue, 0),
    }))
    .sort((a, b) => a.valuationDate.localeCompare(b.valuationDate));
}

async function loadSnapshot(snapshotId) {
  const valuations = (await getAllFromStore("position_valuations")).filter((valuation) => valuation.snapshotId === snapshotId);
  state.holdings = valuations.map((valuation, index) => ({
    id: `${valuation.assetKey}-${index}`,
    snapshotId: valuation.snapshotId,
    valuationDate: valuation.valuationDate,
    brokerageAccount: valuation.brokerageAccount,
    ticker: valuation.ticker || "",
    assetName: valuation.assetName,
    shares: valuation.shares,
    price: valuation.price,
    marketValue: valuation.marketValue,
    sleeve: valuation.sleeveName,
    assignmentSource: "imported",
    costBasis: valuation.costBasis,
    sourceRow: valuation.sourceRow || {},
  }));
  state.activeSnapshotId = snapshotId;
  const snapshot = state.snapshots.find((item) => item.id === snapshotId);
  state.valuationDate = snapshot?.valuationDate || state.valuationDate;
  el.valuationDateInput.value = state.valuationDate;
  saveJson("holdings", state.holdings);
  render();
}

async function ensureDefaultPortfolio() {
  const existing = await getFromStore("portfolios", DEFAULT_PORTFOLIO_ID);
  if (!existing) {
    await putInStore("portfolios", {
      id: DEFAULT_PORTFOLIO_ID,
      name: "Default Portfolio",
      baseCurrency: "USD",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

async function saveSnapshot(snapshot, valuations) {
  const existingSnapshots = (await getAllFromStore("portfolio_snapshots")).filter(
    (item) => item.portfolioId === snapshot.portfolioId && item.valuationDate === snapshot.valuationDate,
  );
  for (const existing of existingSnapshots) {
    await deleteFromStore("portfolio_snapshots", existing.id);
    const existingValuations = (await getAllFromStore("position_valuations")).filter(
      (valuation) => valuation.snapshotId === existing.id,
    );
    for (const valuation of existingValuations) {
      await deleteFromStore("position_valuations", valuation.id);
    }
  }

  await putInStore("portfolio_snapshots", snapshot);
  for (const valuation of valuations) {
    await putInStore("position_valuations", valuation);
  }
}

function openPortfolioDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("portfolios")) db.createObjectStore("portfolios", { keyPath: "id" });
      if (!db.objectStoreNames.contains("portfolio_snapshots")) {
        const store = db.createObjectStore("portfolio_snapshots", { keyPath: "id" });
        store.createIndex("portfolioDate", ["portfolioId", "valuationDate"], { unique: false });
      }
      if (!db.objectStoreNames.contains("position_valuations")) {
        const store = db.createObjectStore("position_valuations", { keyPath: "id" });
        store.createIndex("snapshotId", "snapshotId", { unique: false });
        store.createIndex("portfolioDate", ["portfolioId", "valuationDate"], { unique: false });
        store.createIndex("assetDate", ["assetKey", "valuationDate"], { unique: false });
      }
      if (!db.objectStoreNames.contains("manual_assignments")) db.createObjectStore("manual_assignments", { keyPath: "id" });
      if (!db.objectStoreNames.contains("column_mapping_presets")) db.createObjectStore("column_mapping_presets", { keyPath: "id" });
      if (!db.objectStoreNames.contains("sleeve_definitions")) db.createObjectStore("sleeve_definitions", { keyPath: "code" });
      if (!db.objectStoreNames.contains("app_settings")) db.createObjectStore("app_settings", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(storeName) {
  return dbRequest(storeName, "readonly", (store) => store.getAll());
}

function getFromStore(storeName, key) {
  return dbRequest(storeName, "readonly", (store) => store.get(key));
}

function putInStore(storeName, value) {
  return dbRequest(storeName, "readwrite", (store) => store.put(value));
}

function deleteFromStore(storeName, key) {
  return dbRequest(storeName, "readwrite", (store) => store.delete(key));
}

function dbRequest(storeName, mode, operation) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(storeName, mode);
    const request = operation(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

function parseCsv(text) {
  const rows = parseCsvRows(text);
  const [headerRow, ...dataRows] = rows.filter((row) => row.some((cell) => cell.trim()));
  if (!headerRow) return [];
  const headers = headerRow.map((header, index) => header.trim() || `Column ${index + 1}`);
  return dataRows.map((row) => Object.fromEntries(headers.map((header, index) => [header, (row[index] || "").trim()])));
}

function parseCsvRows(input) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

function detectColumnMapping(headers) {
  const mapping = {};
  Object.entries(COLUMN_ALIASES).forEach(([field, aliases]) => {
    const match = headers.find((header) => {
      const normalized = normalizeHeader(header);
      return aliases.some((alias) => normalized === normalizeHeader(alias) || normalized.includes(normalizeHeader(alias)));
    });
    if (match) mapping[field] = match;
  });
  return mapping;
}

function normalizeHoldings(rows, mapping, fallbackValuationDate) {
  const holdings = [];
  const errors = [];
  rows.forEach((row, index) => {
    const ticker = normalizeTicker(read(row, mapping.ticker));
    const assetName = read(row, mapping.assetName) || ticker || `Row ${index + 1}`;
    const valuationDate = normalizeDate(read(row, mapping.valuationDate)) || fallbackValuationDate;
    const shares = parseNumber(read(row, mapping.shares));
    const price = parseNumber(read(row, mapping.price));
    const importedMarketValue = parseNumber(read(row, mapping.marketValue));
    const marketValue = importedMarketValue || shares * price;
    if (!valuationDate) {
      errors.push(`Row ${index + 1}: missing valuation date.`);
      return;
    }
    if (!Number.isFinite(marketValue) || marketValue === 0) {
      // keep real NEGATIVE values (short options/liabilities); drop only missing/zero (no data)
      errors.push(`Row ${index + 1}: missing market value, or shares and price.`);
      return;
    }
    const assignment = classifyHolding(ticker, assetName, read(row, mapping.sleeve));
    holdings.push({
      id: `${ticker || assetName}-${index}`,
      snapshotId: `snapshot-${valuationDate}`,
      valuationDate,
      brokerageAccount: read(row, mapping.account),
      ticker,
      assetName,
      shares: Number.isFinite(shares) ? shares : 0,
      price: Number.isFinite(price) ? price : marketValue,
      marketValue,
      sleeve: assignment.sleeve,
      assignmentSource: assignment.source,
      costBasis: optionalNumber(read(row, mapping.costBasis)),
      beta: optionalNumber(read(row, mapping.beta)),
      sourceRow: row,
    });
  });
  return { holdings, errors };
}

function classifyHolding(ticker, assetName, importedSleeve) {
  const sleeve = importedSleeve.trim();
  if (sleeve) return { sleeve, source: "imported" };
  const manual = state.assignments[assignmentKey(ticker, assetName)];
  if (manual) return { sleeve: manual, source: "manual" };
  const auto = autoClassify(ticker, assetName);
  return auto ? { sleeve: auto, source: "auto" } : { sleeve: "Unclassified", source: "unclassified" };
}

// Mirrors portfolio_analysis.py classify_code(): exact ticker → name keyword (in array
// order) → CUSIP fallback → null. Returns the display sleeve NAME (via codeToName), or
// null when nothing matches (→ Unclassified). Falls back to legacy TICKER_RULES if the
// shared rules file failed to load.
function autoClassify(ticker, assetName) {
  const t = normalizeTicker(ticker);
  const name = assetName.toLowerCase();
  const R = CLASSIFICATION_RULES;
  if (R) {
    let code = R.tickerRules[t];
    if (!code) {
      const nr = R.nameRules.find((rule) => rule.keywords.some((k) => name.includes(k)));
      code = nr && nr.code;
    }
    if (!code) {
      for (const fb of R.fallbackRules) {
        if (new RegExp(fb.symbolPattern).test(t) && (!fb.nameAny || fb.nameAny.some((k) => name.includes(k)))) {
          code = fb.code;
          break;
        }
      }
    }
    return code ? (R.codeToName[code] || code) : null;
  }
  const match = TICKER_RULES.find((rule) => rule.tickers.includes(t) || rule.words.some((word) => name.includes(word)));
  return match ? match.sleeve : null;
}

function assignmentKey(ticker, assetName) {
  return normalizeTicker(ticker) || assetName.trim().toLowerCase();
}

function normalizeTicker(ticker) {
  return ticker.trim().toUpperCase();
}

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function read(row, column) {
  return column ? row[column] || "" : "";
}

function optionalNumber(value) {
  const parsed = parseNumber(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function detectValuationDate(rows, mapping) {
  const dates = rows
    .map((row) => normalizeDate(read(row, mapping.valuationDate)))
    .filter(Boolean);
  return dates.length ? dates[0] : "";
}

function normalizeDate(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];
    return `${year}-${slash[1].padStart(2, "0")}-${slash[2].padStart(2, "0")}`;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return "";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || min));
}

function parseNumber(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return Number.NaN;
  const negative = /^\(.*\)$/.test(trimmed);
  const parsed = Number(trimmed.replace(/[,$%()]/g, ""));
  return negative ? -parsed : parsed;
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

// like money() but with cents — for per-share prices ($121.85, not $122).
function priceUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function percent(value) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);
}

function number(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(Number.isFinite(value) ? value : 0);
}

function fieldLabel(field) {
  return {
    account: "Account",
    ticker: "Ticker",
    assetName: "Asset Name",
    shares: "Shares",
    price: "Share Price",
    marketValue: "Market Value",
    sleeve: "Sleeve",
    costBasis: "Cost Basis",
    valuationDate: "Valuation Date",
  }[field];
}

function span(text) {
  const item = document.createElement("span");
  item.textContent = text;
  return item;
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char];
  });
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

async function openManual() {
  el.manualContent.innerHTML = "<p>Loading manual...</p>";
  el.manualDialog.showModal();

  try {
    const response = await fetch("./USER_MANUAL.md", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Manual request failed with ${response.status}`);
    }
    el.manualContent.innerHTML = renderMarkdown(await response.text());
  } catch (error) {
    el.manualContent.innerHTML = `
      <h1>Manual Unavailable</h1>
      <p>The app could not load <code>USER_MANUAL.md</code>.</p>
      <p>Open the app from the local server at <code>http://127.0.0.1:4173/</code>, then click Manual again.</p>
    `;
  }
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inList = false;
  let inCode = false;
  let codeLines = [];
  let inTable = false;
  let tableRows = [];

  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }
  function flushTable() {
    if (!inTable) return;
    const cells = tableRows.map((r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
    const header = cells[0] || [];
    const sep = cells[1] && cells[1].every((c) => /^:?-{2,}:?$/.test(c));   // |---|---| divider
    const body = cells.slice(sep ? 2 : 1);
    let t = `<table class="manualTable"><thead><tr>${header.map((h) => `<th>${inlineMarkdown(h)}</th>`).join("")}</tr></thead><tbody>`;
    for (const row of body) t += `<tr>${row.map((c) => `<td>${inlineMarkdown(c)}</td>`).join("")}</tr>`;
    html.push(t + "</tbody></table>");
    tableRows = [];
    inTable = false;
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        flushTable();
        closeList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 1) {
      closeList();
      tableRows.push(trimmed);
      inTable = true;
      continue;
    }
    if (inTable) flushTable();   // any non-table line (incl. blank) ends a table

    if (!trimmed) {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = Math.min(heading[1].length, 4);
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^-\s+(.+)$/);
    if (bullet) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(bullet[1])}</li>`);
      continue;
    }

    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      closeList();
      html.push(`<p class="manualStep">${inlineMarkdown(numbered[1])}</p>`);
      continue;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  flushTable();
  closeList();
  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }

  return html.join("");
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
