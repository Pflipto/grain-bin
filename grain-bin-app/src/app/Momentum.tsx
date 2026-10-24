import { buildMomentum } from "../lib/calc";
import type { HistoricalRecord } from "../lib/stablecoins";
import { direction, fullDate, money, signedMoney, signedPercent } from "../lib/format";

export default function Momentum({records,failed,now}:{records:HistoricalRecord[];failed:boolean;now:number}) {
  const m=buildMomentum(records,now), monthly=m.periods[1].change;
  const windowLabel=m.fullYear?"12-month":"available-history";
  const caption=m.latest && monthly && m.high ?
    `Circulating value is ${monthly.amount===0?"unchanged":`${monthly.amount>0?"up":"down"} ${Math.abs(monthly.percent).toFixed(2)}%`} over 30 days and ${m.distanceFromHigh===0?`at its ${windowLabel} high`:`${Math.abs(m.distanceFromHigh!).toFixed(2)}% below its ${windowLabel} high`} (${fullDate(m.high.date)}).` :
    "A comparable 30-day change is not available.";
  return <section aria-labelledby="momentum-heading" className="momentum-section">
    <div className="hero-stat">
      <h2 className="section-kicker" id="momentum-heading">01 <span/> IS THE MARKET GROWING?</h2>
      <p className="hero-value tabular">{m.latest?money(m.latest.supply):"Unavailable"}</p>
      <p className="stat-caption">USD-equivalent circulating value of USD-pegged stablecoins</p>
      <div className="hero-footer">Source: DefiLlama · {failed?"History could not be retrieved.":m.snapshotDate!==null?`Snapshot: ${fullDate(m.snapshotDate)} UTC${m.stale?" · Stale snapshot":""}`:"Snapshot unavailable"} · Checked hourly</div>
      <dl className="momentum-strip tabular">
        {m.periods.map(({label,change})=><div key={label}>
          <dt>{label}</dt>
          <dd className={change && change.amount<0?"decline":""}>{change?<><span>{direction(change.amount)} {signedMoney(change.amount)}</span><small>{signedPercent(change.percent)}</small></>:"n/a"}</dd>
        </div>)}
      </dl>
      <p className="computed-caption">Derived: {caption}</p>
      {m.latest && m.high && m.low && <dl className="range-metrics tabular">
        <div><dt>Distance from {windowLabel} high</dt><dd>{m.distanceFromHigh===0?"At the high":signedPercent(m.distanceFromHigh!)}<small>{fullDate(m.high.date)}</small></dd></div>
        <div><dt>Position in {windowLabel} range</dt><dd>{m.rangePosition!==null?`${m.rangePosition.toFixed(1)}%`:"n/a — flat range"}<small>Low {fullDate(m.low.date)} · High {fullDate(m.high.date)}</small></dd></div>
      </dl>}
      <p className="data-note">Changes compare dated USD-valued snapshots; they are not necessarily token issuance or redemptions. Baselines more than 48 hours before the target are unavailable. {m.stale?"This snapshot was over 48 hours old when the page was generated.":""}</p>
    </div>
    <div className="section-heading momentum-chart-heading">
      <div><p className="section-kicker">THE LONG VIEW</p><h3>The Shape of Things</h3></div>
      <span className="section-meta">{m.fullYear?"USD-PEGGED / 1 YEAR":"USD-PEGGED / AVAILABLE HISTORY"}</span>
    </div>
    <div className="chart-card">
      {m.chartPoints.length>1 && m.high && m.low ? <>
        <p className="chart-topline">{fullDate(m.chartPoints[0].date)} – {fullDate(m.latest!.date)} UTC · Source: DefiLlama</p>
        <svg viewBox="0 0 800 245" role="img" aria-label={`${caption} Chart from ${fullDate(m.chartPoints[0].date)} to ${fullDate(m.latest!.date)}. Gaps are left unconnected.`} className="supply-chart">
          {[45,100,155,210].map(y=><line key={y} x1="48" x2="752" y1={y} y2={y} stroke="var(--sb-line)"/>)}
          {m.segments.map((points,i)=><g key={i}>
            <polyline points={points} fill="none" stroke="var(--sb-silo)" strokeWidth="5" strokeLinejoin="round"/>
            <polyline points={points} fill="none" stroke="var(--sb-harvest)" strokeWidth="3" strokeLinejoin="round"/>
          </g>)}
          {[{point:m.high,label:"High"},{point:m.low,label:"Low"}].map(({point,label})=>{
            const p=m.plot(point);
            return <g key={label}><circle cx={p.x} cy={p.y} r="5" fill="var(--sb-silo)"/><text x={p.x} y={label==="High"?p.y-15:p.y+24} textAnchor={p.x>600?"end":p.x<200?"start":"middle"} fill="var(--sb-silo)" fontSize="14">{label} {money(point.supply)} · {fullDate(point.date)}</text></g>;
          })}
        </svg>
        <p className="data-note chart-extrema tabular"><span>High {money(m.high.supply)} · {fullDate(m.high.date)}</span><span>Low {money(m.low.supply)} · {fullDate(m.low.date)}</span></p>
        <details className="data-disclosure"><summary>View the data</summary>
          <div className="table-scroll" role="region" aria-label="Historical circulating value data" tabIndex={0}>
            <table className="market-table"><caption>Historical USD-pegged circulating value · DefiLlama · UTC</caption><thead><tr><th scope="col">Date</th><th scope="col">USD value</th></tr></thead>
              <tbody>{m.chartPoints.map(p=><tr key={p.date}><th scope="row">{fullDate(p.date)}</th><td>{new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(p.supply)}</td></tr>)}</tbody>
            </table>
          </div>
        </details>
      </>:<p className="empty-data">{failed?"Historical data could not be retrieved.":"Not enough valid historical data to chart."}</p>}
    </div>
  </section>;
}
