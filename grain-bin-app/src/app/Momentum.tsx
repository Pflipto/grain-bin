import HistoricalTimeline from "./HistoricalTimeline";
import { marketEvents } from "../data/market-events";
import { buildMomentum } from "../lib/calc";
import type { HistoricalRecord } from "../lib/stablecoins";
import { fullDate, money, signedMoney, signedPercent } from "../lib/format";

export default function Momentum({records,failed,now}:{records:HistoricalRecord[];failed:boolean;now:number}) {
  const m=buildMomentum(records,now);
  const windowLabel=m.fullYear?"12-month":"available-history";
  return <section aria-labelledby="momentum-heading" className="momentum-section">
    <div className="hero-stat">
      <h2 className="section-kicker" id="momentum-heading">01 <span/> IS THE MARKET GROWING?</h2>
      <div className="momentum-headline">
        <p className="hero-value tabular">{m.latest?money(m.latest.supply):"Unavailable"}</p>
        <p className="stat-caption">CIRCULATING VALUE OF USD-PEGGED STABLECOINS</p>
      </div>
      <dl className="momentum-strip tabular">
        {m.periods.map(({label,change})=><div key={label}>
          <dt>{label}</dt>
          <dd className={change ? change.amount<0?"decline":change.amount>0?"momentum-gain":"" : ""}>{change?<><span>{signedMoney(change.amount)}</span><small>{signedPercent(change.percent)}</small></>:"n/a"}</dd>
        </div>)}
      </dl>
      {m.latest && m.high && m.low && <dl className="range-metrics tabular">
        <div><dt>Distance from {windowLabel} high</dt><dd>{m.distanceFromHigh===0?"At the high":signedPercent(m.distanceFromHigh!)}<small>{fullDate(m.high.date)}</small></dd></div>
        <div><dt>Position in {windowLabel} range</dt><dd>{m.rangePosition!==null?`${m.rangePosition.toFixed(1)}%`:"n/a — flat range"}<small>Low {fullDate(m.low.date)} · High {fullDate(m.high.date)}</small></dd></div>
      </dl>}
      <div className="momentum-provenance">
      <p className="data-note">Changes compare dated USD-valued snapshots; they are not necessarily token issuance or redemptions. Baselines more than 48 hours before the target are unavailable. {m.stale?"This snapshot was over 48 hours old when the page was generated.":""}</p>
      <div className="hero-footer">Source: DefiLlama · {failed?"History could not be retrieved.":m.snapshotDate!==null?`Snapshot: ${fullDate(m.snapshotDate)} UTC${m.stale?" · Stale snapshot":""}`:"Snapshot unavailable"} · Checked hourly</div>
      </div>
    </div>
    <div className="section-heading momentum-chart-heading">
      <div><p className="section-kicker">THE LONG VIEW</p><h3>The Shape of Things</h3></div>
      <span className="section-meta">USD-PEGGED / HISTORICAL VALUE</span>
    </div>
    <div className="chart-card">
      {failed?<p className="empty-data">Historical data could not be retrieved.</p>:<HistoricalTimeline history={m.history} events={marketEvents}/>}
    </div>
  </section>;
}
