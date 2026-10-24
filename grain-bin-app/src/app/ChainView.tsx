import type { Stablecoin } from "../lib/stablecoins";
import { buildChains } from "../lib/chains";
import "./MarketViews.css";
import ChainTable from "./ChainTable";

export default function ChainView({assets}:{assets:Stablecoin[]}) {
  const m=buildChains(assets);
  if(m.total===null || m.total<=0)return <p className="empty-data">Chain coverage is unavailable. Missing amounts are not treated as zero.</p>;
  return <>
    <ChainTable rows={m.top} total={m.total} other={m.other}/>
    <div className="chain-comparison">{m.leaders.map(leader=><div className="chain-leader" key={leader.symbol}>
      <h3>{leader.symbol} · top three chains</h3>
      {leader.chains.length?<ol>{leader.chains.map(chain=><li key={chain.name}><div className="chain-label"><span>{chain.name}</span><span className="tabular">{chain.share.toFixed(1)}%</span></div><div className="chain-track" aria-hidden="true"><span style={{width:`${chain.share}%`}}/></div></li>)}</ol>:<p className="data-note">{leader.ambiguous?"Multiple coin ids share this symbol; a single issuer distribution is unavailable.":"Chain distribution unavailable."}</p>}
      <p className="data-note">Shares use this coin’s available chain sum.{leader.partial?" Chain coverage is partial.":""}{leader.mismatch?" Chain sum differs from the coin total by more than 1%.":""}</p>
    </div>)}</div>
    <p className="data-note">{m.missingCoins} coins have no chain records; {m.invalidAmounts} chain amounts and {m.excludedCoins} coin records were excluded. {m.unavailableComparisons} token-total comparisons are unavailable. {m.mismatches} coin chain sums differ from their token total by more than 1%. {m.duplicateRecords} duplicate records were collapsed or excluded. Shares describe available chain values, not an assumed complete market.</p>
    <p className="data-note">Current and provider-month amounts come from DefiLlama’s coin-list response. Source observation times are unknown. Change percentages use comparable previous amounts; missing pairs are excluded and counted.</p>
  </>;
}
