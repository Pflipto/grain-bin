import type {Stablecoin} from "./stablecoins";
import {buildMovers} from "./calc.ts";

/** The one observed provider typo; never infer classifications for other labels. */
export const CLASSIFICATION_ALIASES:Readonly<Record<string,string>>={"crytpo-backed":"crypto-backed"};
export function buildClassifications(assets:Stablecoin[]) {
  const source=buildMovers(assets);
  const groups=new Map<string,{label:string;value:number;count:number;coins:{id:string;symbol:string;value:number}[]}>();
  let corrected=0;
  for(const row of source.rows) {
    const raw=row.coin.pegMechanism;
    const label=typeof raw==="string"&&raw.trim()?(Object.hasOwn(CLASSIFICATION_ALIASES,raw)?CLASSIFICATION_ALIASES[raw]:raw):"Not classified";
    if(typeof raw==="string"&&Object.hasOwn(CLASSIFICATION_ALIASES,raw))corrected++;
    const group=groups.get(label)??{label,value:0,count:0,coins:[]};
    group.value+=row.supply;group.count++;
    group.coins.push({id:row.coin.id,symbol:row.coin.symbol,value:row.supply});
    groups.set(label,group);
  }
  const total=source.total.supply;
  return {total,excluded:source.excluded,corrected,duplicates:source.duplicateRecords,
    groups:[...groups.values()].sort((a,b)=>b.value-a.value||a.label.localeCompare(b.label)).map(g=>({...g,
      share:total!==null&&total>0?g.value/total*100:null,coins:g.coins.sort((a,b)=>b.value-a.value||a.id.localeCompare(b.id)).slice(0,3)}))};
}
