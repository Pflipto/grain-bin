import Link from "next/link";
import { cacheLife } from "next/cache";
import FieldGuide from "./FieldGuide";
import Momentum from "./Momentum";
import Movers from "./Movers";
import { getDashboardSnapshot } from "../lib/stablecoins";
import { calculateDashboard, buildMovers } from "../lib/calc";
import { money, percent, fullDate } from "../lib/format";

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
  "use cache";
  // Evaluate snapshot freshness when this hourly server view is regenerated.
  // Explicit caching also permits the clock read during Next.js prerendering.
  cacheLife({stale:300,revalidate:3600,expire:7200});
  const {coins:coinsResult, history:historyResult, generatedAt:now} = await getDashboardSnapshot();
  const assets = coinsResult.status === "fulfilled" ? coinsResult.value.coins : [];
  const rawHistory = historyResult.status === "fulfilled" ? historyResult.value : [];
  const usdAssets = assets.filter(coin => coin && coin.pegType === "peggedUSD");
  const movers = buildMovers(assets);
  const {
    assetTotal, usdt, usdc, others, hasAssetBreakdown,
    sourceDifferencePct, pegGroups, allPegTotal, snapshotDate,
  } = calculateDashboard(usdAssets, rawHistory);

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
        <div className="journal-intro">
          <div className="journal-heading"><span className="eyebrow-line" aria-hidden="true"/><h1>FIELD NOTES: A NEW KIND OF MONEY</h1></div>
          <div className="journal-edition">
            <p className="eyebrow-index">NO. 001 / STABLECOINS</p>
            <div className="journal-stamp"><WheatMark size={28}/><span>AN ONGOING<br/>FIELD STUDY</span></div>
          </div>
        </div>

        <Momentum records={rawHistory} failed={historyResult.status === "rejected"} now={now}/>
        <Movers assets={assets} failed={coinsResult.status === "rejected"}/>

        <section className="market-section" aria-labelledby="composition-heading">
          <div className="section-heading">
            <div><div className="section-kicker">03 <span/> WHO&apos;S WHERE</div><h2 id="composition-heading">Where the Dollars Gather</h2></div>
            <span className="section-meta">SHARE OF CURRENT USD-PEGGED TOKEN SUPPLY</span>
          </div>
          {movers.excluded > 0 && <p className="data-note">{movers.excluded} coins are excluded; shares describe available values only.</p>}
          {hasAssetBreakdown ? <div className="composition-grid">
            <div className="composition-card">
              <p className="card-overline">SHARE BY STABLECOIN</p>
              <div className="share-bar" role="img" aria-label={`USDT ${percent(usdt!,assetTotal)} percent, USDC ${percent(usdc!,assetTotal)} percent, others ${percent(others!,assetTotal)} percent`}>
                <div style={{width: `${percent(usdt!,assetTotal)}%`,background:"var(--sb-harvest)"}}/>
                <div style={{width: `${percent(usdc!,assetTotal)}%`,background:"var(--sb-sage)"}}/>
                <div style={{width: `${percent(others!,assetTotal)}%`,background:"var(--sb-oxblood)"}}/>
              </div>
              <div className="share-list">
                {[
                  {name:"USDT",value:usdt!,color:"var(--sb-harvest)"},
                  {name:"USDC",value:usdc!,color:"var(--sb-sage)"},
                  {name:"Other USD pegs",value:others!,color:"var(--sb-oxblood)"},
                ].map((coin) => <div className="share-row" key={coin.name}>
                  <span className="share-label"><i style={{background:coin.color}}/>{coin.name}</span>
                  <span className="share-amount tabular">{money(coin.value)}</span>
                  <strong className="tabular">{percent(coin.value,assetTotal)}%</strong>
                </div>)}
              </div>
            </div>
            <div className="concentration-card">
              <p className="card-overline">THE BIG TWO</p>
              <p className="concentration-value tabular">{percent(usdt! + usdc!,assetTotal)}<span>%</span></p>
              <p className="concentration-description">Combined market share of USDT and USDC.</p>
              <div className="concentration-rule"/>
              <p className="concentration-footnote">Together, these two tokens account for this share of the USD-pegged supply tracked here.</p>
            </div>
          </div> : <div className="composition-card"><p className="card-overline">RECONCILIATION PENDING</p><p className="empty-data">Token-level concentration temporarily unavailable.</p><p className="stat-caption">Individual asset supply data is unavailable.</p></div>}
        </section>

        <section className="market-section data-methodology" aria-label="Data methodology">
          <div className="section-kicker">DATA NOTES <span/> HOW WE COUNT</div>
          <p className="data-note">The headline, changes, and chart use DefiLlama’s historical USD-valued series. The coin table and shares use the available token-level dataset and its own denominator. These are different measures. {sourceDifferencePct !== null ? `The available token sum differs from the historical aggregate by ${sourceDifferencePct.toFixed(2)}%.` : "A comparison with the historical aggregate is unavailable."}</p>
          <p className="data-note">In the inspected provider implementation, token-month changes value current and previous balances at the current conversion price; historical USD totals use historical prices. The provider-month baseline is on or before each coin’s latest observation minus 30 days, within a further 36-hour search window. Actual observation times and the deployed provider revision are not exposed. We do not assign the reconciliation gap a verified cause.</p>
          <p className="data-note">{allPegTotal > 0 ? <>Among reported non-commodity, non-crypto peg types, {pegGroups.map(group => `${group.name}: ${group.present ? `${percent(group.value, allPegTotal)}%` : "not reported"}`).join("; ")} of USD-equivalent circulating value{snapshotDate !== null ? ` (${fullDate(snapshotDate)} UTC)` : ""}.</> : "Peg composition is unavailable."} Source: DefiLlama. Peg types do not describe reserve assets.</p>
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
