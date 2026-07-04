"""Build olap/classification_rules.json — the SHARED classifier source for both
olap/src/app.js (classifyHolding) and portfolio_analysis.py (classify). Merges the
OLAP TICKER_RULES with portfolio_analysis.py's coverage; emits taxonomy CODES +
a convex-role rollup; validates against the real Portfolio/ holdings."""
import csv, glob, json, os, re
from collections import defaultdict

OLAP = "/Users/david/agentic_software_from_scratch/olap"
PDIR = "/Users/david/agentic_software_from_scratch/Portfolio"
tax = json.load(open(f"{OLAP}/custom_sleeve_definitions.json"))
NAME2CODE = {s["name"]: s["code"] for s in tax["sleeves"]}
CODES = {s["code"] for s in tax["sleeves"]}

# ── OLAP's existing rules (from app.js, keyed by sleeve NAME) ──────────────────
OLAP_RULES = [
 ("Large Cap Tech",["AAPL","MSFT","NVDA","GOOGL","GOOG","META","AMZN","AVGO"],["technology","software","semiconductor"]),
 ("Large Growth",["VUG","QQQ","QQQM","IWF","SCHG","SPYG","VOOG","IVW"],["large growth"]),
 ("Large Blend",["SPY","VOO","IVV","VTI","ITOT","SCHB","IWB","DFAC","AVUS","SPLG","DFAU","OEF","DYNF","QUAL","USMV","MTUM","JEPI"],["large blend","total stock market","s&p 500","core equity","russell 1000"]),   # JEPI = S&P equity + covered calls (equity income, NOT a bond)
 ("Large Value",["VTV","IVE","IWD","SCHV","SCHD","DGRO","VIG","DFAV","VLUE"],["large value","dividend equity","dividend appreciation","high dividend"]),
 ("Mid-Cap Growth",["VOT","IWP","MDYG"],["mid cap growth","mid-cap growth"]),
 ("Mid-Cap Blend",["VO","IJH","IWR","SCHM"],["mid cap blend","mid-cap blend"]),
 ("Mid-Cap Value",["VOE","IWS","MDYV"],["mid cap value","mid-cap value"]),
 ("Small Growth",["VBK","IWO","IJT"],["small growth"]),
 ("Small Blend",["VB","IWM","IJR","SCHA"],["small blend"]),
 ("Small Value",["VBR","IWN","IJS","AVUV","DFSV"],["small value","small cap value"]),
 ("Precious Metals",["GLD","IAU","SLV","SGOL","GLDM"],["gold","silver","precious metals"]),
 ("Broad Commodities",["DBC","PDBC","USO","GSG"],["commodity","commodities","broad basket"]),
 ("Trend Following Managed Futures",["DBMF"],["trend following managed futures"]),
 ("Managed Futures",["KMLM","CTA","FMF","WTMF"],["managed futures"]),
 ("Trend Following",["TFPN","RSST"],["trend following"]),   # P3-15: dropped bare 'trend' (swept crypto-trend / trendpilot OVERLAYS into Convexity); pin real trend funds by ticker
 ("International",["VXUS","IEV","VEU","ACWX"],["international","developed markets","europe"]),
 ("Foreign Large Blend",["VEA","IEFA","SCHF","EFA","DODFX","MFAPX","ACWI","DXJ"],["foreign large blend","international stock","internatl stock","intl advantage","intl equity"]),   # DXJ = WisdomTree Japan hedged (FMP)
 ("Foreign Large Growth",["EFG","VIGI"],["foreign large growth"]),
 ("Foreign Large Value",["EFV","IVLU","VYMI","HDEF"],["foreign large value","international high dividend"]),
 ("Foreign Small/Mid Blend",["VSS","SCZ","SCHC"],["foreign small mid","foreign small/mid blend"]),
 ("Emerging Markets",["EEM","VWO","IEMG","SCHE"],["emerging"]),
 ("Communications",["XLC","VOX","IYZ"],["communications sector"]),
 ("Consumer Cyclical",["XLY","VCR","IYC"],["consumer cyclical","consumer discretionary"]),
 ("Consumer Defensive",["XLP","VDC","IYK"],["consumer defensive","consumer staples"]),
 ("Equity Energy",["XLE","VDE","IYE"],["energy sector","equity energy"]),
 ("Equity Precious Metals",["GDX","GDXJ","RING"],["equity precious metals","gold miners"]),
 ("Industrials",["XLI","VIS","IYJ","PWRD","NASA"],["industrials sector"]),   # PWRD = energy-transition; NASA = space economy / aerospace (FMP)
 ("Infrastructure",["IGF","PAVE","IFRA"],["infrastructure"]),
 ("Natural Resources",["IGE","GNR","NANR","REMX"],["natural resources","rare earth","strategic metals"]),
 ("Technology",["XLK","VGT","IYW","FTEC"],["technology sector"]),
 ("Health",["XLV","VHT","IYH"],["health sector","healthcare"]),
 ("Financial",["XLF","VFH","IYF"],["financial sector"]),
 ("Real Estate",["VNQ","IYR","XLRE","SCHH","HST","PLD","EQIX"],["real estate","reit"]),   # HST/PLD/EQIX = REIT stocks (FMP)
 ("Utilities",["XLU","VPU","IDU"],["utilities sector"]),
 ("Junk Bonds",["HYG","JNK","USHY","SJNK","HYLB","ANGL","HYEM"],["high yield","junk bond","below investment grade"]),
 ("Corporate Bonds",["LQD","VCIT","VCLT","IGIB","IGSB","VTC","VCSH","IBDW"],["corporate bond","investment grade corporate"]),   # IBDW = iBonds target-maturity corporate
 ("Municipal Bonds",["MUB","VTEB","TFI","PZA","HYD","SHM"],["municipal","muni","tax exempt","tax-free","auth rev","rev ref","sales tax rev","wtr & sew","wtr & swr","swr rev","fin auth rev","pub pwr","gen oblig"," sch dist"," unif sd","util rev"," go bds"]),
 ("Core / Multisector Bonds",["BND","AGG","BNDX","IUSB","SCHZ","JPIE","FLXR","VWOB","BIV","MBB","VMBS","GNMA","CLOA"],["bond","fixed income","aggregate","flexible income","income etf","multisector","universal","collateralized loan","ultrashort","ultra short","ultrasho","short duration income"]),   # P3-15: dropped bare 'clo' (matched CLOSED-END etc.); CLOA pinned by ticker
 ("Direct Lending",["BIZD","PSP"],["direct lending","middle market lending"]),
 ("Private Credit",["PC","PRCR"],["private credit","private debt","enhanced lending","credit fund class"]),
 ("Cash",["CASH","SWVXX","SPAXX","VMFXX","FDRXX","BIL","SGOV","SNVXX","SNAXX","FZFXX","XBIL","BOXX","MINT","SHV","FNSXX","FDRXX","SPRXX"],["cash","money market","money mkt","mmkt","money inv","money ultra","prime advantage","government money","short maturity","6 month bill"]),
]

# ── portfolio_analysis.py coverage that OLAP lacks → map to CODE directly ──────
EXTRA = [  # (code, tickers, name-keywords)
 ("TREND_FOLLOWING_MANAGED_FUTURES",["AQMNX","AQMIX","AQMRX"],["aqr managed futures","systematic trend"]),
 ("LIQALTS",["CLSE","QLEIX","QLENX","BLNDX","REMIX"],["long/short","long short","market neutral","absolute return","delphi","145/45"]),
 ("TREND_FOLLOWING_MANAGED_FUTURES",["AHLPX","ASFYX","RSBT"],[]),   # 2026-06-24/25: American Beacon AHL + ASG/AlphaSimplex MFs + RSBT (Return Stacked Bonds & MF — ticker-pin so the bond-name marker doesn't steal it to Income) → Convexity
 ("OPTIONS",["PFIX","CAOS","IVOL"],[]),                      # 2026-06-24/25: Simplify PFIX rate-hedge + Alpha Architect CAOS tail-risk + IVOL (long swaption-vol + TIPS rate-vol play) — options-based → Convexity (operator reclassification)
 ("OTHER",["BITC","BTOP","BTRN","PTLC","PTMC","PTNQ","PTEU","PTIN","PTBD","TRND","AETH","THMZ","LFEQ","WBIN","WBIT","TACE","TAEQ","TEGS","HYTR","TFFI","STRN","TRDF","VMOT"],[]),  # 2026-06-24: DE-classify from Convexity — Bitwise/GlobalX crypto-trend + Pacer Trendpilot equity/bond trend-OVERLAYS were swept in by the "trend"/"systematic" keywords; they are NOT crisis-alpha convexity (operator cleanup)
 ("PRCR",[],["blackstone private credit","blackstone priv","mlt-asst crdt","multi-asset credit","cliffwater","bdc","alternative lending","alt lending","lending rs","direct lending fund"]),
 ("PE_BUYOUT",[],["private capital","pe strategies","private equity","buyout"," lp class"]),
 ("REAL_ASSETS",["RAAX","RLY"],[]),   # LIQUID real-asset / real-return ETF baskets (FMP) — RAAX/RLY
 ("PRIVATE_REAL_ESTATE",[],["real estate fund","real estate income","reit trust","park place","stallion","income property","jones lang"]),   # illiquid private RE funds (Stallion/BREIT/Park Place/Jones Lang)
 ("MULTI_ASSET",["BCAT"],["capital allocation","multi-asset","multi asset","balanced allocation","flexible allocation"]),   # BCAT = BlackRock Capital Allocation Term Trust
 ("PRIVATE_ALTERNATIVES",[],["reinsurance","risk premium","risk prmm","insurance-linked"," ils"]),
 # Treasuries route to a PROPOSED code (see proposedTaxonomyAdditions); falls to BONDS if absent
 ("TREASURIES",["IEF","TLT","VGIT","VGLT","SHY","GOVT","IEI","EDV","TIP","VTIP","TLTW","TLH","LIFT"],["treasury","treas","t-bond","t-note","govt bond","inflation protected","tips"]),   # TLH=10-20y Treasury; LIFT=LifeX Treasury-backed income
 ("BANK_LOANS",["BKLN","SRLN","FLOT","VRIG","FLRN","USFR"],["senior loan","bank loan","floating rate"]),
 ("CDS",[],["fdic ins","certificate of deposit","cd fdic","brokered cd"]),   # FDIC-insured CDs (CUSIP-held → caught before the bond CUSIP fallback)
]

# ── name → code resolution (OLAP rules use names) ─────────────────────────────
def to_code(name):
    if name in NAME2CODE: return NAME2CODE[name]
    raise SystemExit(f"OLAP rule name not in taxonomy: {name!r}")

ticker_rules, name_rules = {}, []
# Private-alternative name rules are checked FIRST: private-fund names frequently embed public-sector
# keywords ("real estate", "credit", "private equity") and must classify by their specific name
# before the generic public rules — e.g. STALLION / PARK PLACE "... REAL ESTATE FUND" were matching
# the public REIT "Real Estate" rule. (2026-06-21)
PRIVATE_FIRST = {"PRIVATE_REAL_ESTATE", "PRCR", "PE_BUYOUT", "PRIVATE_ALTERNATIVES"}
for c, tks, words in EXTRA:
    if c in PRIVATE_FIRST and words: name_rules.append({"keywords": words, "code": c})
for name, tks, words in OLAP_RULES:
    c = to_code(name)
    for t in tks: ticker_rules[t.upper()] = c
    if words: name_rules.append({"keywords": words, "code": c})
PROPOSED = set()  # TREASURIES + BANK_LOANS are now real taxonomy sleeves (added 2026-06-18)
for c, tks, words in EXTRA:
    for t in tks: ticker_rules.setdefault(t.upper(), c)
    if words and c not in PRIVATE_FIRST: name_rules.append({"keywords": words, "code": c})

# ── convex-role rollup for every code (+ proposed) ────────────────────────────
def role(code):
    if code in {"CASH"}: return "Cash"
    if code in {"PRECIOUS_METALS","BROAD_COMMODITIES","COMMODITIES"}: return "Diversifier"
    if code in {"LIQALTS","MANAGED_FUTURES","TREND_FOLLOWING","TREND_FOLLOWING_MANAGED_FUTURES","OPTIONS"}: return "Convexity"
    if code in {"PREQ","PE_BUYOUT","PE_GROWTH_EQUITY","PE_VENTURE_CAPITAL","PE_SECONDARIES",
                "PRIVATE_ALTERNATIVES","REAL_ASSETS","PRIVATE_REAL_ESTATE","PRCR","DIRECT_LENDING","ALTERNATIVES"}: return "Other-Alt"
    if code in {"TREASURIES"}: return "Duration"
    if code in {"BONDS_CREDIT","PUBLIC_BONDS","BONDS","JUNK_BONDS","CORPORATE_BONDS","MUNICIPAL_BONDS","BANK_LOANS","CDS","ANNUITY_STABLE"}: return "Income"
    if code in {"OTHER","UNCLASSIFIED","OTHER_UNCLASSIFIED"}: return "Other"
    return "Growth"   # all equity (public + sectors + intl + EM)
sleeve_to_convex = {s["code"]: role(s["code"]) for s in tax["sleeves"]}
for p in PROPOSED: sleeve_to_convex[p] = role(p)

# ── SSOT maps for the consumers (2026-07-03 Class-C consolidation) ────────────
# Both olap/src/app.js and portfolio_analysis.py used to hand-maintain drifted
# copies of the taxonomy (DEFAULT_SLEEVES, SLEEVE_PARENTS, _AC_EQUITY/_BROAD_*).
# Emit them from the ONE taxonomy source so they can't drift again.
CODE2NAME = {s["code"]: s["name"] for s in tax["sleeves"]}
# name → parent NAME (the hierarchy app.js keys money aggregation off of).
name_to_parent = {
    s["name"]: (CODE2NAME.get(s["parent"]) if s.get("parent") else None)
    for s in tax["sleeves"]
}
# ordered display-name list (app.js DEFAULT_SLEEVES).
sleeves_list = [s["name"] for s in tax["sleeves"]]
# base asset-class bucket per sleeve (app.js _AC_* / pa _BROAD_*). Derived from the
# convex role so the equity set is COMPLETE (P3-23/32: the hand lists missed ~14
# sector/foreign equity sleeves → they leaked into 'Alternatives'). CDs is Cash
# though its convex role is Income; Annuity/Stable stays Alternatives (unchanged).
def asset_class(code):
    if code in {"CASH", "CDS"}: return "Cash"
    # composite / stable-value sleeves keep an Alternatives BASE — the consumers
    # refine them via their own approximate underlying-mix splits (unchanged behavior).
    if code in {"ANNUITY_STABLE", "MULTI_ASSET"}: return "Alternatives"
    r = role(code)
    if r in {"Income", "Duration"}: return "Bond"
    if r == "Growth": return "Equity"
    return "Alternatives"
asset_class_of_sleeve = {s["name"]: asset_class(s["code"]) for s in tax["sleeves"]}

out = {
 "version":"1.0", "taxonomyRef":"custom_sleeve_definitions.json",
 "note":"SHARED classifier for olap/src/app.js (classifyHolding) and portfolio_analysis.py (classify). "
        "Generated by build_classification_rules.py — do not hand-edit. Priority: exact ticker → name keyword "
        "(first match, in array order) → CUSIP fallbackRules → Unclassified. Sleeve values are taxonomy CODES; "
        "codeToName maps each to the display name app.js uses. sleeveToConvex rolls the sleeves up to 7 convex "
        "roles for the overlay/reserve/tax analytics.",
 "proposedTaxonomyAdditions":[
   {"code":"LONG_SHORT_EQUITY","name":"Long/Short Equity","parent":"LIQALTS","why":"AQR Flex/Delphi/CLSE — no L/S-equity leaf exists today; currently mapped to LIQALTS"},
   {"code":"REINSURANCE","name":"Reinsurance / Insurance-Linked","parent":"PRIVATE_ALTERNATIVES","why":"Stone Ridge — true diversifier; currently mapped to PRIVATE_ALTERNATIVES"},
 ],
 "codeToName": {s["code"]: s["name"] for s in tax["sleeves"]},
 "sleeves": sleeves_list,
 "nameToParent": name_to_parent,
 "assetClassOfSleeve": asset_class_of_sleeve,
 "tickerRules": dict(sorted(ticker_rules.items())),
 "nameRules": name_rules,
 "fallbackRules": [
   {"id":"option","symbolPattern":"^.*\\d{2}/\\d{2}/\\d{4}","code":"OPTIONS",
    "why":"listed equity option — the symbol carries an expiry date (e.g. 'SPY 09/18/2026 585.00 P')"},
   {"id":"muni_cusip","symbolPattern":"^[0-9A-Z]{8,9}$",
    "nameAny":["rev","auth","cnty","county"," st ","ctfs","bds","oblig","sch dist","transn","grant antic","util","tax","ser.","g o ","go bds"],
    "code":"MUNICIPAL_BONDS","why":"individual muni bond held as CUSIP"},
   {"id":"bond_cusip","symbolPattern":"^[0-9A-Z]{8,9}$","code":"BONDS","why":"individual bond/CD held as CUSIP, non-muni"}
 ],
 "sleeveToConvex": sleeve_to_convex,
}
json.dump(out, open(f"{OLAP}/classification_rules.json","w"), indent=2)
print(f"wrote {OLAP}/classification_rules.json")
print(f"  {len(ticker_rules)} ticker rules · {len(name_rules)} name-rule groups · {len(CODES)} taxonomy codes")
print(f"  proposed taxonomy additions: {sorted(PROPOSED)} (rules use them; add to taxonomy to make valid)")

# ── classify() that consumes the rules (reference impl) + validate on real book ──
def _num(s):
    s=str(s or '').replace('$','').replace(',','').strip()
    return None if s in ('','--') else (float(s) if re.match(r'-?[0-9.]+$',s) else None)
def classify(ticker, desc):
    t=(ticker or '').upper(); d=(desc or '').lower()
    if t in ticker_rules: return ticker_rules[t]
    for r in name_rules:
        if any(k in d for k in r["keywords"]): return r["code"]
    if re.match(r"^[0-9A-Z]{8,9}$", t):  # CUSIP fallback
        muni=["rev","auth","cnty","county"," st ","ctfs","bds","oblig","sch dist","transn","grant antic","util","tax","ser.","g o ","go bds"]
        return "MUNICIPAL_BONDS" if any(k in d for k in muni) else "BONDS"
    return "UNCLASSIFIED"

tot=defaultdict(float); roll=defaultdict(float); uncl=[]
seen_fid_accts={}  # Account Number -> first file; overlapping Fidelity exports repeat accounts (2026-07 review: Z70420263 was double-counted, +$118,751.45)
for path in sorted(glob.glob(f"{PDIR}/*.csv")):
    base=os.path.basename(path)
    if base.startswith("Fidelity") and "AQR_FLEX45" not in base:
        skipped=defaultdict(float)
        for r in csv.DictReader(open(path,encoding="utf-8-sig")):
            sym=(r.get("Symbol") or "").strip().upper().lstrip("-"); mv=_num(r.get("Current Value"))
            if not sym or mv is None or "brokerage" in sym.lower(): continue
            acct=(r.get("Account Number") or "").strip()
            if acct and seen_fid_accts.get(acct, base)!=base:
                skipped[acct]+=mv; continue
            if acct: seen_fid_accts.setdefault(acct, base)
            c=classify(sym,r.get("Description")); tot[c]+=mv; roll[sleeve_to_convex.get(c,"Other")]+=mv
            if c=="UNCLASSIFIED": uncl.append((sym,(r.get("Description") or "")[:34],mv))
        for acct,mv in skipped.items():
            print(f"  ⚠ {base}: account {acct} already counted from {seen_fid_accts[acct]} — skipped duplicate rows (${mv:,.2f})")
    elif "AQR_FLEX45" in base:
        rows=list(csv.DictReader(open(path,encoding="utf-8-sig"))); net=sum(_num(r.get("Current Value")) or 0 for r in rows)
        tot["LIQALTS"]+=net; roll["Convexity"]+=net  # SMA collapsed (pipeline ingest)
    else:
        for r in csv.reader(open(path)):
            if not r or not r[0] or r[0].startswith("Positions for") or r[0] in ("Symbol","Positions Total"): continue
            if r[0]=="Cash & Cash Investments": mv=_num(r[6]) if len(r)>6 else 0; tot["CASH"]+=mv or 0; roll["Cash"]+=mv or 0; continue
            mv=_num(r[6]) if len(r)>6 else None
            if mv is None: continue
            c=classify(r[0],r[1] if len(r)>1 else ""); tot[c]+=mv; roll[sleeve_to_convex.get(c,"Other")]+=mv
            if c=="UNCLASSIFIED": uncl.append((r[0],(r[1] if len(r)>1 else "")[:34],mv))
g=sum(tot.values()); uncl_v=tot.get("UNCLASSIFIED",0)
print(f"\nVALIDATION on real book (${g:,.0f}):  unclassified ${uncl_v:,.0f} ({100*uncl_v/g:.1f}%)")
print("  convex rollup:", {k:f'${v/1e6:.2f}M' for k,v in sorted(roll.items(),key=lambda x:-x[1])})
if uncl: print("  unclassified holdings:", [(u[0],u[1]) for u in sorted(uncl,key=lambda x:-x[2])[:8]])
