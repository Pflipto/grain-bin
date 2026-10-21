type Stablecoin = {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  circulating?: { peggedUSD?: number };
};
type StablecoinResponse = { peggedAssets: Stablecoin[] };
type HistoricalRecord = {
  date: string | number;
  totalCirculatingUSD?: { peggedUSD?: number };
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
  return { usdAssets, history };
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
  const { usdAssets, history } = await getMarketData();
  const total = usdAssets.reduce((sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0), 0);
  const supplyFor = (symbol: string) => usdAssets.filter((coin) => coin.symbol === symbol)
    .reduce((sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0), 0);
  const usdt = supplyFor("USDT");
  const usdc = supplyFor("USDC");
  const others = total - usdt - usdc;
  const latest = history.at(-1);
  const thirtyDaysAgo = latest ? latest.date - 30 * 86400000 : 0;
  const previous = history.filter((point) => point.date <= thirtyDaysAgo).at(-1);
  const growth = latest && previous ? latest.supply - previous.supply : null;
  const growthPct = growth !== null && previous && previous.supply > 0
    ? growth / previous.supply * 100 : null;

  const chartPoints = latest ? history.filter((point) => point.date >= latest.date - 365 * 86400000) : [];
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
          <a className="brand-lockup" href="/" aria-label="Grain Bin home">
            <span className="brand-emblem"><WheatMark size={30}/></span>
            <span className="brand-name">Grain Bin</span>
          </a>
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
            <div className="section-kicker">01 <span/> DOLLARS IN CIRCULATION</div>
            <p className="hero-value tabular">{money(total)}</p>
            <p className="stat-caption">Total supply of USD-pegged stablecoins</p>
            <div className="hero-footer"><span className="source-dot"/> Source: DefiLlama <span className="footer-spacer"/> Cached for up to 1 hour</div>
          </div>
          <div className="growth-stat">
            <div className="section-kicker">02 <span/> SINCE LAST MONTH</div>
            {growth !== null && growthPct !== null ? <>
              <p className="growth-value tabular">{growth >= 0 ? "+" : "−"}{money(Math.abs(growth))}</p>
              <p className="growth-percent tabular">{growthPct >= 0 ? "+" : ""}{growthPct.toFixed(2)}% <span>over 30 days</span></p>
            </> : <p className="empty-data">Historical data unavailable</p>}
            <p className="growth-note">Based on historical supply snapshots, not today&apos;s live total.</p>
          </div>
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
            <div><div className="section-kicker">04 <span/> WHO'S WHERE</div><h2 id="composition-heading">Where the Dollars Gather</h2></div>
            <span className="section-meta">SHARE OF USD SUPPLY</span>
          </div>
          <div className="composition-grid">
            <div className="composition-card">
              <p className="card-overline">SHARE BY STABLECOIN</p>
              <div className="share-bar" role="img" aria-label={`USDT ${percent(usdt,total)} percent, USDC ${percent(usdc,total)} percent, others ${percent(others,total)} percent`}>
                <div style={{width: `${percent(usdt,total)}%`,background:"var(--sb-silo)"}}/>
                <div style={{width: `${percent(usdc,total)}%`,background:"var(--sb-harvest)"}}/>
                <div style={{width: `${percent(others,total)}%`,background:"var(--sb-sage)"}}/>
              </div>
              <div className="share-list">
                {[
                  {name:"USDT",value:usdt,color:"var(--sb-silo)"},
                  {name:"USDC",value:usdc,color:"var(--sb-harvest)"},
                  {name:"Other USD pegs",value:others,color:"var(--sb-sage)"},
                ].map((coin) => <div className="share-row" key={coin.name}>
                  <span className="share-label"><i style={{background:coin.color}}/>{coin.name}</span>
                  <span className="share-amount tabular">{money(coin.value)}</span>
                  <strong className="tabular">{percent(coin.value,total)}%</strong>
                </div>)}
              </div>
            </div>
            <div className="concentration-card">
              <p className="card-overline">THE BIG TWO</p>
              <p className="concentration-value tabular">{percent(usdt + usdc,total)}<span>%</span></p>
              <p className="concentration-description">Combined market share of USDT and USDC.</p>
              <div className="concentration-rule"/>
              <p className="concentration-footnote">Together, these two tokens account for this share of the USD-pegged supply tracked here.</p>
            </div>
          </div>
        </section>

        <section className="market-section field-note" aria-labelledby="field-note-heading">
          <div className="section-kicker">05 <span/> NOTES FROM THE FIELD</div>
          <h2 id="field-note-heading">A question worth keeping.</h2>
          <p>USDT and USDC make up <strong className="tabular">{percent(usdt + usdc, total)}%</strong> of the USD-pegged supply counted here. That's an observation, not a prediction.</p>
          <p className="field-note-question">If the market keeps growing, will the smaller stablecoins gain ground, or will the big two grow with it?</p>
          <p className="field-note-aside">For further study: follow changes in market share over time.</p>
        </section>

        <footer className="site-footer"><span><WheatMark size={18}/> GRAIN BIN <span className="footer-divider">/</span> BY SHELTERBELT</span><span>A SHELTERBELT FIELD STUDY.</span></footer>
      </main>
    </div>
  );
}
