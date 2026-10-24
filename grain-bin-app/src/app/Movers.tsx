import type { Stablecoin } from "../lib/stablecoins";
import { buildMovers } from "../lib/calc";
import CoinTable from "./CoinTable";

export default function Movers({assets,failed}:{assets:Stablecoin[];failed:boolean}) {
  const m=buildMovers(assets);
  return <section className="market-section" aria-labelledby="movers-heading">
    <div className="section-heading"><div><p className="section-kicker">02 <span/> CHANGES AMONG THE LARGEST COINS</p><h2 id="movers-heading">Who’s changing?</h2></div></div>
    {!failed && m.rows.length>0?<>
      <CoinTable rows={m.top.map(row=>({...row,coin:{id:row.coin.id,name:row.coin.name,symbol:row.coin.symbol}}))} other={m.other} total={m.total} excluded={m.excluded}/>
      <p className="data-note">{m.total.missing+m.excluded} coins have no comparable current/previous-month pair; their changes are excluded. {m.excluded} coins lack valid current values or identity and are excluded from ranking and shares. {m.missingPrices} included coins have no price quote. {m.duplicateRecords} duplicate source records were collapsed or excluded if conflicting. Aggregate percentage changes use comparable baselines, never a sum of percentages.</p>
    </>:<p className="empty-data">{failed?"Coin data could not be retrieved. Historical metrics remain available independently.":"No valid USD-pegged coin values are available."}</p>}
    <p className="data-note">Provider-month baselines are defined by DefiLlama and may not be exactly 30 days. Available price quotes only; past depegs are not shown. The percentage beneath each price is its deviation from $1. Quote observation times are unknown.</p>
  </section>;
}
