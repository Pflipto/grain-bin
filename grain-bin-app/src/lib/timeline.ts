import type {HistoryPoint} from "./calc";
export type MarketEvent={id:string;date:string;label:string;sourceUrl?:string;summary?:string;datePrecision?:"day"|"month";importance?:number;markerNumber?:number};
const DAY=86400000;
export function eventTimestamp(event:MarketEvent):number|null {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(event.date)||!event.id.trim()||!event.label.trim())return null;
  const date=Date.parse(`${event.date}T00:00:00Z`);
  if(!Number.isFinite(date)||new Date(date).toISOString().slice(0,10)!==event.date)return null;
  if(event.sourceUrl!==undefined)try {const source=new URL(event.sourceUrl);if(source.protocol!=="https:"||source.username||source.password)return null;}catch{return null;}
  return date;
}
export function eventsInWindow(events:MarketEvent[],start:number,end:number) {
  const unique=new Map<string,MarketEvent|null>();
  for(const event of events) {
    const date=eventTimestamp(event);
    if(date===null||date<start||date>end)continue;
    if(unique.has(event.id)&&JSON.stringify(unique.get(event.id))!==JSON.stringify(event))unique.set(event.id,null);
    else if(!unique.has(event.id))unique.set(event.id,event);
  }
  return [...unique.values()].filter((event):event is MarketEvent=>event!==null).sort((a,b)=>eventTimestamp(a)!-eventTimestamp(b)!||a.id.localeCompare(b.id));
}
export function buildTimeline(history:HistoryPoint[],range:"all"|"year") {
  const sorted=history.filter(p=>Number.isFinite(p.date)&&p.date>0&&Number.isFinite(p.supply)&&p.supply>0).toSorted((a,b)=>a.date-b.date);
  const end=sorted.at(-1)?.date;
  const observed=end===undefined?[]:sorted.filter(p=>range==="all"||p.date>=end-365*DAY);
  const high=observed.reduce<HistoryPoint|null>((best,p)=>!best||p.supply>=best.supply?p:best,null);
  const low=observed.reduce<HistoryPoint|null>((best,p)=>!best||p.supply<=best.supply?p:best,null);
  const points:{date:number;supply:number|null}[]=[];
  observed.forEach((p,index)=>{
    const previous=observed[index-1];
    if(previous&&p.date-previous.date>DAY)points.push({date:previous.date+DAY,supply:null});
    points.push({...p});
  });
  return {points,high,low,start:observed[0]?.date??null,end:end??null};
}
