const APP_VERSION = "v2.0";

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
  "Bonds",
  "Junk Bonds",
  "Corporate Bonds",
  "Municipal Bonds",
  "Treasuries / Duration",
  "Bank Loans / Floating Rate",
  "Bonds / Credit",
  "Public Bonds",
  "Private Credit",
  "Direct Lending",
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
  { sleeve: "Bonds", tickers: ["BND", "AGG", "TLT", "IEF", "SHY", "TIP"], words: ["bond", "treasury", "fixed income"] },
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
  "Bonds": "Public Bonds",
  "Public Bonds": "Bonds / Credit",
  "Junk Bonds": "Public Bonds",
  "Corporate Bonds": "Public Bonds",
  "Municipal Bonds": "Public Bonds",
  "Treasuries / Duration": "Public Bonds",
  "Bank Loans / Floating Rate": "Public Bonds",
  "Private Credit": "Bonds / Credit",
  "Direct Lending": "Private Credit",
  "Precious Metals": "Commodities",
  "Broad Commodities": "Commodities",
  "Managed Futures": "Liquid Alternatives",
  "Trend Following": "Liquid Alternatives",
  "Trend Following Managed Futures": "Liquid Alternatives",
  "Liquid Alternatives": "Alternatives",
  "Private Alternatives": "Alternatives",
  "Real Assets": "Alternatives",
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
  planning: document.querySelector("#planning"),
  overlay: document.querySelector("#overlay"),
  allocationBars: document.querySelector("#allocationBars"),
  topHoldings: document.querySelector("#topHoldings"),
  drillPath: document.querySelector("#drillPath"),
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
el.loadBookButton.addEventListener("click", async () => {
  const btn = el.loadBookButton;
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Loading…";
  try {
    const res = await fetch("./consolidated_holdings.csv", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} — run portfolio_analysis.py to generate it`);
    const rows = parseCsv(await res.text());
    if (!rows.length) throw new Error("consolidated_holdings.csv is empty");
    state.rows = rows;
    state.mapping = detectColumnMapping(Object.keys(rows[0] || {}));
    state.valuationDate = detectValuationDate(rows, state.mapping) || today();
    el.valuationDateInput.value = state.valuationDate;
    state.selectedSleeve = "All";
    await applyImport("consolidated_holdings.csv");
  } catch (error) {
    window.alert(`Could not load the consolidated book: ${error.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
});

el.sampleButton.addEventListener("click", () => {
  state.holdings = SAMPLE_HOLDINGS;
  state.rows = [];
  state.mapping = {};
  state.errors = [];
  state.selectedSleeve = "All";
  saveJson("holdings", state.holdings);
  render();
});

el.largeSampleButton.addEventListener("click", () => {
  state.holdings = LARGE_SAMPLE_HOLDINGS;
  state.rows = [];
  state.mapping = {};
  state.errors = [];
  state.selectedSleeve = "All";
  saveJson("holdings", state.holdings);
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
    ["BND", "Vanguard Total Bond Market ETF", "Bonds", 200, 72.3],
    ["AGG", "iShares Core U.S. Aggregate Bond ETF", "Bonds", 160, 98.2],
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

  try {
    state.db = await openPortfolioDb();
    await ensureDefaultPortfolio();
    await refreshSnapshots();
    state.snapshotStatus.textContent = "IndexedDB snapshot storage is ready.";
  } catch (error) {
    state.dbError = error.message || String(error);
    state.snapshotStatus.textContent = `IndexedDB unavailable: ${state.dbError}`;
  }
  render();
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
  applyWorkspaceSplit();
  renderTitle();
  renderSleeves(cube);
  renderMetrics(cube);
  renderPlanning(cube);
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
  el.viewLabel.textContent = state.selectedSleeve === "All" ? "Portfolio overview" : "Sleeve drill-down";
  el.viewTitle.textContent = state.selectedSleeve === "All" ? "Investment Portfolio" : state.selectedSleeve;
  el.holdingsTitle.textContent = state.selectedSleeve === "All" ? "All Holdings" : `${state.selectedSleeve} Holdings`;
}

function renderSleeves(cube) {
  const buttons = [
    navButton("All Portfolio", "All", ""),
    ...cube.sleeves.map((sleeve) => navButton(sleeve.sleeve, sleeve.sleeve, percent(sleeve.weight))),
  ];
  el.sleeveNav.replaceChildren(...buttons);
}

function navButton(label, sleeve, meta) {
  const button = document.createElement("button");
  button.className = `sleeve ${state.selectedSleeve === sleeve ? "active" : ""}`;
  button.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(meta)}</strong>`;
  button.addEventListener("click", () => {
    state.selectedSleeve = sleeve;
    render();
  });
  return button;
}

function renderMetrics(cube) {
  const selectedHoldings =
    state.selectedSleeve === "All"
      ? state.holdings
      : state.holdings.filter((holding) => holding.sleeve === state.selectedSleeve);
  const selectedValue = selectedHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const selectedCostBasis = selectedHoldings.reduce((sum, holding) => sum + (holding.costBasis || 0), 0);
  const selectedGain = selectedValue - selectedCostBasis;
  const selectedAllocation = cube.totalValue ? selectedValue / cube.totalValue : 0;
  const selectedLabel = state.selectedSleeve === "All" ? "Portfolio Value" : `${state.selectedSleeve} Value`;

  el.metrics.replaceChildren(
    metric(selectedLabel, money(selectedValue), state.selectedSleeve === "All" ? "" : "focus"),
    metric("Total Portfolio", money(cube.totalValue)),
    metric("Portfolio Allocation", percent(selectedAllocation)),
    metric("Selection Gain", money(selectedGain), selectedGain >= 0 ? "good" : "warn"),
  );
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

  const cfgField = (key, label, value, suffix = "") =>
    `<label class="planField"><span>${label}</span><input type="number" step="any" data-plan="${key}" value="${value}" />${suffix ? `<em>${suffix}</em>` : ""}</label>`;

  el.planning.innerHTML = `
    <div class="panelHeader">
      <div>
        <p class="eyebrow">Planning &amp; Risk</p>
        <h2>Reserve, Tax &amp; Liquidity</h2>
      </div>
      <div class="planConfig">
        ${cfgField("expenses", "Annual expenses", cfg.expenses)}
        ${cfgField("reserveTarget", "Reserve target", cfg.reserveTarget)}
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
      let v = Number(input.value);
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
        <p class="eyebrow">Convex overlay &middot; precomputed</p>
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
    <div class="planNote">${escapeHtml(S.note)} Trend = ${escapeHtml(S.trend_proxy)}.</div>`;
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
      button.addEventListener("click", () => {
        state.selectedSleeve = sleeve.sleeve;
        render();
      });
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
      button.addEventListener("click", () => {
        state.selectedSleeve = holding.sleeve;
        render();
      });
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
    .filter((holding) => state.selectedSleeve === "All" || holding.sleeve === state.selectedSleeve)
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

function renderHoldings() {
  const query = state.query.trim().toLowerCase();
  const holdings = state.holdings.filter((holding) => {
    const sleeveMatch = state.selectedSleeve === "All" || holding.sleeve === state.selectedSleeve;
    const queryMatch =
      !query || holding.ticker.toLowerCase().includes(query) || holding.assetName.toLowerCase().includes(query);
    return sleeveMatch && queryMatch;
  });

  el.holdingsBody.replaceChildren(
    ...holdings.map((holding) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="ticker">${escapeHtml(holding.ticker || "-")}</td>
        <td>${escapeHtml(holding.assetName)}</td>
        <td></td>
        <td><span class="source ${holding.assignmentSource}">${escapeHtml(holding.assignmentSource)}</span></td>
        <td class="num">${number(holding.shares)}</td>
        <td class="num">${money(holding.price)}</td>
        <td class="num strong">${money(holding.marketValue)}</td>`;
      const select = document.createElement("select");
      select.innerHTML = DEFAULT_SLEEVES.map((sleeve) => `<option value="${escapeAttr(sleeve)}">${escapeHtml(sleeve)}</option>`).join("");
      select.value = holding.sleeve;
      select.addEventListener("change", () => {
        const key = assignmentKey(holding.ticker, holding.assetName);
        state.assignments[key] = select.value;
        holding.sleeve = select.value;
        holding.assignmentSource = "manual";
        saveJson("assignments", state.assignments);
        saveJson("holdings", state.holdings);
        render();
      });
      tr.children[2].appendChild(select);
      return tr;
    }),
  );
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
    if (!Number.isFinite(marketValue) || marketValue <= 0) {
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

  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
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
