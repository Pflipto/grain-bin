import type {HistoricalRecord,Stablecoin} from "../lib/stablecoins";
import {getCoinHistory} from "../lib/stablecoins";
import {buildShareHistory,resolveShareIds} from "../lib/share-history";
import {fullDate} from "../lib/format";
import ShareHistoryChart from "./ShareHistoryChart";

export default async function ShareHistory({assets,totalHistory,now}:{assets:Stablecoin[];totalHistory:HistoricalRecord[];now:number}) {
  if(!totalHistory.length)return <p className="empty-data">Aggregate share history is unavailable. Current token shares remain independent.</p>;
  const ids=resolveShareIds(assets);
  if(!ids.usdt||!ids.usdc)return <p className="empty-data">Share history is unavailable: USDT and USDC could not be resolved to unique coin ids.</p>;
  const [a,b]=await Promise.allSettled([getCoinHistory(ids.usdt),getCoinHistory(ids.usdc)]);
  if(a.status!=="fulfilled"||b.status!=="fulfilled")return <p className="empty-data">Per-coin history could not be retrieved. Current token shares remain available.</p>;
  const m=buildShareHistory(totalHistory,a.value,b.value);
  if(m.reason)return <p className="empty-data">{m.reason}</p>;
  const caption=`USDT and USDC held ${m.firstShare!.toFixed(1)}% of historical USD-valued supply on ${fullDate(m.start!)} and ${m.lastShare!.toFixed(1)}% on ${fullDate(m.end!)}: ${m.changePoints!>0?"+":m.changePoints!<0?"−":""}${Math.abs(m.changePoints!).toFixed(2)} percentage points.`;
  return <>
    <p className="card-overline">SHARE OVER TIME · 12 MONTHS</p>
    <p className="data-note">{fullDate(m.start!)} – {fullDate(m.end!)} UTC · Source: DefiLlama{now-m.end!>2*86400000?" · Stale snapshot":""}</p>
    <ShareHistoryChart points={m.points} description={caption}/>
    <p className="computed-caption">{caption}</p>
    <p className="data-note">{m.omitted} dates omitted or invalid; gaps are not connected. All three series share the historical denominator. This top-two-share measure is not a complete measure of issuer concentration and may differ from the current token-level figure alongside it.</p>
  </>;
}
