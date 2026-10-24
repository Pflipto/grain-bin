import HistoricalChart from "./HistoricalChart";
import { buildMomentum, historicalChartData } from "../lib/calc";
import type { HistoricalRecord } from "../lib/stablecoins";
import { fullDate, money, signedMoney, signedPercent } from "../lib/format";

export default function Momentum({records,failed,now}:{records:HistoricalRecord[];failed:boolean;now:number}) {
  const m=buildMomentum(records,now), monthly=m.periods[1].change;
  const windowLabel=m.fullYear?"12-month":"available-history";
  const caption=m.latest && monthly && m.high ?
    `Circulating value is ${monthly.amount===0?"unchanged":`${monthly.amount>0?"up":"down"} ${Math.abs(monthly.percent).toFixed(2)}%`} over 30 days and ${m.distanceFromHigh===0?`at its ${windowLabel} high`:`${Math.abs(m.distanceFromHigh!).toFixed(2)}% below its ${windowLabel} high`} (${fullDate(m.high.date)}).` :
    "A comparable 30-day change is not available.";
  return <section aria-labelledby="momentum-heading" className="momentum-section">
    <div className="hero-stat">
      <h2 className="section-kicker" id="momentum-heading">01 <span/> IS THE MARKET GROWING?</h2>
      <div className="momentum-headline">
        <p className="hero-value tabular">{m.latest?money(m.latest.supply):"Unavailable"}</p>
        <p className="stat-caption">USD-equivalent circulating value of USD-pegged stablecoins</p>
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
      <span className="section-meta">{m.fullYear?"USD-PEGGED / 1 YEAR":"USD-PEGGED / AVAILABLE HISTORY"}</span>
    </div>
    <div className="chart-card">
      {m.chartPoints.length>1 && m.high && m.low ? <>
        <p className="chart-topline">{fullDate(m.chartPoints[0].date)} – {fullDate(m.latest!.date)} UTC · Source: DefiLlama</p>
        <HistoricalChart points={historicalChartData(m.chartPoints)} high={m.high} low={m.low}
          description={`${caption} Historical USD-pegged circulating value. Dates are UTC; missing observations are left as gaps.`}/>
        <p className="data-note chart-extrema tabular"><span>Low {money(m.low.supply)} · {fullDate(m.low.date)}</span><span>High {money(m.high.supply)} · {fullDate(m.high.date)}</span></p>
      </>:<p className="empty-data">{failed?"Historical data could not be retrieved.":"Not enough valid historical data to chart."}</p>}
    </div>
  </section>;
}
