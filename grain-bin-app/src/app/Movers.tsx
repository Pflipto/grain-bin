import type { Stablecoin } from "../lib/stablecoins";
import { buildMovers, pegStatus, OFF_PEG_THRESHOLD_PCT } from "../lib/calc";
import { direction, money, percent, signedMoney, signedPercent, utcTime } from "../lib/format";

type Aggregate = ReturnType<typeof buildMovers>["total"];
function ChangeCells({amount,pct}:{amount:number|null;pct:number|null}) {
  return <><td className={amount!==null&&amount<0?"decline":""}>{amount!==null?<>{direction(amount)}<br/>{signedMoney(amount)}</>:"n/a"}</td><td className={pct!==null&&pct<0?"decline":""}>{pct!==null?signedPercent(pct):"n/a"}</td></>;
}
function AggregateRow({label,group,total,extraMissing=0}:{label:string;group:Aggregate;total:number|null;extraMissing?:number}) {
  const missing=group.missing+extraMissing;
  return <tr className="aggregate-row"><th scope="row">{label}<small>{group.count} coins{missing>0?` · Partial change; ${missing} unavailable`:""}</small></th>
    <td>{group.supply!==null?money(group.supply):"n/a"}</td><td>{group.supply!==null&&total!==null&&total>0?`${percent(group.supply,total)}%`:"n/a"}</td>
    <ChangeCells amount={group.change} pct={group.changePct}/><td>Not applicable</td><td>Not applicable</td></tr>;
}
export default function Movers({assets,failed,responseDate,historicalChange}:{assets:Stablecoin[];failed:boolean;responseDate:number|null;historicalChange:number|null}) {
  const m=buildMovers(assets), tokenChange=m.total.change;
  return <section className="market-section" aria-labelledby="movers-heading">
    <div className="section-heading"><div><p className="section-kicker">02 <span/> CHANGES AMONG THE LARGEST COINS</p><h2 id="movers-heading">Who’s changing?</h2></div></div>
    <p className="data-note">Source: DefiLlama · {responseDate!==null?`API response dated ${utcTime(responseDate)}`:"API response date unavailable"}. Coin and price observation times are not provided.</p>
    <p className="stat-caption">Top 10 by reported circulating value, not by size of change. Shares use the available token-level total. Scroll the table horizontally on smaller screens.</p>
    {!failed && m.rows.length>0?<>
      <div className="table-scroll" role="region" aria-label="Largest stablecoins and provider-month changes" tabIndex={0}>
        <table className="market-table movers-table"><caption>USD-pegged coins · provider-month changes and available price quotes</caption>
          <thead><tr><th scope="col">Coin</th><th scope="col">Reported<br/>USD value</th><th scope="col">Share</th><th scope="col">Provider-month<br/>change ($)</th><th scope="col">Change (%)</th><th scope="col">Price</th><th scope="col">vs $1</th></tr></thead>
          <tbody>{m.top.map(r=><tr key={r.coin.id}><th scope="row">{r.coin.symbol}<small>{r.coin.name}</small></th><td>{money(r.supply)}</td><td>{m.total.supply!==null&&m.total.supply>0?`${percent(r.supply,m.total.supply)}%`:"n/a"}</td>
            <ChangeCells amount={r.change} pct={r.changePct}/><td>{r.price!==null?new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:4,maximumFractionDigits:6}).format(r.price):"No price"}</td>
            <td className={pegStatus(r.deviation)==="Off peg"?"decline":""}>{pegStatus(r.deviation)}{r.deviation!==null&&<small>{signedPercent(r.deviation)}</small>}</td></tr>)}
            <AggregateRow label="All other coins" group={m.other} total={m.total.supply}/>
            <AggregateRow label={m.excluded?"Available total (partial)":"Total"} group={m.total} total={m.total.supply} extraMissing={m.excluded}/>
          </tbody>
        </table>
      </div>
      <p className="computed-caption">Derived: Available token-level provider-month changes sum to {tokenChange!==null?signedMoney(tokenChange):"n/a"}. The historical 30-day USD-valued series changed {historicalChange!==null?signedMoney(historicalChange):"n/a"}. {tokenChange!==null&&historicalChange!==null?`These measures differ by ${money(Math.abs(tokenChange-historicalChange))}; valuation, timing, and coverage may differ (see Data notes).`:"A comparison between the measures is unavailable."}</p>
      <p className="data-note">{m.total.missing+m.excluded} coins have no comparable current/previous-month pair; their changes are excluded. {m.excluded} coins lack valid current values or identity and are excluded from ranking and shares. {m.missingPrices} included coins have no price quote. {m.duplicateRecords} duplicate source records were collapsed or excluded if conflicting. Aggregate percentage changes use comparable baselines, never a sum of percentages.</p>
    </>:<p className="empty-data">{failed?"Coin data could not be retrieved. Historical metrics remain available independently.":"No valid USD-pegged coin values are available."}</p>}
    <p className="data-note">Provider-month baselines are defined by DefiLlama and may not be exactly 30 days. Available price quotes only; past depegs are not shown. “Off peg” means a quote is more than {OFF_PEG_THRESHOLD_PCT}% from $1, not a verified live incident.</p>
  </section>;
}
