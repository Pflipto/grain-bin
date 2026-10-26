import type {Stablecoin} from "../lib/stablecoins";
import {buildClassifications} from "../lib/classifications";
import {money} from "../lib/format";
import "./Classifications.css";

export default function Classifications({assets}:{assets:Stablecoin[]}) {
  const m=buildClassifications(assets);
  return <section className="market-section" aria-labelledby="classifications-heading">
    <div className="section-heading"><div><p className="section-kicker">PROVIDER CLASSIFICATIONS</p><h2 id="classifications-heading">How are these coins classified?</h2></div></div>
    {m.groups.length?<details className="classification-disclosure"><summary>Explore mechanism classifications</summary>
      <div className="table-scroll" role="region" aria-label="Provider mechanism classifications" tabIndex={0}>
        <table className="market-table classification-table"><caption>Available USD-pegged coin values grouped by provider label · Source: DefiLlama</caption>
          <thead><tr><th scope="col">Provider label</th><th scope="col">Reported USD value</th><th scope="col">Share</th><th scope="col">Largest three coins</th></tr></thead>
          <tbody>{m.groups.map(g=><tr key={g.label}><th scope="row">{g.label}<small>{g.count} coins</small></th><td>{money(g.value)}</td><td>{g.share!==null?`${g.share.toFixed(1)}%`:"n/a"}</td><td><ol className="classification-coins">{g.coins.map(c=><li key={c.id}>{c.symbol} · {money(c.value)}</li>)}</ol></td></tr>)}</tbody>
          <tfoot><tr><th scope="row">Available total</th><td>{m.total!==null?money(m.total):"n/a"}</td><td>{m.total!==null&&m.total>0?"100.0%":"n/a"}</td><td>Not applicable</td></tr></tfoot>
        </table>
      </div>

    </details>:<p className="empty-data">Classification data is unavailable. Missing values are not treated as zero or assigned a mechanism.</p>}
  </section>;
}
