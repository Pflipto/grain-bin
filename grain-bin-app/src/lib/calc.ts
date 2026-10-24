import type { Stablecoin, HistoricalRecord } from "./stablecoins";

export type HistoryPoint = { date: number; supply: number };
export const DAY = 86400000;
export const BASELINE_TOLERANCE = 2 * DAY;
export const validAmount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

function timestamp(date: unknown): number | null {
  if ((typeof date !== "string" && typeof date !== "number") || String(date).trim() === "") return null;
  const seconds = Number(date);
  return Number.isSafeInteger(seconds) && seconds > 0 && seconds * 1000 <= 8640000000000000 ? seconds * 1000 : null;
}

/** Identical dates collapse; conflicting observations are unavailable, never averaged. */
export function normalizeHistory(rawHistory: HistoricalRecord[]): HistoryPoint[] {
  const points = new Map<number, number>();
  const conflicts = new Set<number>();
  for (const record of rawHistory) {
    if (!record || typeof record !== "object") continue;
    const date = timestamp(record.date);
    if (date === null) continue;
    const supply = record.totalCirculatingUSD?.peggedUSD;
    if (!validAmount(supply) || supply === 0) { conflicts.add(date); continue; }
    if (points.has(date) && points.get(date) !== supply) conflicts.add(date);
    points.set(date, supply);
  }
  return [...points].filter(([date]) => !conflicts.has(date))
    .map(([date, supply]) => ({date, supply})).sort((a,b) => a.date-b.date);
}

export type Change = { amount: number; percent: number; baselineDate: number };
export function changeSince(history: HistoryPoint[], latest: HistoryPoint, target: number): Change | null {
  const baseline = history.filter(point => point.date <= target).at(-1);
  if (!baseline || target-baseline.date > BASELINE_TOLERANCE || baseline.supply <= 0) return null;
  return {amount:latest.supply-baseline.supply, percent:(latest.supply-baseline.supply)/baseline.supply*100, baselineDate:baseline.date};
}
export function changeOver(history: HistoryPoint[], latest: HistoryPoint, days: number): Change | null {
  return changeSince(history, latest, latest.date-days*DAY);
}

export function buildMomentum(rawHistory: HistoricalRecord[], now: number) {
  const history = normalizeHistory(rawHistory);
  const dates = rawHistory.filter(r=>r && typeof r === "object").map(r=>timestamp(r.date)).filter((d):d is number=>d!==null);
  const snapshotDate = dates.length ? Math.max(...dates) : null;
  // An invalid newest observation must not silently become an older headline.
  const latest = history.find(point=>point.date===snapshotDate);
  const changes = latest ? [7,30,90].map(days=>changeOver(history,latest,days)) : [null,null,null];
  const yearStart = latest ? Date.UTC(new Date(latest.date).getUTCFullYear()-1,11,31) : 0;
  const periods = [
    ...[7,30,90].map((days,i)=>({label:`${days} days`,change:changes[i]})),
    {label:"Year to date",change:latest ? changeSince(history,latest,yearStart) : null},
    {label:"1 year",change:latest ? changeOver(history,latest,365) : null},
  ];
  const chartPoints = latest ? history.filter(p=>p.date>=latest.date-365*DAY && p.date<=latest.date) : [];
  const extrema = (kind:"high"|"low") => chartPoints.reduce<HistoryPoint|null>((best,p)=>
    !best || (kind==="high" ? p.supply>=best.supply : p.supply<=best.supply) ? p : best,null);
  const high = extrema("high"), low = extrema("low");
  const fullYear = !!latest && !!history.length && history[0].date <= latest.date-365*DAY;
  const distanceFromHigh = latest && high ? (latest.supply/high.supply-1)*100 : null;
  const rangePosition = latest && high && low && high.supply>low.supply ? (latest.supply-low.supply)/(high.supply-low.supply)*100 : null;
  const plot = (point:HistoryPoint) => ({
    x:48+(point.date-(chartPoints[0]?.date??0))/((latest?.date??0)-(chartPoints[0]?.date??0)||1)*704,
    y:210-(point.supply-(low?.supply??0))/((high?.supply??0)-(low?.supply??0)||1)*165,
  });
  const segments: string[] = [];
  let previous: HistoryPoint | undefined;
  for (const point of chartPoints) {
    const p=plot(point), coordinate=`${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    if (!previous || point.date-previous.date>DAY) segments.push(coordinate);
    else segments[segments.length-1]+=` ${coordinate}`;
    previous=point;
  }
  return {history,latest,snapshotDate,periods,chartPoints,high,low,fullYear,distanceFromHigh,rangePosition,plot,segments,
    stale:snapshotDate!==null && now-snapshotDate>2*DAY};
}

export type CoinRow = {coin:Stablecoin; supply:number; change:number|null; changePct:number|null; price:number|null; deviation:number|null};
export function buildMovers(assets: Stablecoin[]) {
  const usd=assets.filter(c=>c && typeof c==="object" && c.pegType==="peggedUSD");
  const rows:CoinRow[]=[];
  let excluded=0, duplicateRecords=0;
  const byId=new Map<string,Stablecoin|null>();
  for(const coin of usd) {
    if(typeof coin.id!=="string") { excluded++; continue; }
    if(byId.has(coin.id)) {
      duplicateRecords++;
      const prior=byId.get(coin.id);
      const signature=(c:Stablecoin)=>JSON.stringify([c.name,c.symbol,c.circulating,c.circulatingPrevMonth,c.price]);
      if(prior && signature(prior)!==signature(coin)) byId.set(coin.id,null);
    } else byId.set(coin.id,coin);
  }
  for(const coin of byId.values()) {
    if(!coin) { excluded++; continue; }
    const current=coin.circulating?.peggedUSD, previous=coin.circulatingPrevMonth?.peggedUSD;
    if(!validAmount(current) || typeof coin.id!=="string" || typeof coin.name!=="string" || typeof coin.symbol!=="string") { excluded++; continue; }
    const price=validAmount(coin.price) ? coin.price : null;
    rows.push({coin,supply:current,change:validAmount(previous)?current-previous:null,
      changePct:validAmount(previous)&&previous>0 ? (current-previous)/previous*100 : null,
      price,deviation:price!==null ? (price-1)*100 : null});
  }
  rows.sort((a,b)=>b.supply-a.supply || a.coin.id.localeCompare(b.coin.id));
  const aggregate=(items:CoinRow[])=>{
    const comparable=items.filter(r=>r.change!==null);
    const supply=items.length?items.reduce((s,r)=>s+r.supply,0):null;
    const change=comparable.length?comparable.reduce((s,r)=>s+r.change!,0):null;
    const previous=comparable.reduce((s,r)=>s+r.supply-r.change!,0);
    return {supply,change,changePct:change!==null&&previous>0?change/previous*100:null,
      missing:items.length-comparable.length,count:items.length};
  };
  const total=aggregate(rows);
  // Zero rows is a verified empty bucket only if the source contained valid rows.
  const rest=rows.slice(10);
  const other=rest.length?aggregate(rest):{supply:rows.length?0:null,change:rows.length?0:null,changePct:null,missing:0,count:0};
  return {rows,top:rows.slice(0,10),other,total,excluded,duplicateRecords,missingPrices:rows.filter(r=>r.price===null).length,
    partial:excluded>0 || total.missing>0};
}

/** Supporting composition/peg note; all sums use explicitly available amounts. */
export function calculateDashboard(usdAssets: Stablecoin[], rawHistory: HistoricalRecord[]) {
  const momentum=buildMomentum(rawHistory,0), movers=buildMovers(usdAssets);
  const assetTotal=movers.total.supply??0;
  const symbolSupply=(symbol:string)=>{
    const matches=usdAssets.filter(c=>c && c.symbol===symbol);
    const available=movers.rows.filter(r=>r.coin.symbol===symbol);
    return matches.length && matches.every(c=>validAmount(c.circulating?.peggedUSD)) && available.length
      ? available.reduce((s,r)=>s+r.supply,0):null;
  };
  const usdt=symbolSupply("USDT"), usdc=symbolSupply("USDC");
  const hasAssetBreakdown=assetTotal>0 && usdt!==null && usdc!==null;
  const others=hasAssetBreakdown ? movers.rows.filter(r=>r.coin.symbol!=="USDT"&&r.coin.symbol!=="USDC").reduce((s,r)=>s+r.supply,0) : null;
  const snapshot=rawHistory.find(r=>r && timestamp(r.date)===momentum.snapshotDate);
  const pegTotals=snapshot?.totalCirculatingUSD??{};
  const pegGroups=[{name:"USD",value:0,color:"var(--sb-harvest)",present:false},{name:"EUR",value:0,color:"var(--sb-sage)",present:false},{name:"Other",value:0,color:"var(--sb-oxblood)",present:false}];
  for(const [type,amount] of Object.entries(pegTotals)) {
    if(!validAmount(amount)||/gold|xau|btc|bitcoin/i.test(type))continue;
    const group=pegGroups[type.toLowerCase()==="peggedusd"?0:type.toLowerCase()==="peggedeur"?1:2];
    group.value+=amount;group.present=true;
  }
  const total=momentum.latest?.supply??null;
  return {assetTotal,usdt,usdc,others,hasAssetBreakdown,pegGroups,allPegTotal:pegGroups.reduce((s,g)=>s+g.value,0),
    total,snapshotDate:momentum.snapshotDate,sourceDifferencePct:total!==null&&assetTotal>0?Math.abs(assetTotal-total)/total*100:null,
    latest:momentum.latest,growth:momentum.periods[1].change?.amount??null,growthPct:momentum.periods[1].change?.percent??null,
    chartPoints:momentum.chartPoints,min:momentum.low?.supply??0,max:momentum.high?.supply??0,
    firstDate:momentum.chartPoints[0]?.date??0,coordinates:momentum.segments.join(" ")};
}

// Owner approved Oct 23, 2026: available quote deviation, not a live incident alert.
export const OFF_PEG_THRESHOLD_PCT = 0.5;
export function pegStatus(deviation:number|null): string {
  if(deviation===null || !Number.isFinite(deviation)) return "No price";
  return Math.abs(deviation)>OFF_PEG_THRESHOLD_PCT+1e-10 ? "Off peg" : "Near $1";
}

/** A null observation breaks the library line across absent days; never fill zero. */
export function historicalChartData(points: HistoryPoint[]): {date:number; supply:number|null}[] {
  const result: {date:number; supply:number|null}[]=[];
  for(const [index,point] of points.entries()) {
    const previous=points[index-1];
    if(previous && point.date-previous.date>DAY) result.push({date:previous.date+DAY,supply:null});
    result.push({date:point.date,supply:point.supply});
  }
  return result;
}
