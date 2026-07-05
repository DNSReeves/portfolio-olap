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
 ("Large Growth",["VUG","QQQ","QQQM","IWF","SCHG","SPYG","VOOG","IVW"],["large growth","large cap growth","large-cap growth","nasdaq 100","nasdaq-100","mega cap growth","mega-cap growth","russell top 200 growth","quality growth","morningstar growth","blue chip growth","u.s. growth","us growth","nasdaq composite","growth stock","active growth","focused growth","growth opportunities"]),
 ("Large Blend",["SPY","VOO","IVV","VTI","ITOT","SCHB","IWB","DFAC","AVUS","SPLG","DFAU","OEF","DYNF","QUAL","USMV","MTUM","JEPI"],["large blend","total stock market","s&p 500","core equity","russell 1000","large cap core","large-cap core","large cap blend","large-cap blend","msci usa","enhanced large","broad market","u.s. large cap","us large cap","u.s. large-cap","us large-cap","large cap equity","mega cap","mega-cap","russell top 200","momentum factor","quality factor","morningstar u.s. equity","wide moat","moat etf","market factor tilt","blue chip","dow jones industrial","dow jones u.s.","betabuilders u.s. equity","u.s. quality","us quality","quality large cap","kld 400","quantitative momentum","large company","russell 3000","s&p 1500","select 500","transform 500","strive 500","essential 40","motley fool 100","capital strength","research enhanced","fundamental u.s. large","fundamental us large","top 20 u.s","nasdaq top","rafi us 1000"]),   # 'betabuilders u.s.' made contiguous '…u.s. equity' — the bare form stole BetaBuilders U.S. Small/Mid Cap + Aggregate Bond   # JEPI = S&P equity + covered calls  ·  'momentum/quality factor' kept (guarded by 'intl … factor' below); bare 'multifactor'/'equity factor' NOT keyworded — they beat 'small-cap'(9)/'international'(13) and steal small-cap & foreign factor funds
 ("Large Value",["VTV","IVE","IWD","SCHV","SCHD","DGRO","VIG","DFAV","VLUE"],["large value","dividend equity","dividend appreciation","high dividend","large cap value","mega cap value","value factor","dividend multiplier","rising dividend","dividend leaders","dividend achievers","superdividend","strategic dividend","s&p dividend","morningstar value","quantitative value","u.s. value","us value","marketwide value","dynamic value"]),   # 'large cap value'/'value factor' guarded by 'international … value' below.  'select/core/quality/sector dividend' + 'dividend growth/growers' NOT keyworded — long dividend phrases beat 'international'(13)/'small-cap'(9) and steal foreign & small-cap dividend funds; only NON-colliding dividend phrases kept
 ("Mid-Cap Growth",["VOT","IWP","MDYG"],["mid cap growth","mid-cap growth","smid growth"]),
 ("Mid-Cap Blend",["VO","IJH","IWR","SCHM"],["mid cap blend","mid-cap blend","mid cap core","mid-cap core","midcap","s&p midcap","mid-cap","mid cap equity","u.s. mid cap","us mid cap","small-mid cap","small/mid cap","s&p 400","smid core","smid cap","small and mid cap","russell 2500","extended market"]),   # bare 'small mid cap' dropped — ties 'mid cap value'(13) and flips value funds to blend
 ("Mid-Cap Value",["VOE","IWS","MDYV"],["mid cap value","mid-cap value"]),
 ("Small Growth",["VBK","IWO","IJT"],["small growth","small cap growth","small-cap growth"]),
 ("Small Blend",["VB","IWM","IJR","SCHA"],["small blend","small cap","small-cap","smallcap","russell 2000","small cap core","small-cap core","micro cap","microcap","small company","fundamental u.s. small","fundamental us small"]),   # 's&p smallcap' dropped — beat 'technology' and pulled the S&P SmallCap sector-tech fund out of Tech
 ("Small Value",["VBR","IWN","IJS","AVUV","DFSV"],["small value","small cap value","small-cap value"]),
 ("Precious Metals",["GLD","IAU","SLV","SGOL","GLDM"],["silver","precious metals"]),   # P3-15: dropped bare 'gold' (matched GOLDMAN SACHS bonds); bullion ETFs stay ticker-pinned
 ("Broad Commodities",["DBC","PDBC","USO","GSG"],["commodity","commodities","broad basket"]),
 ("Trend Following Managed Futures",["DBMF"],["trend following managed futures"]),
 ("Managed Futures",["KMLM","CTA","FMF","WTMF"],["managed futures"]),
 ("Trend Following",["TFPN","RSST"],["trend following"]),   # P3-15: dropped bare 'trend' (swept crypto-trend / trendpilot OVERLAYS into Convexity); pin real trend funds by ticker
 ("International",["VXUS","IEV","VEU","ACWX"],["international","developed markets","europe","global dividend","global equity","global stock market","global select equity","global 100","global value","islamic world","total world","world equity","world ex-us","world ex us","global dow","asia 50","asia ex japan","asia pacific ex"]),
 ("Foreign Large Blend",["VEA","IEFA","SCHF","EFA","DODFX","MFAPX","ACWI","DXJ"],["foreign large blend","international stock","internatl stock","intl advantage","intl equity","msci eafe","eafe","developed ex-us","developed ex us","ftse developed","msci japan","msci germany","msci united kingdom","msci canada","msci australia","msci switzerland","msci france","msci spain","msci italy","ftse japan","international large cap","intl quality factor","intl momentum factor","international quality factor","international momentum factor","msci world","msci acwi","msci eurozone","msci pacific","msci netherlands","msci finland","msci austria","msci israel","msci singapore","msci hong kong","msci belgium","msci denmark","msci norway","msci new zealand","msci ireland","ftse pacific","betabuilders japan","betabuilders canada","betabuilders developed","betabuilders europe","ftse canada","ftse united kingdom","msci sweden","dax germany","euro stoxx","developed world","overseas equity","international large company","international research enhanced"]),   # DXJ = WisdomTree Japan hedged  ·  intl-large-company / intl-research-enhanced guards beat 'large company'/'research enhanced' (FMP)  ·  'international/intl … factor' + 'international large cap' guards win over the bare US factor/cap keywords
 ("Foreign Large Growth",["EFG","VIGI"],["foreign large growth"]),
 ("Foreign Large Value",["EFV","IVLU","VYMI","HDEF"],["foreign large value","international high dividend","international large cap value","intl value factor","international value factor","international dividend","intl dividend","international quality dividend","intl quality dividend","international dividend growth","global select dividend"]),
 ("Foreign Small/Mid Blend",["VSS","SCZ","SCHC"],["foreign small mid","foreign small/mid blend","international small company"]),   # guard beats 'small company'
 ("Emerging Markets",["EEM","VWO","IEMG","SCHE"],["emerging markets","emerging","msci china","msci india","msci brazil","msci mexico","msci taiwan","msci south korea","msci indonesia","msci saudi arabia","msci south africa","msci turkey","msci thailand","msci malaysia","ftse china","ftse india","ftse brazil","msci peru","msci colombia","msci poland","msci philippines","msci qatar","msci egypt","msci greece","msci hungary","msci argentina","msci vietnam","msci kuwait","msci chile","ftse taiwan","ftse south korea","china large-cap","s&p china","china a-shares","csi 300","china alphadex","india earnings","india 50","nifty","india consumer","vietnam","africa","latin america","star market"]),
 ("Communications",["XLC","VOX","IYZ"],["communications sector","telecom","social media","5g","comm services","communication services"]),
 ("Consumer Cyclical",["XLY","VCR","IYC"],["consumer cyclical","consumer discretionary","e-commerce","retail"]),
 ("Consumer Defensive",["XLP","VDC","IYK"],["consumer defensive","consumer staples"]),
 ("Equity Energy",["XLE","VDE","IYE"],["energy sector","equity energy","clean energy","solar","renewable energy","uranium","nuclear energy","oil & gas","oil and gas","midstream","clean power","green energy","clean edge","hydrogen","mlp etf","global energy","msci energy","wind energy","coal","energy exploration"]),
 ("Equity Precious Metals",["GDX","GDXJ","RING"],["equity precious metals","gold miners"]),
 ("Industrials",["XLI","VIS","IYJ","PWRD","NASA"],["industrials sector","aerospace","defense etf","airlines","defense tech","aerospace & defense","space tech","defense industry","transportation","global industrials","msci industrials","manufacturing","reshoring","producer durables"]),   # PWRD = energy-transition; NASA = space economy / aerospace (FMP)
 ("Infrastructure",["IGF","PAVE","IFRA"],["infrastructure"]),
 ("Natural Resources",["IGE","GNR","NANR","REMX"],["natural resources","rare earth","strategic metals","materials","basic materials","metals & mining","metals and mining","copper miners","mining producers","lithium","global materials","msci materials","agribusiness"]),
 ("Technology",["XLK","VGT","IYW","FTEC"],["technology sector","artificial intelligence","robotics","cybersecurity","cyber security","fintech","cloud computing","blockchain","magnificent seven","metaverse","next gen connectivity","global tech","internet of things","internet","bitcoin miners","crypto miners","ethereum miners","tech leaders","future tech","expanded tech","quantum computing","photonics","video gaming","esports","self-driving"]),   # crypto-MINER equities → Technology (beat 'bitcoin'/'ethereum'→Crypto by length)
 ("Health",["XLV","VHT","IYH"],["health sector","healthcare","health care","biotechnology","biotech","pharmaceutical","medical devices","genomics","global health","msci health","health & wellness"]),
 ("Financial",["XLF","VFH","IYF"],["financial sector","regional bank","capital markets","bank etf","s&p bank","insurance","global financials","msci financials","financial services"]),
 ("Real Estate",["VNQ","IYR","XLRE","SCHH","HST","PLD","EQIX"],["real estate","reit","homebuilders","home construction"]),   # HST/PLD/EQIX = REIT stocks (FMP)
 ("Utilities",["XLU","VPU","IDU"],["utilities sector","water resources","water etf","global water","msci utilities","global utilities"]),
 ("Junk Bonds",["HYG","JNK","USHY","SJNK","HYLB","ANGL","HYEM"],["high yield","junk bond","below investment grade","emerging markets high yield"]),   # EM-HY compound beats bare 'emerging markets' (16) so EM junk stays a bond
 ("Corporate Bonds",["LQD","VCIT","VCLT","IGIB","IGSB","VTC","VCSH","IBDW"],["corporate bond","investment grade corporate","preferred","convertible"]),   # IBDW = iBonds target-maturity corporate  ·  preferred + convertible = credit-income, not equity
 ("Municipal Bonds",["MUB","VTEB","TFI","PZA","HYD","SHM"],["municipal","muni","tax exempt","tax-free","auth rev","rev ref","sales tax rev","wtr & sew","wtr & swr","swr rev","fin auth rev","pub pwr","gen oblig"," sch dist"," unif sd","util rev"," go bds"]),
 ("Core / Multisector Bonds",["BND","AGG","BNDX","IUSB","SCHZ","JPIE","FLXR","VWOB","BIV","MBB","VMBS","GNMA","CLOA"],["bond","fixed income","aggregate","flexible income","income etf","multisector","universal","collateralized loan","ultrashort","ultra short","ultrasho","short duration income","emerging markets bond","emerging market bond","emerging markets debt","emerging markets fixed","emerging markets local","emerging markets sovereign","emerging markets corporate","sukuk","mortgage-backed","mortgage backed","securitized","total world bond"]),   # P3-15: dropped bare 'clo'  ·  'total world bond'(15) beats 'total world'(11) so the world-BOND fund stays a bond (matched CLOSED-END etc.); CLOA pinned by ticker  ·  EM-debt compounds beat bare 'emerging markets' so EM bonds stay bonds
 ("Direct Lending",["BIZD","PSP"],["direct lending","middle market lending"]),
 ("Private Credit",["PC","PRCR"],["private credit","private debt","enhanced lending","credit fund class"]),
 ("Cash",["CASH","SWVXX","SPAXX","VMFXX","FDRXX","BIL","SGOV","SNVXX","SNAXX","FZFXX","XBIL","BOXX","MINT","SHV","FNSXX","FDRXX","SPRXX"],["cash","money market","money mkt","mmkt","money inv","money ultra","prime advantage","government money","short maturity","6 month bill"]),
]

# ── portfolio_analysis.py coverage that OLAP lacks → map to CODE directly ──────
EXTRA = [  # (code, tickers, name-keywords)
 ("TREND_FOLLOWING_MANAGED_FUTURES",["AQMNX","AQMIX","AQMRX"],["aqr managed futures","systematic trend"]),
 ("LIQALTS",["CLSE","QLEIX","QLENX","BLNDX","REMIX"],["long/short","long short","market neutral","absolute return","delphi","145/45"]),
 ("TREND_FOLLOWING_MANAGED_FUTURES",["AHLPX","ASFYX","RSBT"],[]),   # 2026-06-24/25: American Beacon AHL + ASG/AlphaSimplex MFs + RSBT (Return Stacked Bonds & MF — ticker-pin so the bond-name marker doesn't steal it to Income) → Convexity
 ("OPTIONS",["PFIX","CAOS","IVOL"],["buffer","buffered","defined outcome","power buffer","target outcome","floor etf"]),   # PFIX/CAOS/IVOL options hedges + defined-outcome/buffer ETFs (Innovator/FT Vest/Allianz) — option-structured, not plain equity (2026-07-04)
 ("OTHER",["BITC","BTOP","BTRN","PTLC","PTMC","PTNQ","PTEU","PTIN","PTBD","TRND","AETH","THMZ","LFEQ","WBIN","WBIT","TACE","TAEQ","TEGS","HYTR","TFFI","STRN","TRDF","VMOT"],[]),  # 2026-06-24: DE-classify from Convexity — Bitwise/GlobalX crypto-trend + Pacer Trendpilot equity/bond trend-OVERLAYS were swept in by the "trend"/"systematic" keywords; they are NOT crisis-alpha convexity (operator cleanup)
 ("PRCR",[],["blackstone private credit","blackstone priv","mlt-asst crdt","multi-asset credit","cliffwater","bdc","alternative lending","alt lending","lending rs","direct lending fund"]),
 ("PE_BUYOUT",[],["private capital","pe strategies","private equity","buyout"," lp class"]),
 ("REAL_ASSETS",["RAAX","RLY"],[]),   # LIQUID real-asset / real-return ETF baskets (FMP) — RAAX/RLY
 ("PRIVATE_REAL_ESTATE",[],["real estate fund","real estate income","reit trust","park place","stallion","income property","jones lang"]),   # illiquid private RE funds (Stallion/BREIT/Park Place/Jones Lang)
 ("MULTI_ASSET",["BCAT"],["capital allocation","multi-asset","multi asset","balanced allocation","flexible allocation"]),   # BCAT = BlackRock Capital Allocation Term Trust
 ("SECTOR_EQUITY",[],["kensho","new economies"]),   # S&P Kensho thematic-sector baskets ('sector rotation' dropped — it stole bond/fixed-income sector-rotation funds into equity)
 ("CRYPTO",[],["bitcoin","ethereum","digital asset"]),   # spot BTC/ETH trusts + crypto covered-call (miscoded asset_class=Equity upstream) → Crypto sleeve.  'bitcoin/crypto miners' guarded to Technology below (they are equities, not spot crypto)
 ("PRIVATE_ALTERNATIVES",[],["reinsurance","risk premium","risk prmm","insurance-linked"," ils"]),
 # Treasuries route to a PROPOSED code (see proposedTaxonomyAdditions); falls to BONDS if absent
 ("TREASURIES",["IEF","TLT","VGIT","VGLT","SHY","GOVT","IEI","EDV","TIP","VTIP","TLTW","TLH","LIFT"],["treasury","treas","t-bond","t-note","govt bond","inflation protected","tips"]),   # TLH=10-20y Treasury; LIFT=LifeX Treasury-backed income
 ("BANK_LOANS",["BKLN","SRLN","FLOT","VRIG","FLRN","USFR","JAAA","JBBB","PAAA","CLOZ"],["senior loan","bank loan","floating rate","aaa clo","bbb clo"]),   # AAA/BBB CLO tranches = floating-rate loan collateral
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
                "PRIVATE_ALTERNATIVES","REAL_ASSETS","PRIVATE_REAL_ESTATE","PRCR","DIRECT_LENDING","ALTERNATIVES",
                "CRYPTO"}: return "Other-Alt"   # crypto = liquid volatile alt, NOT a protective reserve/diversifier
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
        "Generated by build_classification_rules.py — do not hand-edit. Priority: exact ticker → the LONGEST "
        "matched name keyword (specificity beats array order) → fallbackRules in order (option/muni/bond) → "
        "Unclassified. Consumers MUST use longest-match, not first-match. Sleeve values are taxonomy CODES; "
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
    """Reference impl of the SHARED algorithm — MUST stay identical to app.js
    autoClassify and portfolio_analysis.classify_code (P3-14): exact ticker → the
    LONGEST matched name keyword (specificity beats array order — 'treasury' wins
    over 'bond', 'international' over 'core equity') → fallbackRules in order
    (option-expiry, muni CUSIP, bond CUSIP) → UNCLASSIFIED."""
    t=(ticker or '').upper(); d=(desc or '').lower()
    if t in ticker_rules: return ticker_rules[t]
    best=None; best_len=-1
    for r in name_rules:
        for k in r["keywords"]:
            if len(k)>best_len and k in d: best=r["code"]; best_len=len(k)
    if best is not None: return best
    for f in out["fallbackRules"]:
        if re.search(f["symbolPattern"], t) and (not f.get("nameAny") or any(k in d for k in f["nameAny"])):
            return f["code"]
    return "UNCLASSIFIED"

# ── self-test: adversarial names that used to misroute (P3-15/16, 2026-07) ──
# NOTE (residual, latent): keyword matching is still substring + hyphen-sensitive,
# so "INFLATION-PROTECTED" (hyphen) won't match the 'inflation protected' keyword and
# a 4-char tie ('tips' vs 'bond') resolves to first-seen. Every real TIPS/treasury
# holding is ticker-pinned, so this is latent; a future pass could normalize
# hyphens + break ties toward the more-specific rule.
_SELFTEST = [
    ("38141GXZ5", "GOLDMAN SACHS GROUP INC 4.25% NT", "BONDS"),            # 'gold' no longer steals a Goldman bond
    ("912828XX0", "US TREASURY BOND 4.75% DUE 2044", "TREASURIES"),        # 'treasury' (8) beats 'bond' (4)
    ("DFAIQ", "DIMENSIONAL INTERNATIONAL CORE EQUITY", "INTERNATIONAL"),   # 'international' (13) beats 'core equity' (11)
    ("ZGDX", "VANECK GOLD MINERS FUND", "EQUITY_PRECIOUS_METALS"),         # 'gold miners' beats (dropped) 'gold'
    ("SPY 09/18/2026 585.00 P", "PUT STATE STREET SPDR", "OPTIONS"),       # option-expiry fallback (P3-14)
    ("ZEVCE", "EATON VANCE CLOSED END FUND", "UNCLASSIFIED"),              # 'clo' no longer steals a closed-end fund
    # 2026-07-04: name-rule extension to shrink the "Other · Equity" fallback in the FACET Engine tab
    ("ZSCSC", "ISHARES CORE S&P SMALL-CAP ETF", "SMALL_BLEND"),            # 'small-cap' → Small Blend
    ("ZEWSP", "INVESCO S&P 500 EQUAL WEIGHT ETF", "LARGE_BLEND"),         # 'equal weight' → Large Blend
    ("ZMEAF", "ISHARES MSCI EAFE ETF", "FOREIGN_LARGE_BLEND"),            # 'msci eafe' → Foreign Large Blend
    ("ZMIND", "ISHARES MSCI INDIA ETF", "EMERGING_MARKETS"),              # 'msci india' → EM (not 'indiana' munis)
    ("ZINDMU", "INDIANA ST FIN AUTH REV BDS", "MUNICIPAL_BONDS"),         # 'india' must NOT steal an Indiana muni
    ("ZBUF", "INNOVATOR U.S. EQUITY POWER BUFFER ETF", "OPTIONS"),        # 'power buffer' → Options (defined-outcome)
    ("ZCYB", "FIRST TRUST NASDAQ CYBERSECURITY ETF", "TECHNOLOGY"),       # 'cybersecurity' → Technology
    ("ZBIO", "ISHARES BIOTECHNOLOGY ETF", "HEALTH"),                      # 'biotech' → Health
    ("ZEMEQ", "DIMENSIONAL EMERGING MARKETS CORE EQUITY", "EMERGING_MARKETS"),   # EM equity → EM
    ("ZEMHY", "VIRTUS EMERGING MARKETS HIGH YIELD BOND", "JUNK_BONDS"),   # EM bond must NOT go to EM equity
    ("ZEMFI", "DOUBLELINE EMERGING MARKETS FIXED INCOME", "BONDS"),       # EM fixed income stays a bond
    # 2026-07-05: round-2 Other·Equity extension + geography guards
    ("ZAVLV", "AVANTIS U.S. LARGE CAP VALUE ETF", "LARGE_VALUE"),         # US large-cap value → Large Value
    ("ZAVIV", "AVANTIS INTERNATIONAL LARGE CAP VALUE ETF", "FOREIGN_LARGE_VALUE"),   # 'international large cap value' guard wins
    ("ZVFMO", "VANGUARD U.S. MOMENTUM FACTOR ETF", "LARGE_BLEND"),        # US factor → Large Blend
    ("ZIMTM", "ISHARES MSCI INTL MOMENTUM FACTOR ETF", "FOREIGN_LARGE_BLEND"),   # 'intl momentum factor' guard wins
    ("ZMGK", "VANGUARD MEGA CAP GROWTH ETF", "LARGE_GROWTH"),             # mega cap growth → Large Growth
    ("ZEWN", "ISHARES MSCI NETHERLANDS ETF", "FOREIGN_LARGE_BLEND"),      # developed single-country
    ("ZEPOL", "ISHARES MSCI POLAND ETF", "EMERGING_MARKETS"),             # EM single-country
    ("ZKOMP", "SPDR S&P KENSHO NEW ECONOMIES COMPOSITE ETF", "SECTOR_EQUITY"),   # kensho → Sector Equity
    # 2026-07-05: round-3 dividend / sector / style-box + geography guards
    ("ZRDVY", "FIRST TRUST RISING DIVIDEND ACHIEVERS ETF", "LARGE_VALUE"),        # 'rising dividend' → Large Value
    ("ZIGRO", "ISHARES INTERNATIONAL DIVIDEND GROWTH ETF", "FOREIGN_LARGE_VALUE"),   # intl-dividend guard wins
    ("ZSMDV", "PROSHARES RUSSELL 2000 DIVIDEND GROWERS ETF", "SMALL_BLEND"),      # small-cap dividend stays small
    ("ZIQDF", "FLEXSHARES INTERNATIONAL QUALITY DIVIDEND INDEX", "FOREIGN_LARGE_VALUE"),   # intl-quality-dividend guard
    ("ZKBE", "SPDR S&P BANK ETF", "FINANCIAL"),                                   # bank → Financial
    ("ZXME", "SPDR S&P METALS & MINING ETF", "NATURAL_RESOURCES"),                # metals & mining → Nat Resources
    ("ZMOAT", "VANECK MORNINGSTAR WIDE MOAT ETF", "LARGE_BLEND"),                 # wide moat → Large Blend
    ("ZSPSK", "SP FUNDS DOW JONES GLOBAL SUKUK ETF", "BONDS"),                    # sukuk = Islamic bond, stays a bond
    # 2026-07-05: round-4 sector/country/SMID/quality + MBS correction
    ("ZJMBS", "JANUS HENDERSON MORTGAGE-BACKED SECURITIES ETF", "BONDS"),         # MBS (miscoded equity) → Bonds
    ("ZAVUQ", "AVANTIS U.S. QUALITY ETF", "LARGE_BLEND"),                         # US quality → Large Blend
    ("ZQVAL", "ALPHA ARCHITECT U.S. QUANTITATIVE VALUE ETF", "LARGE_VALUE"),      # quant value → Large Value
    ("ZFENY", "FIDELITY MSCI ENERGY INDEX ETF", "EQUITY_ENERGY"),                 # MSCI sector → Equity Energy
    ("ZASCE", "ALLSPRING SMID CORE ETF", "MID_CAP_BLEND"),                        # SMID → Mid-Cap Blend
    ("ZBBJP", "JPMORGAN BETABUILDERS JAPAN ETF", "FOREIGN_LARGE_BLEND"),          # BetaBuilders single-country
    # 2026-07-05: new Crypto sleeve
    ("ZIBIT", "ISHARES BITCOIN TRUST ETF", "CRYPTO"),                             # spot BTC → Crypto
    ("ZETHA", "ISHARES ETHEREUM TRUST ETF", "CRYPTO"),                            # spot ETH → Crypto
    ("ZWGMI", "VALKYRIE BITCOIN MINERS ETF", "TECHNOLOGY"),                       # crypto MINER equity, NOT spot crypto
    # 2026-07-05: round-5 preferred/CLO/securitized/convertible + country + sector + style
    ("ZPGX", "INVESCO PREFERRED ETF", "CORPORATE_BONDS"),                         # preferred = credit-income, not equity
    ("ZCWB", "SPDR BLOOMBERG CONVERTIBLE SECURITIES ETF", "CORPORATE_BONDS"),     # convertible → Corporate Bonds
    ("ZJAAA", "JANUS HENDERSON AAA CLO ETF", "BANK_LOANS"),                       # AAA CLO tranche → Bank Loans
    ("ZFSEC", "FIDELITY INVESTMENT GRADE SECURITIZED ETF", "BONDS"),              # securitized → Core bonds
    ("ZASHR", "XTRACKERS HARVEST CSI 300 CHINA A-SHARES ETF", "EMERGING_MARKETS"),   # CSI 300 China A → EM
    ("ZEPI", "WISDOMTREE INDIA EARNINGS FUND", "EMERGING_MARKETS"),               # India earnings → EM
    ("ZPHO", "GLOBAL X U.S. INFRASTRUCTURE DEVELOPMENT ETF", "INFRASTRUCTURE"),   # (sanity — infrastructure unchanged)
    ("ZPHOT", "FIRST TRUST NASDAQ QUANTUM COMPUTING ETF", "TECHNOLOGY"),          # quantum computing → Technology
    ("ZCGW", "INVESCO S&P GLOBAL WATER INDEX ETF", "UTILITIES"),                  # global water → Utilities (not munis)
    ("ZWTRMU", "HOUSTON TX WTR & SEW REV BDS", "MUNICIPAL_BONDS"),                # water muni must NOT go to Utilities
    ("ZMOO", "VANECK AGRIBUSINESS ETF", "NATURAL_RESOURCES"),                     # agribusiness → Nat Resources
    ("ZVT", "VANGUARD TOTAL WORLD STOCK ETF", "INTERNATIONAL"),                   # total world → International
    ("ZFLGB", "FRANKLIN FTSE UNITED KINGDOM ETF", "FOREIGN_LARGE_BLEND"),         # FTSE UK → Foreign
    ("ZFNDF", "SCHWAB FUNDAMENTAL INTERNATIONAL LARGE COMPANY INDEX ETF", "FOREIGN_LARGE_BLEND"),   # 'large company' must NOT steal an intl fund
    ("ZFNDC", "SCHWAB FUNDAMENTAL INTERNATIONAL SMALL COMPANY INDEX ETF", "FOREIGN_SMALL_MID_BLEND"),  # 'small company' guard
    ("ZJIRE", "JPMORGAN INTERNATIONAL RESEARCH ENHANCED EQUITY ETF", "FOREIGN_LARGE_BLEND"),   # 'research enhanced' guard
    ("ZBNDW", "VANGUARD TOTAL WORLD BOND ETF", "BONDS"),                          # 'total world' must NOT steal a world-bond fund
]
for _t, _d, _want in _SELFTEST:
    _got = classify(_t, _d)
    if _got != _want:
        raise SystemExit(f"CLASSIFIER SELF-TEST FAILED: {_t!r} / {_d!r} → {_got!r}, expected {_want!r}")
print(f"  classifier self-test: {len(_SELFTEST)}/{len(_SELFTEST)} adversarial names route correctly")

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
