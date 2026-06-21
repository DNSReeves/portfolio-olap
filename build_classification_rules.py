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
 ("Large Blend",["SPY","VOO","IVV","VTI","ITOT","SCHB","IWB","DFAC","AVUS","SPLG","DFAU","OEF","DYNF","QUAL","USMV","MTUM"],["large blend","total stock market","s&p 500","core equity","russell 1000"]),
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
 ("Trend Following",["TFPN","RSST"],["trend following","trend"]),
 ("International",["VXUS","IEV","VEU","ACWX"],["international","developed markets","europe"]),
 ("Foreign Large Blend",["VEA","IEFA","SCHF","EFA","DODFX","MFAPX","ACWI"],["foreign large blend","international stock","internatl stock","intl advantage","intl equity"]),
 ("Foreign Large Growth",["EFG","VIGI"],["foreign large growth"]),
 ("Foreign Large Value",["EFV","IVLU","VYMI","HDEF"],["foreign large value","international high dividend"]),
 ("Foreign Small/Mid Blend",["VSS","SCZ","SCHC"],["foreign small mid","foreign small/mid blend"]),
 ("Emerging Markets",["EEM","VWO","IEMG","SCHE"],["emerging"]),
 ("Communications",["XLC","VOX","IYZ"],["communications sector"]),
 ("Consumer Cyclical",["XLY","VCR","IYC"],["consumer cyclical","consumer discretionary"]),
 ("Consumer Defensive",["XLP","VDC","IYK"],["consumer defensive","consumer staples"]),
 ("Equity Energy",["XLE","VDE","IYE"],["energy sector","equity energy"]),
 ("Equity Precious Metals",["GDX","GDXJ","RING"],["equity precious metals","gold miners"]),
 ("Industrials",["XLI","VIS","IYJ"],["industrials sector"]),
 ("Infrastructure",["IGF","PAVE","IFRA"],["infrastructure"]),
 ("Natural Resources",["IGE","GNR","NANR","REMX"],["natural resources","rare earth","strategic metals"]),
 ("Technology",["XLK","VGT","IYW","FTEC"],["technology sector"]),
 ("Health",["XLV","VHT","IYH"],["health sector","healthcare"]),
 ("Financial",["XLF","VFH","IYF"],["financial sector"]),
 ("Real Estate",["VNQ","IYR","XLRE","SCHH"],["real estate","reit"]),
 ("Utilities",["XLU","VPU","IDU"],["utilities sector"]),
 ("Junk Bonds",["HYG","JNK","USHY","SJNK","HYLB","ANGL","HYEM"],["high yield","junk bond","below investment grade"]),
 ("Corporate Bonds",["LQD","VCIT","VCLT","IGIB","IGSB","VTC","VCSH"],["corporate bond","investment grade corporate"]),
 ("Municipal Bonds",["MUB","VTEB","TFI","PZA","HYD","SHM"],["municipal","muni","tax exempt","tax-free","auth rev","rev ref","sales tax rev","wtr & sew","wtr & swr","swr rev","fin auth rev","pub pwr","gen oblig"," sch dist"," unif sd","util rev"," go bds"]),
 ("Bonds",["BND","AGG","BNDX","IUSB","SCHZ","JPIE","FLXR","VWOB","BIV","MBB","VMBS","GNMA"],["bond","fixed income","aggregate","flexible income","income etf","multisector","universal","clo","collateralized loan","ultrashort","ultra short","ultrasho","short duration income"]),
 ("Direct Lending",["BIZD","PSP"],["direct lending","middle market lending"]),
 ("Private Credit",["PC","PRCR"],["private credit","private debt","enhanced lending","credit fund class"]),
 ("Cash",["CASH","SWVXX","SPAXX","VMFXX","FDRXX","BIL","SGOV","SNVXX","SNAXX","FZFXX","XBIL","BOXX","MINT","SHV","FNSXX","FDRXX","SPRXX"],["cash","money market","money mkt","mmkt","money inv","money ultra","prime advantage","government money","short maturity","6 month bill"]),
]

# ── portfolio_analysis.py coverage that OLAP lacks → map to CODE directly ──────
EXTRA = [  # (code, tickers, name-keywords)
 ("TREND_FOLLOWING_MANAGED_FUTURES",["AQMNX","AQMIX","AQMRX"],["aqr managed futures","systematic trend"]),
 ("LIQALTS",["CLSE","QLEIX","QLENX","BLNDX","REMIX"],["long/short","long short","market neutral","absolute return","delphi","145/45"]),
 ("PRCR",[],["blackstone private credit","blackstone priv","mlt-asst crdt","multi-asset credit","cliffwater","bdc","alternative lending","alt lending","lending rs","direct lending fund"]),
 ("PE_BUYOUT",[],["private capital","pe strategies","private equity","buyout"," lp class"]),
 ("REAL_ASSETS",[],["real estate fund","real estate income","reit trust","park place","stallion","income property","jones lang"]),
 ("PRIVATE_ALTERNATIVES",[],["reinsurance","risk premium","risk prmm","insurance-linked"," ils"]),
 # Treasuries route to a PROPOSED code (see proposedTaxonomyAdditions); falls to BONDS if absent
 ("TREASURIES",["IEF","TLT","VGIT","VGLT","SHY","GOVT","IEI","EDV","TIP","VTIP","TLTW"],["treasury","treas","t-bond","t-note","govt bond","inflation protected","tips"]),
 ("BANK_LOANS",["BKLN","SRLN","FLOT","VRIG","FLRN","USFR"],["senior loan","bank loan","floating rate"]),
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
PRIVATE_FIRST = {"REAL_ASSETS", "PRCR", "PE_BUYOUT", "PRIVATE_ALTERNATIVES"}
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
    if code in {"LIQALTS","MANAGED_FUTURES","TREND_FOLLOWING","TREND_FOLLOWING_MANAGED_FUTURES"}: return "Convexity"
    if code in {"PREQ","PE_BUYOUT","PE_GROWTH_EQUITY","PE_VENTURE_CAPITAL","PE_SECONDARIES",
                "PRIVATE_ALTERNATIVES","REAL_ASSETS","PRCR","DIRECT_LENDING","ALTERNATIVES"}: return "Other-Alt"
    if code in {"TREASURIES"}: return "Duration"
    if code in {"BONDS_CREDIT","PUBLIC_BONDS","BONDS","JUNK_BONDS","CORPORATE_BONDS","MUNICIPAL_BONDS","BANK_LOANS"}: return "Income"
    if code in {"OTHER","UNCLASSIFIED","OTHER_UNCLASSIFIED"}: return "Other"
    return "Growth"   # all equity (public + sectors + intl + EM)
sleeve_to_convex = {s["code"]: role(s["code"]) for s in tax["sleeves"]}
for p in PROPOSED: sleeve_to_convex[p] = role(p)

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
 "tickerRules": dict(sorted(ticker_rules.items())),
 "nameRules": name_rules,
 "fallbackRules": [
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
for path in glob.glob(f"{PDIR}/*.csv"):
    base=os.path.basename(path)
    if base.startswith("Fidelity") and "AQR_FLEX45" not in base:
        for r in csv.DictReader(open(path,encoding="utf-8-sig")):
            sym=(r.get("Symbol") or "").strip().upper().lstrip("-"); mv=_num(r.get("Current Value"))
            if not sym or mv is None or "brokerage" in sym.lower(): continue
            c=classify(sym,r.get("Description")); tot[c]+=mv; roll[sleeve_to_convex.get(c,"Other")]+=mv
            if c=="UNCLASSIFIED": uncl.append((sym,(r.get("Description") or "")[:34],mv))
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
