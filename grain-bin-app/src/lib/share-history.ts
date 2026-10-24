import type {HistoricalRecord,Stablecoin} from "./stablecoins";
import {DAY,validAmount} from "./calc.ts";
export type SharePoint={date:number;usdt:number|null;usdc:number|null;others:number|null};

function series(records:HistoricalRecord[],allowZero:boolean) {
  const map=new Map<number,number>(),invalid=new Set<number>();
  for(const r of records) {
    if(!r || typeof r!=="object" || !["string","number"].includes(typeof r.date) || String(r.date).trim()==="")continue;
    const seconds=Number(r.date),value=r.totalCirculatingUSD?.peggedUSD;
    if(!Number.isSafeInteger(seconds)||seconds<=0||seconds%86400!==0||seconds*1000>8640000000000000)continue;
    const date=seconds*1000;
    if(!validAmount(value)||(!allowZero&&value===0)){invalid.add(date);continue;}
    if(map.has(date)&&map.get(date)!==value)invalid.add(date);
    map.set(date,value);
  }
  for(const date of invalid)map.delete(date);
  return map;
}
export function resolveShareIds(assets:Stablecoin[]) {
  const find=(symbol:string)=>{
    const matches=assets.filter(c=>c && c.pegType==="peggedUSD" && c.symbol===symbol && typeof c.id==="string");
    return matches.length===1?matches[0].id:null;
  };
  return {usdt:find("USDT"),usdc:find("USDC")};
}
export function buildShareHistory(totalRecords:HistoricalRecord[],usdtRecords:HistoricalRecord[],usdcRecords:HistoricalRecord[]) {
  const total=series(totalRecords,false),usdt=series(usdtRecords,true),usdc=series(usdcRecords,true);
  const dates=[...total.keys()].sort((a,b)=>a-b),end=dates.at(-1);
  const empty=(reason:string)=>({points:[] as SharePoint[],reason,start:null as number|null,end:null as number|null,firstShare:null as number|null,lastShare:null as number|null,changePoints:null as number|null,omitted:0});
  if(end===undefined)return empty("Aggregate history is unavailable.");
  const joined=new Map<number,{usdt:number;usdc:number;others:number}>();
  for(const date of dates) {
    const a=usdt.get(date),b=usdc.get(date),whole=total.get(date)!;
    if(a===undefined||b===undefined||a+b>whole)continue;
    joined.set(date,{usdt:a/whole*100,usdc:b/whole*100,others:(whole-a-b)/whole*100});
  }
  if(!joined.has(end))return empty("The latest historical snapshot does not align across all three series.");
  const target=end-365*DAY;
  const start=[...joined.keys()].filter(d=>d<=target&&target-d<=2*DAY).at(-1);
  if(start===undefined)return empty("A comparable 12-month historical window is unavailable.");
  const points:SharePoint[]=[];
  let omitted=0;
  for(let date=start;date<=end;date+=DAY) {
    const point=joined.get(date);
    if(!point)omitted++;
    points.push({date,usdt:point?.usdt??null,usdc:point?.usdc??null,others:point?.others??null});
  }
  const first=joined.get(start)!,last=joined.get(end)!,firstShare=first.usdt+first.usdc,lastShare=last.usdt+last.usdc;
  return {points,reason:null,start,end,firstShare,lastShare,changePoints:lastShare-firstShare,omitted};
}
