# Portfolio OLAP Implementation and User Manual

## 1. Purpose

Portfolio OLAP is a local browser-based portfolio analytics tool for reviewing investments by sleeve. A sleeve is a portfolio category such as Morningstar-style equity categories, Commodities, Managed Futures, Trend Following, Trend Following Managed Futures, Large Cap Tech, Large Cap Growth, International, Emerging Markets, Bonds, Junk Bonds, Corporate Bonds, Municipal Bonds, Private Credit, Direct Lending, Cash, Alternatives, Other, or Unclassified.

The application is designed around an OLAP-style workflow:

1. Load the consolidated book in one click (or import a broker CSV).
2. Normalize the data into a common holding model.
3. Assign each holding to a sleeve.
4. Aggregate the portfolio by sleeve, and roll sleeves up into **asset-class buckets** or **convex roles**.
5. Drill down from total portfolio → bucket/role → sleeve → individual holdings.

Two terms used throughout: a **sleeve** is a granular category (see the list above); a **rollup bucket** is a top-level group that several sleeves roll into. The sidebar offers two orthogonal lenses on the same holdings — **Asset Class** (what a holding *is*) and **Convex Role** (how it *behaves in a crash*); both are defined in the *Navigating: the Rollup Sidebar* section.

The implementation is a zero-dependency app. It runs in a browser using static HTML, CSS, and JavaScript.

### Version 2.9.2 — Book Over Time: Safari table fix + Δ%

- **Table view fixed on Safari/iPad**: the table markup is now built complete
  (thead/tbody) — WebKit silently dropped the bare row strings the first version
  used, which showed dates with no values.
- **Δ% everywhere**: the table gains a rightmost **Δ total** column (each date's
  change vs the prior snapshot, green/red), and the plot's right-edge labels now
  carry each visible series' **full-span % change** (e.g. "Total book −0.86%").

### Version 2.9.1 — touch-friendly splitter + fit-on-load

- **A real resizer grip**: the pane splitter is now a visible pill with dots (72px on
  desktop, 110px and a taller row on iPhone/iPad), with an invisible extended touch
  target and `touch-action` set so iOS drags the pane instead of scrolling the page.
- **Fit on load**: every portfolio load (3-file set, CSV import, snapshot switch) sizes
  the top pane to its content — everything visible, no dead white space — capped at the
  viewport ceiling (taller content keeps internal scroll). **Double-tap (or double-click)
  the grip** any time to re-fit.

### Version 2.9 — Book Over Time

- **New panel: Book Over Time** — the portfolio's market value as a line across every
  saved snapshot (one point per valuation date; the store already auto-saves on each
  Load Full Book / CSV import). Toggle **account** or **sleeve** overlays via the chip
  row (chips double as the legend; colors are fixed per entity and never repaint when
  you toggle others; more than 7 entities fold into "Other"). Hover any date for a
  crosshair with per-series values and deltas vs the prior snapshot; the **table**
  button shows the same numbers as text. Reads the snapshot store only — nothing here
  re-prices the live book. MV only in v1 (gain lines would need the basisAssumed split).

### Version 2.8 — what's new

**Snapshots can finally be deleted.** Every *Load Full Book* and CSV import auto-saves a
snapshot per valuation date, so the store only ever grew — and there was no control to
prune it. The Snapshots dialog now carries a **🗑** per row (confirm-gated; deleting the
*active* snapshot falls the view back to the live book). This removes saved history only —
your holdings data is untouched.

**Manual drift, corrected (see below).** Three things the app has been able to do for a
while and this manual never said:

- The **Pivot panel has a chart-type toggle** — *◔ Donut ⇄ ▭ Bars* — and a **⛶ Full screen**
  button (Esc exits). Both live in the Pivot panel header.
- The **Planning panel's five assumptions are editable fields**, not fixed constants:
  *Annual expenses, Reserve target, LT tax %, 90-day T-bill %, Inflation %*. The manual
  documented the metrics they produce (reserve coverage, embedded tax, deploy gap) while
  never saying you can change the inputs behind them — which is the more useful fact.
- The **Convexity panel's "Target trend %"** is likewise an editable input.

**Embedded tax says LT because it means LT.** The *Embedded LT tax if liquidated* figure
assumes **every** gain is long-term. It has to: the book carries no holding-period or
acquisition date, so there is no way to know which gains are short-term. Anything held
under a year would be taxed higher than that number shows. (A `taxST` short-term rate had
been sitting in the config for months with nothing reading it — a promise the data cannot
keep. It has been removed rather than left to imply a calculation that does not happen.)

*(These came out of a 2026-07-13 audit that asked one question of every surface: is each
built capability actually reachable by a control? Several here were not.)*

### Version 2.7 — what's new

**Mark-to-market between imports (the reprice leg).** Holding prices and market values in
the served `consolidated_holdings.csv` are now re-marked to the freshest available price —
the agent's live intraday store first, the EOD warehouse (within 10 days) second — while
positions, quantities, and cost basis stay exactly as the broker exports state them.
Value-only holdings (TIAA Traditional, the AQR SMA net) and anything without a fresh mark
stay at export values. The as-of badge discloses both clocks: **"Positions as of X ·
marked Y (N repriced, M at export values)"** (sidecar `reprice_meta.json`; absent = an
export-valued book, pre-2.7 behavior). Two refresh paths: every broker-export ingest, plus
a weekday 18:45 agent cron (`olap_reprice`) that re-marks the same book daily. The
`history/` archive is written BEFORE the reprice pass, so the one-book-per-as-of time
series stays broker-valued and immutable.

### Version 2.6.4 — what's new

An external code review (2026-07-10 overnight sweep) drove a report-honesty release:

- **The PDF/email report now states the BOOK's date, not today's.** `openPdfReport`
  passed the load-time valuation date (reset to "today" on every page load), so a
  three-week-old book produced a report headed "0 days old" — and the ✉️ emailed copy
  carried the same false freshness. The report now derives its as-of from the holdings'
  own valuation dates (`bookAsOf`), the same source as the v2.6.3 header badge, so the
  >14-day re-export warning can actually fire in reports.
- **Short lots no longer show a sign-flipped gain %.** A short position's negative cost
  basis flipped the ratio (a live short-call loss rendered as "104.3%"). The report
  suppresses the percentage on non-positive cost, matching the in-app table's
  convention for Options.
- **The pivot donut discloses omitted shorts.** The donut (the pivot's default chart)
  silently dropped net-negative categories while the table showed them — it now
  captions "N net-negative categories not drawn (shorts — see the table)", the same
  wording as every other chart.
- **By-Account cost cells mark assumed basis.** Account rows whose cost includes
  assumed-basis lots carry the `*` marker (summing that column otherwise exceeded the
  headline "Cost basis (known)" with no explanation).
- Smaller: date normalization no longer UTC-shifts long-form dates; a truncated
  `classification_rules.json` now degrades to Unclassified + the red banner instead of
  erroring mid-import; the dead React-era `node_modules` was removed (the app is
  genuinely zero-dependency).

### Version 2.6.3 — what's new

- **"Current as of: MM/DD/YYYY" header badge.** The dashboard header now always states
  the loaded book's date — taken from the holdings' own valuation dates (the broker
  exports' as-of), never the date you happened to load them. Mild age shows in gray
  ("(3 days old)"); past 14 days it turns amber with a re-export nudge — the same
  staleness convention as the PDF report and `book_query`. Mixed-date books (rare)
  show the newest date plus the oldest lot's.

### Version 2.6.2 — what's new

- **Honest "known cost basis" everywhere.** Assumed-basis rows (v2.4.4 convention: basis
  unknown in the export → assumed = current value, gain $0) now count as **unknown** basis
  for the Planning caveat, the cube's `noBasisValue`, and the report's **"Cost basis (known)"**
  headline. Previously the assumed value silently inflated "known" cost, and the
  unknown-basis disclosures could never fire on a live book (every row gets an assumed basis
  on load). Gain math is unchanged — an assumed row's gain is $0 either way.
- **Top dashboard de-duplicated.** The "Total Portfolio" card (identical to Portfolio Value)
  and the constant "Portfolio Allocation 100%" card are gone; the whole-book gain card is
  now labeled **Unrealized Gain** (it was "Selection Gain" but never followed the selection —
  the scope strip below the dashboard is the selection view).
- **Pivot stacked/1-D bars say what they can't draw.** Negative cells and net-negative rows
  (short legs) can't render as bar segments; the chart header now counts what was omitted
  and points to the matrix table instead of silently disagreeing with it.
- **Internal:** the 2-D pivot cross-tab is computed once (was duplicated per render); dead
  Windows/React bootstrap artifacts removed (`.bat` scripts, vite/react/tsconfig,
  `react-smoke.tsx`, `esbuild-test.exe`) — the app is now honestly zero-dependency and
  `npm run dev` matches this manual (python static server on :4173); documented the
  deliberate LAN/tailnet trust boundary (no auth on :8787, pinned-recipient email endpoint)
  under *Runtime Model*.

### Version 2.6.1 — what's new

- **✉️ Email the report.** The report page has an **"Email me this report"** button next
  to Print: one click sends the full report to dnsr4007@gmail.com as an **HTML attachment**
  (open it in any browser; print → Save as PDF from there). Delivery rides the agent
  (host-aware — works on LAN and over Tailscale); each emailed report is also archived on
  the Mini under `workspace/reports/` (90-day retention). Rate-limited to 5/hour; the
  recipient is fixed to the operator — the page cannot send anywhere else.

### Version 2.6 — what's new

- **📄 Full-book PDF report.** A **Report** button in the header builds a complete,
  print-ready report of the ENTIRE book (any on-screen account filter is deliberately
  ignored — the header says so): summary metrics · by-account table · the full
  asset-class rollup (every bucket and sleeve with value, % of book, gain) · the
  convex-role view · and a **per-lot holdings detail section for every account**
  (ticker, asset, sleeve, shares when present, cost, value, gain — assumed-basis
  positions footnoted, account subtotals). It opens in a new tab with the browser's
  print dialog ready — choose **Save as PDF** (works the same on the iPad over
  Tailscale: share sheet → Print → Save to Files). The report is generated entirely
  locally; staleness is flagged when the book is >14 days old. Precomputed panels
  (Dial / Sortino Overlay / Risk) are excluded by design — they're
  portfolio_analysis.py snapshots, not client-computed truth.

### Version 2.5.1 — what's new

- **Ticker symbols are hyperlinks to the Forge ETF tab.** Every listed ticker in the holdings
  table is now itself a link (dotted underline) that pops the corresponding **MarketForge ETF
  deep-dive tab** in a new browser tab — identity, costs, composition, factor regression,
  flows, news, *and* its price chart, all in one place. Treemap tiles click through to the
  same ETF tab. This replaces the v2.5.0 hover pair (📈 chart / ETF) — the ETF tab embeds the
  chart anyway, so one link now does both jobs; the Charts tab remains reachable from inside
  Forge. Bond CUSIPs, options symbols, and placeholder rows stay plain text.

### Version 2.5 — what's new

- **Accounts filter is now a dropdown with checkboxes** (was a pill row). One summary button
  above the dashboard — e.g. *All accounts (9) · $17.1M ▾* — opens a panel with the **All /
  Self-managed / Advisor** presets and a checkbox per account (largest first, market value
  shown, advisor-managed tagged). The panel stays open while you toggle so the dashboards
  update live; click outside or press **Esc** to close. Everything else is unchanged: the
  selection persists, applies to every client-computed panel, and an active filter is never
  silent — the button turns amber, a *filtered* hint appears, and the header still shows
  *n of m accounts*. The precomputed-panels caveat badge behaves as before.
- **Sidebar auto-collapses on load** — **Load Full Book** and a CSV import now collapse every
  bucket in the sleeve sidebar so a fresh book opens at the compact asset-class overview;
  expand with the chevrons as usual (your subsequent expand/collapse choices still persist).
- **Sortable drill-down columns** — click any header in the holdings table (Ticker, Asset,
  Sleeve, Shares, Price, Cost, Value, Gain/Loss) to sort; click again to reverse. Numeric
  columns start biggest-first, text columns A-first. Works in every scope — All, bucket,
  sub-group, or sleeve. Assumed-basis rows sort as gain $0, matching what they display.
- **Chart views for the drill-down** — a **☰ Table | ▦ Treemap | ◔ Donut** switch in the
  Drill-down header. **Treemap**: one rectangle per holding, sized by market value and colored
  by unrealized gain (red −30% → slate flat → green +30%); hover for detail, click a tile to
  open its MarketForge price chart. **Donut**: share-of-view ring — by sleeve in the All /
  bucket views (click a slice to drill into that sleeve), by holding inside a single sleeve.
  Both charts honor the account filter, search box, and current selection; short/negative
  positions can't be drawn and are counted in the caption instead. The choice persists.
- **MarketForge links on every listed ticker** — hover a holdings row and two quiet actions
  appear next to the symbol: **📈** opens the MarketForge price chart (overlays +
  compare-vs-SPY live there) and **ETF** opens the full ETF deep-dive tab (identity, costs,
  composition, factor regression, flows, news) — each in a new tab, on the right host
  automatically (LAN `:8765` or the padlocked `ts.net` `:8443`).

### Version 2.4.5 — what's new

- **"Sortino" honestly relabeled CAGR/Down-Vol** (finishing the P3-12 relabel across the OLAP
  contract): the ratio these panels publish is CAGR ÷ (std dev of *negative months*, annualized) —
  a Sortino-*style* ratio, not textbook Sortino (which uses downside deviation of all months vs a
  minimum acceptable return). All metric captions in the Overlay and Dial panels now read
  **CAGR/Down-Vol** with the definition on hover; the panel keeps its familiar "Sortino Overlay"
  name with a "CAGR/Down-Vol basis" subtitle. Snapshots carry the honest `cagr_downvol` key
  (the legacy `sortino` key remains one release for compatibility, then drops).

### Version 2.4.4 — what's new

- **Assumed cost basis (operator convention):** a holding whose source export carries no basis
  (typically private funds / SMA lines) now shows **basis = current value → gain $0**, marked with
  an amber <sup>*</sup> in the holdings table and a footnote under the dashboard metrics naming the
  count and value affected. Previously those rows showed blank basis and were excluded from gain
  math; totals are unchanged (excluded and $0 sum the same) — the difference is visibility. The
  `basisAssumed` flag persists into saved snapshots, so later analyses can separate real gains
  from assumptions. Real basis — including a legitimate $0 — is never touched.
- **Snapshot history is analysis-ready:** every **Load Full Book** and CSV import already
  auto-saves a snapshot per valuation date (same-date reload asks before replacing; sample loads
  are excluded). New **Export history** button in the Snapshots dialog downloads the entire
  accumulated history (snapshots + every position row, with account/sleeve/basis flags) as one
  JSON file for offline analysis — python, the vault, wherever.

### Version 2.4.3 — what's new

- **International equity split out of the US bucket** (accuracy fix): the per-account overlay
  views now map Foreign/International/Emerging sleeves to their own **Int'l equity** bucket,
  proxied by VXUS, instead of riding the US blend — over 2011→2026 international earned roughly
  half the US rate, so half-international accounts were overstated (RMD Receiver: 11.5% → **9.3%**).
- **Clear descriptions**: the selection row now states plainly what it is (the accounts' *current*
  mix backtested with index proxies — an allocation read, **not** realized returns) and shows the
  selection's **proxy composition** ("52% US equity · 43% int'l equity · …") with the exact index
  proxy on hover; the whole-book Current metrics are labeled *whole book* with a tooltip.

  The proxy table: **US equity** 40% SPY / 30% IWD / 30% IWN · **Int'l equity** VXUS ·
  **Treasuries** 50% IEF / 50% TLT · **credit** 50% HYG / 50% BKLN (munis/core ride this) ·
  **cash** BIL · **trend** AQMIX + DBMF (WTMF pre-2019) · **long/short** synthetic
  45% US equity / 30% trend / 25% cash.

### Version 2.4.2 — what's new

- **The Sortino Overlay follows your account selection.** `portfolio_analysis.py` now exports a
  per-account proxy view (the account's holdings mapped onto the overlay's six proxy buckets,
  run through the same 2011→2026 monthly panel, with the monthly series shipped). With account
  pills active, the panel shows a **"Your selection"** metrics row — CAGR / Sortino / maxDD / vol
  for exactly the accounts you have on, MV-weighted — instead of the blanket "not filtered" badge.
  Honesty rules: an account under 50% proxy-mappable (e.g. a privates-heavy entity) gets no view
  and the badge names it; a selection whose proxy coverage is under 90% shows the excluded share;
  the whole-book rows below (Current / deploy / regime) still answer book-level questions and say so.
  Example: RMD Receiver alone reads ~+11.5% CAGR / −25.6% maxDD (equity-heavy), where the old
  headline showed the whole-book ~+8.0%.

### Version 2.4.1 — what's new

- **One Sample Portfolio button** (was two): the Guide's *Sample portfolio / Large sample* pair
  consolidated into a single **Sample Portfolio** button, repositioned into the Guide's
  non-scrolling header next to **Close**. The sample is the full-coverage book — ~60 holdings
  spanning virtually every asset category: equity styles/sizes, international + EM, sectors,
  Treasuries, munis/corporates/junk/bank loans, private credit + direct lending, private equity
  (buyout/growth/VC/secondaries), commodities + precious metals, managed futures/trend,
  **Crypto (IBIT/ETHA)**, Options, Multi-Asset, real assets, private real estate, CDs,
  annuity/stable value, and cash — across three mock accounts (so the account pills demo too).

### Version 2.4 — what's new

- **Account-source toggles** — a pill row above the dashboard (mirroring the MarketForge Portfolio tab) with one on/off pill per brokerage account (largest first, market value shown) plus three presets: **All**, **Self-managed**, and **Advisor** (Living Trust · Partnership · Fidelity_AQR_FLEX45 · LLC). Toggling an account off removes it from **every client-computed panel** — the sleeve sidebar, dashboard metrics, Planning, Convexity, Pivot, Allocation, Top Holdings, and the holdings table — so you can analyze e.g. just the self-managed book in one click. The selection **persists** across sessions; an active filter is never silent (the header shows *n of m accounts*, off pills are struck through). **Caveat:** the **Dial / Sortino Overlay / Risk Contribution** panels are *precomputed* by `portfolio_analysis.py` per fixed slice and cannot re-slice to an arbitrary account set in the browser — they show an amber *"Precomputed — not filtered"* badge when the toggle filter is active (the Risk panel's own View selector remains the way to scope those). Snapshot performance history likewise stays whole-book. Books with a single account hide the row entirely.

- **Correctness fixes (2026-07-06 review):** the dashboard **gain now uses the same missing-basis convention as Planning** (a holding without cost basis no longer counts as 100% gain — the two panels previously disagreed by exactly the no-basis value); **sleeve reassignment moves every lot of the asset** even when an account filter hides some of them; the **Dial slider** commits on release instead of dying after one step; the default **valuation date is the local calendar date** (evening sessions no longer key snapshots to tomorrow's UTC date); the account pill row stays visible whenever a filter is active so a persisted filter can never blank the app without a recovery control.

### Version 2.3 — what's new

- **Risk Contribution panel** — a new analytical lens (below Sortino Overlay) showing **capital % vs risk %** by asset class, so concentrations pop: a class small in capital but large in risk, or a crash hedge that *reduces* risk. Three measures (volatility, beta, tail / expected-shortfall), each an exact decomposition. Two selectors — **View** (Total / tax track / per account) and **Within** (a broad asset class *of that scope*) — decompose any slice **standalone**, so you can read e.g. the Living Trust's *equity* sub-book; with a **3Y / 1Y** lookback toggle. See *Risk Contribution: where the risk actually is* below.
- **Find in guide** — a search box in the Guide highlights every match, jumps between them (Enter / Shift+Enter, or the ↑ ↓ buttons), and shows a match count.
- **Style × Size fix** — equity that lacks a US style-box (private equity, Emerging Markets, broad International) no longer mislabels as *Non-equity*; it now reads as **Private Equity**, **Emerging Markets**, **International**, or **Equity — other**. Only genuine non-equity (bonds / cash / alternatives) stays *Non-equity*.

### Version 2.2 — what's new

- **Pivot / Matrix panel** — a new analytical lens below Convexity. Choose **Rows** (and optionally **Columns**) from any of seven dimensions to get a **1-D breakdown** (value + %) or a **2-D matrix / cross-tab** (value cells with row, column, and grand totals). Click any cell to filter the holdings table to that slice. Dimensions: Asset Class, Convex Role, Style × Size, Account, Liquidity, Sleeve, and **Region** (look-through). See *Pivot / Matrix: cross-tab any two dimensions* below.

### Version 2.1 — what's new

- **Load Full Book + auto-update banner** — one-click consolidated import; a banner offers to reload when the served book has been regenerated.
- **Rollup sidebar** — sleeves grouped into asset-class buckets, with a **View by: Asset Class | Convex Role** toggle (two orthogonal lenses).
- **Holdings drill-down** — value-appropriate columns (Cost, Value, Gain/Loss %), adaptive Shares/Price, same-ticker lot merging, a totals row, and scroll-to-holdings on any drill-in.
- **Taxonomy growth** — new **Options**, **Multi-Asset**, and **Private Real Estate** sleeves; **Real Assets** split into liquid vs private; **Commodities** split out. Private-fund names now classify ahead of public sector keywords (so a private real-estate fund isn't mistaken for a public REIT).
- **Fixed Income** — the bond bucket is now **Fixed Income** (bonds + **CDs** + **fixed annuities**); JEPI reclassified to equity (it's covered-call equity income, not a bond).
- **Portfolio beta** — a **Beta vs S&P (est.)** dashboard metric (value-weighted, updates per drill-in), using real 1-year ETF betas from the warehouse plus asset-class assumptions for stocks/bonds/privates.

## 2. Current Implementation

### Files

- `index.html`: Application markup and page structure.
- `src/styles.css`: Visual design, responsive layout, tables, panels, buttons, and modal styling.
- `src/app.js`: Application logic, CSV parsing, sleeve classification, state management, rendering, and local persistence.
- `custom_sleeve_definitions.json`: v2.1 sleeve hierarchy and Morningstar-aligned category hints.
- `USER_MANUAL.md`: This implementation guide and user manual.
- `package.json`: Lightweight scripts for validation and local serving.

### Runtime Model

The application does not require a backend server for business logic. It runs entirely in the browser.

Data is stored in browser `localStorage` under the `portfolio-olap:` prefix:

- `portfolio-olap:holdings`: The current normalized portfolio.
- `portfolio-olap:assignments`: User-created sleeve overrides.

Because data is local to the browser, no portfolio data is uploaded to an external service.

**Trust boundary (deliberate).** The static server (`olap_server.py`, port `8787`) carries **no authentication**: anyone who can reach it on the LAN or the tailnet can view the served book (`consolidated_holdings.csv` and the precomputed snapshots). The boundary is the network, not the app — LAN + Tailscale devices are trusted. Likewise, the PDF report's ✉️ email button POSTs to the agent's `/api/olap/email_report` without a bearer token; that endpoint pins the recipient server-side (dnsr4007@gmail.com), so the exposure is limited to a trusted-network peer sending you unwanted mail. If the network posture ever changes (port-forward, new tailnet shares), revisit both.

### App Structure

The UI has three main areas:

- Sidebar: brand, page navigation, the **View by: Asset Class | Convex Role** toggle, and the rollup of sleeves into collapsible bucket/role groups for drill-down.
- Top bar: current view title, `Load Full Book`, `Upload CSV`, `Import Mapping`, `Snapshots`, and `Guide`. A "newer book available" banner appears here when the served book has changed.
- Main workspace: metrics, the planning (reserve/tax) and convexity panels, allocation and top-holdings, CSV mapping, and the holdings table.

### Core Data Model

Each normalized holding contains:

- `id`: Internal row identifier.
- `ticker`: Uppercase ticker or symbol.
- `assetName`: Security or asset name.
- `shares`: Current shares or quantity.
- `price`: Current share price.
- `marketValue`: Position value.
- `sleeve`: Assigned sleeve.
- `assignmentSource`: One of `imported`, `manual`, `auto`, or `unclassified`.
- `costBasis`: Optional cost basis.
- `sourceRow`: Original CSV row.

### CSV Pipeline

The CSV workflow is:

1. User selects a `.csv` file.
2. `parseCsv()` reads the file text.
3. The first row is treated as the header row.
4. Rows are converted into plain objects keyed by column name.
5. `detectColumnMapping()` attempts to map broker columns to known fields.
6. `normalizeHoldings()` validates and converts rows into holdings.
7. The dashboard re-renders from normalized holdings.

The parser supports:

- Quoted CSV fields.
- Escaped quotes inside quoted fields.
- Windows and Unix line endings.
- Currency strings such as `$1,234.56`.
- Parentheses for negative values such as `(123.45)`.

### Supported Column Concepts

The app can use these fields when present:

- Ticker or symbol.
- Asset name or security description.
- Shares or quantity.
- Share price.
- Market value.
- Sleeve, category, asset class, or strategy.
- Cost basis.

Minimum usable input is either:

- `marketValue`, plus ticker or asset name.
- Or `shares` and `price`, plus ticker or asset name.

### Automatic Column Detection

The application searches for common broker column names.

Examples:

- Ticker: `ticker`, `symbol`, `security symbol`
- Asset name: `name`, `description`, `security`, `asset name`, `security name`
- Shares: `shares`, `quantity`, `qty`, `current shares`
- Price: `price`, `last price`, `current price`, `share price`, `market price`
- Market value: `market value`, `value`, `current value`
- Sleeve: `sleeve`, `category`, `asset class`, `strategy`
- Cost basis: `cost basis`, `total cost`, `basis`, `cost`

If automatic detection is wrong or incomplete, the user can change mappings manually in the Import Mapping panel.

### Sleeve Assignment

Sleeve assignment follows this priority order:

1. Imported sleeve from the CSV, when provided.
2. Saved manual assignment from prior user edits.
3. Automatic rule-based classification.
4. `Unclassified` fallback.

Assignment sources are shown in the holdings table:

- `imported`: Sleeve came from the CSV.
- `manual`: User changed the sleeve in the application.
- `auto`: Rule-based classifier assigned the sleeve.
- `unclassified`: No sleeve could be determined.

### Automatic Classification Rules

The MVP includes simple ticker and name rules.

Examples:

- `AAPL`, `MSFT`, `NVDA`, `GOOGL`, `META`, `AMZN`: Large Cap Tech
- `VUG`, `QQQ`, `IWF`, `SCHG`: Large Growth
- `SPY`, `VOO`, `IVV`, `VTI`: Large Blend
- `VTV`, `IVE`, `IWD`, `SCHV`: Large Value
- `VO`, `IJH`, `IWR`, `SCHM`: Mid-Cap Blend
- `VB`, `IWM`, `IJR`, `SCHA`: Small Blend
- `GLD`, `IAU`, `SLV`: Commodities > Precious Metals
- `DBC`, `PDBC`: Commodities > Broad Commodities
- `DBMF`: Trend Following Managed Futures
- `KMLM`, `CTA`: Managed Futures
- `VXUS`, `VEA`, `IEFA`, `EFA`: International
- `EEM`, `VWO`, `IEMG`: Emerging Markets
- `HYG`, `JNK`, `USHY`, `SJNK`: Junk Bonds, using Morningstar-style high-yield bond language
- `LQD`, `VCIT`, `VCLT`, `IGIB`: Corporate Bonds
- `MUB`, `VTEB`, `TFI`, `PZA`: Municipal Bonds
- `BND`, `AGG`, `TLT`, `IEF`, `SHY`: Bonds
- `BIZD`, `PSP`: Direct Lending
- `PC`, `PRCR`, or names containing private credit/private debt: Private Credit
- `SWVXX`, `SPAXX`, `VMFXX`, `SGOV`: Cash

These rules are intentionally transparent and easy to modify in `src/app.js`.

### Analytics Calculations

The dashboard calculates:

- Total market value.
- Number of sleeves currently represented.
- Unclassified value.
- Total unrealized gain when cost basis exists.
- Sleeve market value.
- Sleeve weight as a percentage of total portfolio value.
- Top holdings by market value.

The allocation view is generated from an in-browser portfolio cube built by `buildPortfolioCube()`.

## 3. User Manual

### Opening the Application

If the local web server is running, open:

`http://127.0.0.1:4173/`

The application can also be opened directly from `index.html`, but the in-page Markdown manual is best viewed through the local server because browsers can restrict local file reads.

### Starting the Local Server

From the project folder:

```bash
npm run dev
```

This runs:

```bash
python -m http.server 4173 --bind 127.0.0.1
```

### Running the Validation Check

From the project folder:

```bash
npm run build
```

This runs a JavaScript syntax check:

```bash
node --check src/app.js
```

### Using Sample Data

Open the **Guide** and click **Sample Portfolio** (in the header, next to Close). It replaces the
current holdings with a ~60-position demonstration book covering virtually every sleeve in the
taxonomy — including Crypto, Options, Multi-Asset, Treasuries, bank loans, privates, CDs, and
annuities — spread across three mock accounts so the Accounts filter, drill-downs, pivots,
and planning views all have something to show. Loading the sample overwrites the held book in
browser storage; reload your real data with **Load Full Book** or a CSV import.


### Loading the Consolidated Book (primary workflow)

The fastest path is the consolidated book — every account (Schwab + Fidelity formats, the AQR Flex SMA netted, IRA + TIAA) flattened into one file with sleeves already assigned.

1. Click `Load Full Book`.
2. The app fetches `consolidated_holdings.csv` (served locally) and imports it in one step.

The book is generated by `portfolio_analysis.py:export_olap_holdings()` (in the sibling `portfolio-analysis` repo) and carries `Symbol, Description, Qty, Price, Market Value, Cost Basis, Sleeve, Account, Date`. It is value-rich but some lots are value-only (no Qty/Price) — the holdings table adapts (see *Reading the Holdings Table*).

#### The "newer book available" banner

OLAP caches the imported book in `localStorage`, so a plain browser refresh reuses what you last loaded. When the served `consolidated_holdings.csv` changes (you re-ran `portfolio_analysis.py`), a banner appears under the toolbar on the next load: **"A newer consolidated book is available."** Click `Reload` to re-import, or `Dismiss` to hide it until the book changes again. It only prompts if you have previously loaded the full book.

### Importing a CSV

You can also import any broker CSV directly:

1. Click `Upload CSV`.
2. Select a broker-exported `.csv` file.
3. The app parses the file locally.
4. The Import Mapping panel displays detected columns.
5. Review the mappings.
6. Adjust any incorrect field mapping using the dropdowns.
7. The dashboard updates automatically.

### Correcting Column Mapping

In the Import Mapping panel, each dropdown maps one application field to one CSV column.

Important mappings:

- Ticker: the security symbol.
- Asset Name: the security description or name.
- Shares: current quantity.
- Share Price: current price per share.
- Market Value: current total position value.
- Sleeve: optional imported sleeve/category.
- Cost Basis: optional total cost basis.

If your CSV has market value, shares and price are useful but not strictly required. If your CSV does not have market value, the app needs shares and price to calculate position value.

### Understanding Import Errors

Rows with insufficient value data are skipped.

The most common error is:

`missing market value, or shares and price`

Fix this by mapping either:

- Market Value

Or:

- Shares
- Share Price

### Navigating: the Rollup Sidebar

The sidebar groups your sleeves into higher-level rollup categories so you can read allocation at a glance and drill in. (A **sleeve** is a granular category — Large Blend, Municipal Bonds, Managed Futures. A **rollup bucket** is a top-level group that several sleeves roll into.)

#### View by: Asset Class | Convex Role

A toggle at the top of the sidebar switches between two lenses on the same holdings:

- **Asset Class** — *what the holding is* (structural). Sleeves roll into liquidity-aware buckets.
- **Convex Role** — *how the holding behaves in a market crash* (functional).

The two are orthogonal — e.g. managed futures is **Liquid Alts** structurally but **Convexity** functionally. The choice persists between sessions.

#### Asset Class buckets

| Bucket | Definition |
|---|---|
| **Public Equity** | Listed/marketable stock funds and stocks (large/mid/small cap, sectors, international, EM). |
| **Private Equity** | Illiquid private equity — buyout, growth equity, venture, secondaries. |
| **Fixed Income** | Bonds (Treasuries, corporate, municipal, high-yield, bank loans, core/multisector) plus **CDs** (FDIC certificates) and **fixed annuities** (e.g. TIAA Traditional). |
| **Private Credit** | Illiquid private lending — direct lending, BDCs, private debt funds. |
| **Liquid Alts** | Liquid alternative *strategies* — managed futures, trend following, long/short equity. |
| **Commodities** | Liquid commodity exposure — gold (GLD/IAU), broad commodity ETFs. |
| **Real Assets** | Liquid real-asset / real-return ETF baskets (e.g. RAAX, RLY). |
| **Private Real Assets** | Illiquid private real estate + private alternatives (interval/LLC funds, reinsurance). |
| **Multi-Asset** | Balanced / flexible-allocation funds spanning equity + credit + alternatives. |
| **Options** | Listed equity options held as hedges/overlays — protective puts, covered/short calls, collars. |
| **Cash** | Money-market funds, T-bills, sweep cash. |

A bucket is hidden when nothing rolls into it. The percentage beside each bucket is its share of total portfolio value (it can be slightly negative — e.g. short option premium).

#### Convex Role groups

The **convex role** describes a sleeve's job in the portfolio's "crash shape". Note that this lens captures only **tactical convexity** — the crash-hedge *instruments* you hold. A portfolio's *total* convexity has a second, often larger source: **structural convexity** from how the book is *sized and rebalanced* (volatility targeting), which a holdings classifier cannot see and which is shown separately in the **Sortino Overlay** panel. A volatility-managed book can be far more convex than its instrument labels suggest; the **Diversifier** role (gold, commodities) is *low-correlation ballast, not convexity* — a distinct property.

| Role | Definition |
|---|---|
| **Growth** | Return engine — equity (public + private) and most risk assets. |
| **Income** | Yield / credit — bonds, credit, loans. |
| **Duration** | Long-Treasury interest-rate hedge (rallies in a flight to safety). |
| **Convexity** | Crash protection that pays off in a selloff — trend / managed futures, long puts. |
| **Diversifier** | Low-correlation ballast — commodities, gold, reinsurance. |
| **Other-Alt** | Private / illiquid alternatives without a cleaner role. |
| **Cash** | Dry powder / reserve. |

#### Drilling in

- Click `All Portfolio` for the whole book.
- Click a **bucket / role header** to drill into every holding in that group.
- Click a **sleeve** under a header to drill into just that sleeve.
- Some buckets nest one level deeper — e.g. **Fixed Income → Bonds → {Treasuries, Corporate, Municipal, High-Yield, Bank Loans, Core/Multisector}**, with **CDs** and **Annuity / Stable Value** as direct siblings of the **Bonds** sub-group. The sub-group is itself collapsible and drillable (clicking **Bonds** shows the whole bond family).
- Click an **allocation row** or a **top holding** to jump to its sleeve.
- The chevron (▸ / ▾) collapses or expands a group; the state is remembered. Loading a fresh
  book (**Load Full Book** or a CSV import) collapses every bucket first (v2.5), so you start
  from the compact asset-class overview and expand what you need.

Any drill-in scrolls the holdings table into view automatically. The title and table update to the selected scope.

### Account scope: the Accounts dropdown

Above the dashboard sits one summary button — e.g. **All accounts (9) · $17.1M ▾** — showing
which account sources feed every client-computed panel. Click it to open the panel (v2.5;
this replaced the v2.4 pill row):

- Three presets at the top: **All** (the full book — the default), **Self-managed**
  (Fidelity_Portfolio, Bond Account, TIAA-CREF, DNSR-IRA, RMD Receiver), and **Advisor**
  (Living Trust · Partnership · Fidelity_AQR_FLEX45 · LLC).
- Below them, a **checkbox per account**, largest market value first with the value alongside;
  advisor-managed accounts carry a small *advisor* tag.

The panel stays open while you toggle, so the dashboards re-slice live; click anywhere outside
(or press **Esc**) to close. The selection applies to **every client-computed panel** — sleeve
sidebar, dashboard metrics, Planning, Convexity, Pivot, Allocation, Top Holdings, and the
holdings table — and **persists across sessions** (browser-local). An active filter is never
silent: the button turns amber and reads *n of m accounts*, a *filtered* hint sits beside it,
unchecked accounts render struck-through in the panel, and the workspace header shows
*n of m accounts*.

Two things the filter cannot re-slice, by design:

- The **Dial / Sortino Overlay / Risk Contribution** panels are *precomputed* per fixed slice by
  `portfolio_analysis.py` — with a filter active they show an amber **"Precomputed — not
  filtered"** badge; use the Risk panel's own **View** selector to scope those.
- **Snapshot performance history** stays whole-book.

Books with a single account hide the control entirely.

### Pivot / Matrix: cross-tab any two dimensions

The **Pivot / Matrix** panel (below Convexity) re-slices the whole book by dimensions you choose, independent of the sidebar selection. Pick a **Rows** dimension and, optionally, a **Columns** dimension:

- **Columns = None → 1-D breakdown.** A table of the Rows dimension's categories with **Value** and **% of book**, largest first. This generalizes the sidebar's View-by toggle to any dimension.
- **Columns = a dimension → 2-D matrix (cross-tab).** Rows × Columns with the dollar value in each cell, plus a **Total** row and column and the grand total. Empty combinations show a dot.

**Click any cell** (a 1-D row or a 2-D cell) to filter the **Holdings table** to exactly that slice — a chip appears above the matrix naming the filter (e.g. *Region = US × Asset Class = Public Equity*); click **✕ clear** to return to the sidebar selection.

The seven dimensions:

| Dimension | What it groups by |
| --- | --- |
| **Asset Class** | the rollup bucket (Public Equity, Fixed Income, Real Assets, …) |
| **Convex Role** | crash behavior (Growth, Duration, Convexity, …) |
| **Style × Size** | equity box parsed from the sleeve (Large Blend, Small Value, …). Equity without a US style-box reads as **Private Equity**, **Emerging Markets**, **International**, or **Equity — other**; only genuine non-equity (bonds / cash / alternatives) → *Non-equity* |
| **Account** | the holding's account / entity (IRA, Living Trust, Partnership, …) |
| **Liquidity** | Liquid vs Private (private real estate / credit / equity / alternatives) |
| **Sleeve** | the granular sleeve itself |
| **Region** | US / Foreign Developed / Emerging Markets / Other — **look-through** |

**Region is look-through.** A fund is split across regions by its actual country breakdown (e.g. a total-international ETF lands partly in Foreign Developed and partly in Emerging Markets), so each fund's value is *apportioned* across the region cells rather than dumped into one. Region exposure comes from the warehouse's per-ETF country weightings (regenerated with the book; holdings with no country data — single stocks, bonds, private funds — show as *Unknown*). Because a look-through holding spans several cells, clicking a Region cell shows every holding with **any** exposure to it (so a holding can appear under more than one region).

**Within an asset class.** To break a single class into its sub-parts, cross-tab **Asset Class × Sleeve** (or **Asset Class × Style × Size**) — each class's row then shows its sub-sleeves in the cells — or pick **Sleeve** (or **Style × Size**) as Rows and click an Asset-Class cell to filter to just that class. This is the **capital** (dollar) view of a within-class breakdown. For the **risk-weighted** version — each sub-class's share of the class's *volatility / beta / tail*, not just its dollars — use the **Risk Contribution** panel's **Within asset class** view (next section). The two are complementary: Pivot answers *how much money* sits in each sub-part; Risk Contribution answers *how much risk* it carries.

> Phase 2 will add a **Fixed Income: Duration × Credit Quality** matrix once per-ETF duration and credit-rating data is ingested into the warehouse.

### Risk Contribution: where the risk actually is

The **Risk Contribution** panel (below Sortino Overlay) answers a different question from the allocation views — not *where is my money*, but *where is my risk*. For each asset class it shows **% of capital** beside **% of portfolio risk**; the **gap** is the signal. A class that is 36% of capital but 57% of the risk is a concentration; a bond sleeve that is 22% of capital but 4% of risk is doing its job cheaply.

**Three measures**, each an exact decomposition (the parts sum to the whole):

| Column | What it measures |
| --- | --- |
| **Capital %** | the class's share of the measurable (marked) sub-book, by dollars |
| **Vol %** | its contribution to portfolio **volatility** (Ledoit-Wolf shrinkage covariance over daily returns) |
| **Beta %** | its contribution to portfolio **beta** vs the S&P 500 |
| **Tail %** | its contribution to **expected shortfall** — the average loss on the worst 5% of days. A **negative** Tail % means the class *reduces* drawdown: a crash hedge. |

Rows where **Vol % exceeds Capital %** (more risk than money) are shaded **amber** (a concentration); rows with a **negative Tail %** (a crash hedge) are shaded **green**.

**Slice and dice — two selectors.** **View** picks the *scope*, each decomposed **standalone** — as its own portfolio (its own volatility, beta, and tail, with weights renormalized *inside* the scope), not a filtered view of the total. So "the taxable book is 58% of *its* risk in Large Blend" reads independently of the IRA. The scopes:

- **Total** — the whole marked book.
- **Tax track** — **Taxable** vs **Tax-free** (IRA / RMD / TIAA). The taxable book is typically more equity-concentrated; the tax-free track, migrating toward Convex Core, is more balanced.
- **Account** — each entity (Living Trust, Partnership, IRA, …) as its own portfolio. Thin accounts (an SMA whose holdings aren't in the warehouse) show a graceful "too few marked holdings" note and stay navigable.

The second selector, **Within**, decomposes *inside* a broad asset class **of the chosen scope** — Equity / Fixed Income / Alternatives / Cash — so you can read "the Living Trust's *equity* sub-book," or at Total scope the whole book's. **Within Fixed Income**, for example, shows that Treasuries are a small share of bond capital but the largest share of bond *risk* (duration), while floating-rate bank loans are capital-heavy yet risk-cheap. The Within options adapt to whatever the scope holds (an all-bond account offers only Fixed Income / Cash; a thin one offers none).

A **3Y / 1Y** toggle switches the lookback (3Y is the default — more regime coverage; 1Y is more responsive to the current regime).

**Non-marked holdings are excluded.** CDs, fixed annuities, private real estate, and anything else with no honest market-price series have no measurable volatility, so they are left out of the risk math and renormalized away. A banner at the top of the panel states exactly how much of the slice (in $ and %) is non-marked, so the risk %s are never mistaken for the whole book — this is why a private-heavy account, or *Within Alternatives*, can show a high non-marked share.

**How it's computed.** The decomposition can't run in the browser (it needs the price warehouse and a covariance estimator), so it is **precomputed** by `portfolio_analysis.py` into `risk_contribution_snapshot.json` and read read-only — the same model as the Sortino Overlay and Dial. Re-run `portfolio_analysis.py` after the book changes to refresh it; if the snapshot is absent, the panel hides itself.

### Reading the Holdings Table

The columns adapt to the loaded data:

- **Ticker** — symbol. A small `×N` badge means N lots of the same ticker were merged into one row.
- **Asset** — security name.
- **Sleeve** — shown in the All-Holdings view and bucket drill-downs (with a dropdown to reassign); hidden in a single-sleeve drill, where it is the panel title.
- **Shares** / **Price** — shown only when the loaded book carries share counts (a `Qty` column). Price is **derived** as value ÷ shares (a weighted price for merged lots).
- **Cost** — cost basis.
- **Value** — current market value.
- **Gain / Loss** — unrealized `$ (+%)`, green for gains, red for losses. The `%` is suppressed for **Options** (short premium makes a cost-basis percentage meaningless).

Multiple lots of the same ticker (e.g. the same ETF held across accounts) are **merged** into one summed row. A bold **totals row** sums the current view — count, cost, value, and gain.

**Sorting (v2.5):** click any column header to sort the table; click again to reverse. Numeric
columns start biggest-first, text columns A-first, with value-then-ticker tiebreaks so the
order is stable. If the sorted column disappears in another scope (Shares/Price on a value-only
book, Sleeve inside a sleeve drill), the table falls back to the default value-descending order.

**MarketForge links (v2.5.1):** any symbol that looks like a listed ticker is a hyperlink
(dotted underline) — click it to pop the **MarketForge ETF deep-dive tab** for that ticker in
a new browser tab: identity, costs, composition, factor regression, flows, news, and its price
chart (with overlays and compare-vs-SPY) all live there. The link picks the right host
automatically (LAN `:8765`, or the padlocked `ts.net` origin's `:8443` front). Bond CUSIPs,
options symbols, and placeholder rows stay plain text.

### Chart views: Treemap and Donut (v2.5)

The Drill-down header carries a **☰ Table | ▦ Treemap | ◔ Donut** switch (the choice persists
per device). Both charts draw exactly what the table would show — the current sleeve/bucket
selection, the search filter, and the Accounts filter all apply:

- **▦ Treemap** — one rectangle per merged holding, **sized by market value** and **colored by
  unrealized gain** (red at −30% or worse → slate for flat/no-basis → green at +30% or better).
  Hover any tile for the full detail (value, % of view, gain, sleeve); **click a tile** to open
  its MarketForge ETF tab. Books with very many positions fold the tail into one grey
  *Other* tile. Assumed-basis holdings read as flat (slate), matching their $0 gain convention.
- **◔ Donut** — share-of-view ring. In the All-Portfolio and bucket views it breaks down **by
  sleeve** (click a slice or its legend row to drill into that sleeve); inside a single sleeve
  it breaks down **by holding**. Long tails fold into *Other*.

Short/negative positions cannot be drawn in either chart; the caption counts them instead —
switch back to ☰ Table to see them.

### Progressive Drill-Down Path

The dashboard includes a `Progressive Drill Path` panel that shows how the top-most portfolio level resolves to an individual asset.

Conceptual examples:

```text
Portfolio
  Equity
    Public Equity
      Large Cap Tech
        AAPL
```

```text
Portfolio
  Alternatives
    Liquid Alternatives
      Trend Following Managed Futures
        DBMF
```

```text
Portfolio
  Bonds / Credit
    Public Bonds
      Municipal Bonds
        MUB
```

```text
Portfolio
  Bonds / Credit
    Private Credit
      Direct Lending
        BIZD
```

This taxonomy path is now also realized interactively: the **rollup sidebar** is the expandable hierarchy (bucket → sleeve → holdings), and the Drill Path panel shows the full chain for the representative holding of the current selection. The levels are:

1. Level 0: Portfolio summary.
2. Level 1: Rollup bucket (asset class) — or convex role, depending on the View-by toggle.
3. Level 2: Public/private or market-structure group.
4. Level 3+: Morningstar-style category, custom sleeve, strategy, sub-sleeve, or account.
5. Leaf: Single ticker, fund, private asset, bond, cash holding, or other atomic asset.

### Searching Holdings

Use the search box above the holdings table to filter by ticker or asset name.

Search works together with sleeve filtering. For example, if `Large Cap Tech` is selected, search results are limited to that sleeve.

### Editing Sleeve Assignments

Each holding row has a sleeve dropdown.

To change a sleeve:

1. Find the holding in the table.
2. Open the sleeve dropdown.
3. Choose the correct sleeve.

The change is saved automatically in local browser storage and marked as `manual`.

Manual assignments are reused on future imports when the same ticker or asset name appears.

### Understanding Assignment Source

The Source column explains how the sleeve was assigned.

- `imported`: The CSV supplied the sleeve.
- `manual`: You manually changed the sleeve.
- `auto`: The app classified the holding with built-in rules.
- `unclassified`: No rule or saved assignment matched.

Review `unclassified` rows after each import.

### Viewing the Manual In-App

Click the `Manual` button in the top-right action area.

The manual opens in a reader overlay. Use `Close` or press `Esc` to return to the dashboard.

## 4. Maintenance Guide

### Adding a Sleeve

The taxonomy is shared across the app and the book builder, so adding a sleeve touches a few places:

1. **`custom_sleeve_definitions.json`** — add the sleeve `{code, name, parent, description}`. `parent` is another sleeve's `code`, or `null` for a top-level category.
2. **`SLEEVE_PARENTS` in `src/app.js`** — add `"Sleeve Name": "Parent Name"` so the rollup (`bucketOfSleeve` / `parentPath`) can place it. This map is hardcoded and must stay in sync with the JSON. A top-level sleeve (no parent) needs no entry.
3. **`DEFAULT_SLEEVES` in `src/app.js`** — add the name so it appears in the per-holding reassign dropdown.
4. **`ROLLUP_BUCKETS` in `src/app.js`** *(optional)* — to give it its own asset-class bucket, add `{ name, anchors }`; otherwise it rolls into whichever bucket one of its ancestors anchors.
5. **`build_classification_rules.py`** — add a classification rule (ticker and/or name keyword) so holdings auto-classify to it, and a convex role in `role()` (defaults to `Growth`).
6. **Regenerate both** — run `python build_classification_rules.py` (rebuilds `classification_rules.json`) and `portfolio_analysis.py:export_olap_holdings()` (rebuilds `consolidated_holdings.csv`, which is gitignored). The book "honors imported sleeves," so a reclassification only shows after the CSV is regenerated and the book reloaded.

### Bond Sub-Sleeves and Morningstar Alignment

The baseline taxonomy now treats `Bonds` as a parent sleeve with these sub-levels:

- `Junk Bonds`: user-friendly label for high-yield bond exposure.
- `Corporate Bonds`: investment-grade or broad corporate bond exposure.
- `Municipal Bonds`: municipal or tax-exempt bond exposure.

Version 2.0 should use `custom_sleeve_definitions.json` as the canonical taxonomy source. That file includes Morningstar-aligned metadata such as `morningstarArea` and `morningstarCategoryHint`.

The goal is not to reproduce every Morningstar category immediately. The goal is to keep labels and classification hints compatible with Morningstar-style categories where practical, especially for fixed income.

### Morningstar Equity Categories

Version 2.0 should include Morningstar-style equity categories in the sleeve taxonomy.

U.S. equity style-box categories:

- `Large Value`
- `Large Blend`
- `Large Growth`
- `Mid-Cap Value`
- `Mid-Cap Blend`
- `Mid-Cap Growth`
- `Small Value`
- `Small Blend`
- `Small Growth`

International equity categories:

- `Foreign Large Value`
- `Foreign Large Blend`
- `Foreign Large Growth`
- `Foreign Small/Mid Value`
- `Foreign Small/Mid Blend`
- `Foreign Small/Mid Growth`
- `Diversified Emerging Markets`

Sector equity categories:

- `Communications`
- `Consumer Cyclical`
- `Consumer Defensive`
- `Equity Energy`
- `Equity Precious Metals`
- `Financial`
- `Health`
- `Industrials`
- `Infrastructure`
- `Natural Resources`
- `Real Estate`
- `Technology`
- `Utilities`
- `Miscellaneous Sector`

### Private Credit

The v2 taxonomy includes `Private Credit` with code `PRCR`. `PC` is acceptable as a short alias in user-facing notes or import mapping, but `PRCR` is preferred in configuration because it is more explicit.

Private Credit should include at least one sub-level:

- `Direct Lending`

Direct lending should be used for middle-market or private loan strategies where the fund or asset name indicates direct lending exposure.

### Adding Classification Rules

Classification rules live in **`build_classification_rules.py`**, which generates `classification_rules.json` — the single source shared by `app.js` (`classifyHolding`) and `portfolio_analysis.py` (`classify_code`). Do not hand-edit the JSON.

Edit the `OLAP_RULES` / `EXTRA` tuples — `(sleeve-or-code, [tickers], [name-keywords])` — then re-run `python build_classification_rules.py`.

```python
("Industrials", ["XLI", "VIS", "PWRD"], ["industrials sector"]),
```

Classification precedence: **exact ticker → name keyword (first match in array order) → fallback rules (regex on symbol, e.g. the options expiry-date pattern) → Unclassified**. Names in the `PRIVATE_FIRST` set are checked *before* the public rules, so a private-fund name (e.g. "… Real Estate Fund") classifies to its private sleeve instead of the public sector keyword it happens to contain.

After editing, regenerate both the rules and the book (see *Adding a Sleeve*, step 6).

### Adding More Broker Column Aliases

Edit `COLUMN_ALIASES` in `src/app.js`.

Example:

```js
marketValue: ["market value", "value", "current value", "position value"]
```

### Resetting Local Data

The `Sample` button resets holdings to the built-in sample portfolio.

To fully clear saved browser data, clear site data for `127.0.0.1:4173` in the browser, or remove keys that start with:

`portfolio-olap:`

### Privacy Notes

The MVP processes CSV files inside the browser. It does not send data to a backend service.

If future versions add cloud sync, brokerage integrations, market data APIs, or AI classification, privacy and security controls should be reviewed before use with real account data.

## 5. Known Limitations

- The CSV parser is designed for common broker CSV files, not every possible CSV dialect.
- There is no multi-portfolio history yet.
- There is no authentication or user account system.
- There is no live market price refresh.
- There is no target allocation or rebalancing workflow yet.
- Manual assignments are browser-local and do not automatically move between devices.
- Classification is rule-based, not a full security master or AI classifier.
- The Accounts filter re-slices client-computed panels only; the precomputed panels (Dial / Sortino Overlay / Risk Contribution) and snapshot history stay whole-book and show a badge instead (see *Account scope: the Accounts dropdown*).
- The Risk Contribution panel only measures holdings with a market-price series in the warehouse; non-marked holdings (CDs, annuities, private funds) are excluded, so a private-heavy slice covers only its marked portion (the panel's banner states the coverage).

## 6. Recommended Next Enhancements

1. Add import presets for Schwab, Fidelity, Vanguard, and Interactive Brokers.
2. Add database-backed portfolio snapshots with required valuation dates.
3. Add target allocations by sleeve.
4. Add rebalance recommendations.
5. Add export to CSV or PDF.
6. Add local IndexedDB storage for larger portfolios and import history.
7. Package as a desktop app using Tauri.
8. Add optional AI-assisted sleeve classification with explicit user review.

### Temporal Performance Analysis

Version 2.0 should store dated portfolio snapshots so performance can be analyzed over time.

Each saved import needs two dates:

- `valuationDate`: the date the asset prices and market values are effective.
- `importedAt`: the date and time the file was loaded into the app.

The valuation date is the important date for performance analysis. Upload date is not a substitute.

The recommended local-first storage path is IndexedDB for the browser app, with SQLite as the likely storage layer if the app is later packaged with Tauri.
