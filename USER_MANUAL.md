# Portfolio OLAP Implementation and User Manual

## 1. Purpose

Portfolio OLAP is a local browser-based portfolio analytics tool for reviewing investments by sleeve. A sleeve is a portfolio category such as Morningstar-style equity categories, Commodities, Managed Futures, Trend Following, Trend Following Managed Futures, Large Cap Tech, Large Cap Growth, International, Emerging Markets, Bonds, Junk Bonds, Corporate Bonds, Municipal Bonds, Private Credit, Direct Lending, Cash, Alternatives, Other, or Unclassified.

The application is designed around an OLAP-style workflow:

1. Import holdings from a broker CSV.
2. Normalize the data into a common holding model.
3. Assign each holding to a sleeve.
4. Aggregate the portfolio by sleeve.
5. Drill down from total portfolio to sleeve to individual holdings.

The current implementation is a zero-dependency MVP. It runs in a browser using static HTML, CSS, and JavaScript.

## 2. Current Implementation

### Files

- `index.html`: Application markup and page structure.
- `src/styles.css`: Visual design, responsive layout, tables, panels, buttons, and modal styling.
- `src/app.js`: Application logic, CSV parsing, sleeve classification, state management, rendering, and local persistence.
- `custom_sleeve_definitions.json`: v2.0 sleeve hierarchy and Morningstar-aligned category hints.
- `USER_MANUAL.md`: This implementation guide and user manual.
- `package.json`: Lightweight scripts for validation and local serving.

### Runtime Model

The application does not require a backend server for business logic. It runs entirely in the browser.

Data is stored in browser `localStorage` under the `portfolio-olap:` prefix:

- `portfolio-olap:holdings`: The current normalized portfolio.
- `portfolio-olap:assignments`: User-created sleeve overrides.

Because data is local to the browser, no portfolio data is uploaded to an external service.

### App Structure

The UI has three main areas:

- Sidebar: brand, navigation, and sleeve drill-down buttons.
- Top bar: current view title, CSV upload, sample data reset, and user manual.
- Main workspace: metrics, allocation chart, top holdings, CSV mapping, and holdings table.

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

When the app first opens, it displays sample holdings. Use this data to explore the workflow before importing a broker file.

Click `Sample` to reset the app back to the sample portfolio.

### Importing a CSV

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

### Drilling Down by Sleeve

Use the sleeve list in the sidebar to filter the portfolio.

- Click `All Portfolio` to see everything.
- Click a sleeve name to see only holdings in that sleeve.
- Click an allocation row to drill into that sleeve.
- Click a top holding to jump to its sleeve.

The title and holdings table update based on the active sleeve.

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

In the current MVP, this path is shown as a visual explanation panel while the holdings table filters by sleeve. In v2.0, the same hierarchy should become the actual expandable grid:

1. Level 0: Portfolio summary row.
2. Level 1: Broad asset class.
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

Edit `DEFAULT_SLEEVES` in `src/app.js`.

Add the sleeve name to the array:

```js
const DEFAULT_SLEEVES = [
  "Commodities",
  "Managed Futures",
  "New Sleeve Name",
  "Unclassified",
];
```

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

Edit `TICKER_RULES` in `src/app.js`.

Example:

```js
{
  sleeve: "Alternatives",
  tickers: ["ALT", "QAI"],
  words: ["alternative", "multi-strategy"]
}
```

Rules can match by ticker or by words found in the asset name.

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
