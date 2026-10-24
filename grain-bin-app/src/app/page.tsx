import Link from "next/link";
import FieldGuide from "./FieldGuide";
type Stablecoin = {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  circulating?: Record<string, number>;
  price?: number;
};
type StablecoinResponse = { peggedAssets: Stablecoin[] };
type HistoricalRecord = {
  date: string | number;
  totalCirculatingUSD?: Record<string, number>;
};

async function getMarketData() {
  const [assetsResponse, historyResponse] = await Promise.all([
    fetch("https://stablecoins.llama.fi/stablecoins?includePrices=true", { next: { revalidate: 3600 } }),
    fetch("https://stablecoins.llama.fi/stablecoincharts/all", { next: { revalidate: 3600 } }),
  ]);
  if (!assetsResponse.ok || !historyResponse.ok) throw new Error("Could not retrieve stablecoin market data");
  const assets: StablecoinResponse = await assetsResponse.json();
  const rawHistory: HistoricalRecord[] = await historyResponse.json();
  const usdAssets = assets.peggedAssets.filter((coin) => coin.pegType === "peggedUSD");
  const history = rawHistory.map((record) => ({
    date: Number(record.date) * 1000,
    supply: record.totalCirculatingUSD?.peggedUSD,
  })).filter((record): record is { date: number; supply: number } =>
    Number.isFinite(record.date) && typeof record.supply === "number" &&
    Number.isFinite(record.supply) && record.supply > 0
  ).sort((a, b) => a.date - b.date);
  return { usdAssets, rawHistory, history };
}

const money = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2,
}).format(value);
const percent = (part: number, whole: number) => whole > 0 ? (100 * part / whole).toFixed(1) : "0.0";
const shortDate = (date: number) => new Date(date).toLocaleDateString("en-US", {
  month: "short", year: "numeric", timeZone: "UTC",
});

function WheatMark({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" fill="currentColor">
    <path d="M32 8C26 15 28 20 32 24C36 20 38 15 32 8Z"/>
    <path d="M18 19C18 28 23 32 30 34C30 27 26 22 18 19Z"/>
    <path d="M46 19C46 28 41 32 34 34C34 27 38 22 46 19Z"/>
    <path d="M16 32C17 40 22 44 30 45C29 38 24 34 16 32Z"/>
    <path d="M48 32C47 40 42 44 34 45C35 38 40 34 48 32Z"/>
    <path d="M31 24H33V55H31Z"/>
  </svg>;
}

export default async function Home() {
  const { usdAssets, rawHistory, history } = await getMarketData();
  const assetTotal = usdAssets.reduce((sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0), 0);
  const supplyFor = (symbol: string) => usdAssets.filter((coin) => coin.symbol === symbol)
    .reduce((sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0), 0);
  const usdt = supplyFor("USDT");
  const usdc = supplyFor("USDC");

  // Historical snapshots contain USD-converted totals keyed by peg type.
  // Do not infer zero when a peg type is absent from the source.
  const snapshot = [...rawHistory].sort((a, b) => Number(b.date) - Number(a.date))
    .find((point) => point.totalCirculatingUSD && Object.keys(point.totalCirculatingUSD).length > 0);
  const pegTotals = snapshot?.totalCirculatingUSD ?? {};
  const total = typeof pegTotals.peggedUSD === 'number' && pegTotals.peggedUSD > 0 ? pegTotals.peggedUSD : null;
  const snapshotDate = snapshot ? Number(snapshot.date) * 1000 : null;
  const hasAssetBreakdown = assetTotal > 0 && Number.isFinite(assetTotal);
  const others = hasAssetBreakdown ? Math.max(0, assetTotal - usdt - usdc) : 0;
  const sourceDifferencePct = total !== null && hasAssetBreakdown ? Math.abs(assetTotal - total) / total * 100 : null;
  const pegGroups = [
    { name: "USD", value: 0, color: "var(--sb-silo)", present: false },
    { name: "EUR", value: 0, color: "var(--sb-harvest)", present: false },
    { name: "Other", value: 0, color: "var(--sb-oxblood)", present: false },
  ];
  for (const [type, amount] of Object.entries(pegTotals)) {
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) continue;
    const peg = type.toLowerCase();
    if (/gold|xau|btc|bitcoin/.test(peg)) continue;
    const index = peg === "peggedusd" ? 0 : peg === "peggedeur" ? 1 : 2;
    pegGroups[index].value += amount;
    pegGroups[index].present = true;
  }
  const allPegTotal = pegGroups.reduce((sum, group) => sum + group.value, 0);
  const latest = snapshotDate !== null ? history.find(point => point.date === snapshotDate) : undefined;
  const thirtyDaysAgo = latest ? latest.date - 30 * 86400000 : 0;
  const previous = history.filter((point) => point.date <= thirtyDaysAgo).at(-1);
  const growth = total !== null && latest && previous ? total - previous.supply : null;
  const growthPct = growth !== null && previous && previous.supply > 0
    ? growth / previous.supply * 100 : null;

  const chartPoints = latest ? history.filter((point) => point.date <= latest.date && point.date >= latest.date - 365 * 86400000) : [];
  const min = chartPoints.length ? Math.min(...chartPoints.map((point) => point.supply)) : 0;
  const max = chartPoints.length ? Math.max(...chartPoints.map((point) => point.supply)) : 0;
  const span = max - min || 1;
  const firstDate = chartPoints[0]?.date ?? 0;
  const dateSpan = (latest?.date ?? 0) - firstDate || 1;
  const coordinates = chartPoints.map((point) => {
    const x = 48 + (point.date - firstDate) / dateSpan * 704;
    const y = 210 - (point.supply - min) / span * 165;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand-lockup" href="/" aria-label="Grain Bin home">
            <span className="brand-emblem"><WheatMark size={30}/></span>
            <span className="brand-name">Grain Bin</span>
          </Link>
          <span className="header-caption">A field journal of digital dollars.</span>
          <span className="header-edition">SHELTERBELT <span className="header-separator">/</span> EXPERIMENT 001</span>
        </div>
      </header>

      <main className="dashboard">
        <div className="eyebrow"><span className="eyebrow-line"/> FIELD NOTES <span className="eyebrow-index">NO. 001 / STABLECOINS</span></div>
        <div className="intro">
          <div>
            <h1>Notes on a<br/><em>New Kind of Money.</em></h1>
            <p className="intro-description">A running study of stablecoins: how many dollars are out there, where they gather, and how the landscape is changing.</p>
          </div>
          <div className="intro-stamp"><WheatMark size={38}/><span>AN ONGOING<br/>FIELD STUDY</span></div>
        </div>

        <section className="overview-grid" aria-label="Market overview">
          <div className="hero-stat">
            <div className="section-kicker">01 <span/> USD-PEGGED CIRCULATING VALUE</div>
            <p className="hero-value tabular">{total !== null ? money(total) : 'Unavailable'}</p>
            <p className="stat-caption">USD-equivalent circulating value of USD-pegged stablecoins</p>
            <div className="hero-footer"><span className="source-dot"/> Source: DefiLlama <span className="footer-spacer"/> {snapshotDate !== null ? `As of ${new Date(snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} UTC · Checked hourly` : 'Snapshot unavailable · Checked hourly'}</div>
          </div>
          <div className="growth-stat">
            <div className="section-kicker">02 <span/> SINCE LAST MONTH</div>
            {growth !== null && growthPct !== null ? <>
              <p className="growth-value tabular">{growth >= 0 ? "+" : "−"}{money(Math.abs(growth))}</p>
              <p className="growth-percent tabular">{growthPct >= 0 ? "+" : ""}{growthPct.toFixed(2)}% <span>over 30 days</span></p>
            </> : <p className="empty-data">Historical data unavailable</p>}
            <p className="growth-note">Same dated USD supply series, compared with 30 days earlier.</p>
          </div>
        </section>

        <section className="peg-overview" aria-labelledby="peg-overview-heading">
          <div className="peg-overview-heading">
            <div><p className="card-overline">THE WIDER LANDSCAPE</p><h2 id="peg-overview-heading">What are stablecoins pegged to?</h2></div>
            <span>SHARE OF CIRCULATING SUPPLY · USD EQUIVALENT</span>
          </div>
          {allPegTotal > 0 ? <>
            <div className="peg-overview-bar" role="img" aria-label={pegGroups.map((group) => `${group.name}: ${group.present ? percent(group.value, allPegTotal) + " percent" : "not reported"}`).join(", ")}>
              {pegGroups.filter((group) => group.present && group.value > 0).map((group) => <div key={group.name} title={`${group.name}: ${percent(group.value, allPegTotal)}% · ${money(group.value)}`} style={{ flexGrow: group.value, flexBasis: 0, background: group.color }} />)}
            </div>
            <div className="peg-overview-legend" aria-label="Explore circulating supply by peg">
              {pegGroups.map((group) => <div className="peg-overview-item" key={group.name}>
                <button type="button" className="peg-overview-label" aria-label={group.present ? `${group.name}: ${percent(group.value, allPegTotal)} percent, ${money(group.value)} circulating` : `${group.name}: not reported by source`}>
                  <i style={{background:group.color}}/>{group.name}
                  <span className="peg-overview-tooltip" role="tooltip"><strong>{group.present ? `${percent(group.value, allPegTotal)}%` : "Not reported"}</strong><span>{group.present ? `${money(group.value)} circulating` : "Not included in this dataset"}</span></span>
                </button>
              </div>)}
            </div>
          </> : <p className="empty-data">Peg composition data unavailable.</p>}
          <p className="peg-overview-note">Includes USD, EUR and other non-commodity, non-crypto peg types tracked by DefiLlama. Values use DefiLlama’s latest USD-equivalent historical snapshot; absent peg types are marked not reported. This is not a breakdown of reserve assets.</p>
        </section>

        <section className="market-section" aria-label="Data methodology">
          <div className="section-kicker">DATA NOTES <span/> HOW WE COUNT</div>
          <p className="stat-caption">The headline, monthly change, and historical chart use DefiLlama&apos;s public historical USD-valued circulating supply for USD-pegged stablecoins. This is not necessarily the same measure as DefiLlama&apos;s website market cap, which may use different coverage, methodology, or reporting times.</p>
          <p className="stat-caption">Market-share figures below use the current individual-asset supply dataset and its own total as the denominator, rather than mixing current token data with a dated historical aggregate. {sourceDifferencePct !== null ? `The current token sum differs from the historical aggregate by ${sourceDifferencePct.toFixed(2)}%.` : "Comparison with the historical aggregate is unavailable."}</p>
        </section>

        <section className="market-section" aria-labelledby="history-heading">
          <div className="section-heading">
            <div><div className="section-kicker">03 <span/> THE LONG VIEW</div><h2 id="history-heading">The Shape of Things</h2></div>
            <span className="section-meta">USD-PEGGED / 1 YEAR</span>
          </div>
          <div className="chart-card">
            {chartPoints.length > 1 ? <>
              <div className="chart-topline"><span>Historical circulating supply</span><span className="chart-current tabular">{money(latest!.supply)} <small>latest snapshot</small></span></div>
              <svg viewBox="0 0 800 245" role="img" aria-label="Line chart showing the last year of USD-pegged stablecoin supply" className="supply-chart">
                {[45,100,155,210].map((y) => <line key={y} x1="48" x2="752" y1={y} y2={y} stroke="#E4DCCC" strokeWidth="1"/>)}
                <polygon points={`48,210 ${coordinates} 752,210`} fill="#C58A42" opacity="0.10"/>
                <polyline points={coordinates} fill="none" stroke="#A36B2C" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
                <text x="48" y="29" fill="#60685D" fontSize="15">{money(max)}</text>
                <text x="48" y="234" fill="#60685D" fontSize="15">{money(min)}</text>
              </svg>
              <div className="chart-dates"><span>{shortDate(firstDate)}</span><span>{shortDate(latest!.date)}</span></div>
            </> : <p className="empty-data">Not enough historical data to chart.</p>}
          </div>
        </section>

        <section className="market-section" aria-labelledby="composition-heading">
          <div className="section-heading">
            <div><div className="section-kicker">04 <span/> WHO&apos;S WHERE</div><h2 id="composition-heading">Where the Dollars Gather</h2></div>
            <span className="section-meta">SHARE OF CURRENT USD-PEGGED TOKEN SUPPLY</span>
          </div>
          {hasAssetBreakdown ? <div className="composition-grid">
            <div className="composition-card">
              <p className="card-overline">SHARE BY STABLECOIN</p>
              <div className="share-bar" role="img" aria-label={`USDT ${percent(usdt,assetTotal)} percent, USDC ${percent(usdc,assetTotal)} percent, others ${percent(others,assetTotal)} percent`}>
                <div style={{width: `${percent(usdt,assetTotal)}%`,background:"var(--sb-silo)"}}/>
                <div style={{width: `${percent(usdc,assetTotal)}%`,background:"var(--sb-harvest)"}}/>
                <div style={{width: `${percent(others,assetTotal)}%`,background:"var(--sb-sage)"}}/>
              </div>
              <div className="share-list">
                {[
                  {name:"USDT",value:usdt,color:"var(--sb-silo)"},
                  {name:"USDC",value:usdc,color:"var(--sb-harvest)"},
                  {name:"Other USD pegs",value:others,color:"var(--sb-sage)"},
                ].map((coin) => <div className="share-row" key={coin.name}>
                  <span className="share-label"><i style={{background:coin.color}}/>{coin.name}</span>
                  <span className="share-amount tabular">{money(coin.value)}</span>
                  <strong className="tabular">{percent(coin.value,assetTotal)}%</strong>
                </div>)}
              </div>
            </div>
            <div className="concentration-card">
              <p className="card-overline">THE BIG TWO</p>
              <p className="concentration-value tabular">{percent(usdt + usdc,assetTotal)}<span>%</span></p>
              <p className="concentration-description">Combined market share of USDT and USDC.</p>
              <div className="concentration-rule"/>
              <p className="concentration-footnote">Together, these two tokens account for this share of the USD-pegged supply tracked here.</p>
            </div>
          </div> : <div className="composition-card"><p className="card-overline">RECONCILIATION PENDING</p><p className="empty-data">Token-level concentration temporarily unavailable.</p><p className="stat-caption">Individual asset supply data is unavailable.</p></div>}
        </section>

        <section className="market-section field-note" aria-labelledby="field-note-heading">
          <div className="section-kicker">05 <span/> NOTES FROM THE FIELD</div>
          <h2 id="field-note-heading">A question worth keeping.</h2>
          <p>{hasAssetBreakdown ? <>USDT and USDC make up <strong className="tabular">{percent(usdt + usdc, assetTotal)}%</strong> of the USD-pegged individual-asset supply counted here. That&apos;s an observation, not a prediction.</> : "Individual-asset supply data is currently unavailable."}</p>
          <p className="field-note-question">If the market keeps growing, will the smaller stablecoins gain ground, or will the big two grow with it?</p>
          <p className="field-note-aside">For further study: follow changes in market share over time.</p>
        </section>

        <footer className="site-footer shelterbelt-footer">
          <div className="footer-identity">
            <a className="footer-wordmark" href="https://shelterbelt.xyz/" aria-label="Shelterbelt home"><WheatMark size={28}/><span>SHELTERBELT</span></a>
            <p className="footer-coordinates">48.11° N <span aria-hidden="true">·</span> 98.87° W</p>
            <nav className="footer-socials" aria-label="Social links">
          <a href="https://www.linkedin.com/in/thomas-pflipsen/" aria-label="Thomas Pflipsen on LinkedIn" title="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96C2 21.32 2.69 22 3.55 22h16.9c.86 0 1.55-.68 1.55-1.52V3.52C22 2.68 21.31 2 20.45 2ZM7.93 18.75H4.96V9.2h2.97v9.55ZM6.44 7.9a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12.31 10.85h-2.96V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.49V9.2h2.84v1.3h.04c.4-.75 1.36-1.55 2.8-1.55 3 0 3.58 1.98 3.58 4.55v5.25Z"/></svg></a>
          <a href="https://github.com/Pflipto" aria-label="Pflipto on GitHub" title="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.63 0c2.15-1.45 3.1-1.15 3.1-1.15.61 1.55.23 2.69.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.03.76 2.08v3.11c0 .3.2.65.77.54A11.25 11.25 0 0 0 12 .75Z"/></svg></a>
        </nav>
          </div>
          <div className="footer-story">
            <p className="footer-about">Grain Bin is a Shelterbelt field study of the stablecoin market. A place to follow the numbers, understand what’s changing, and make a little more sense of a new kind of money.</p>
            <nav className="footer-links" aria-label="Project and data links">
              <a href="https://github.com/Pflipto/grain-bin" target="_blank" rel="noopener noreferrer">Source code <svg className="footer-external" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8"/></svg></a>
              <a href="https://defillama.com/stablecoins" target="_blank" rel="noopener noreferrer">Data: DefiLlama <svg className="footer-external" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8"/></svg></a>
            </nav>
            <p className="footer-fineprint">For observation and learning, not investment advice.</p>
          </div>
        </footer>
      </main>
      <FieldGuide />
    </div>
  );
}
