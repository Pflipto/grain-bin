import type { Stablecoin } from "./stablecoins";
import { validAmount } from "./calc.ts";

export const CHAIN_DIFFERENCE_THRESHOLD = 0.01;
export type ChainRow = {name:string; value:number; change:number|null; changePct:number|null; missing:number};

export function buildChains(assets:Stablecoin[]) {
  const byId=new Map<string,Stablecoin|null>();
  let excludedCoins=0,duplicateRecords=0;
  for(const coin of assets) {
    if(!coin || typeof coin!=="object" || coin.pegType!=="peggedUSD")continue;
    if(typeof coin.id!=="string" || typeof coin.symbol!=="string") { excludedCoins++;continue; }
    if(byId.has(coin.id)) {
      duplicateRecords++;
      if(JSON.stringify(byId.get(coin.id))!==JSON.stringify(coin))byId.set(coin.id,null);
    } else byId.set(coin.id,coin);
  }
  const coins=[...byId.values()].filter((coin):coin is Stablecoin=>{
    if(!coin)excludedCoins++;
    return coin!==null;
  });
  const sums=new Map<string,{value:number; change:number; previous:number; comparable:number; missing:number}>();
  let missingCoins=0, invalidAmounts=0, mismatches=0, unavailableComparisons=0;
  const distributions: {symbol:string; chains:{name:string;value:number;share:number}[]; partial:boolean; mismatch:boolean; ambiguous:boolean}[]=[];
  for(const coin of coins) {
    const records=coin.chainCirculating;
    const entries=records && typeof records==="object" ? Object.entries(records):[];
    if(!entries.length) { missingCoins++; continue; }
    const available:{name:string;value:number}[]=[];
    let invalid=0;
    for(const [name,record] of entries) {
      const current=record?.current?.peggedUSD, previous=record?.circulatingPrevMonth?.peggedUSD;
      if(!validAmount(current)) { invalid++; invalidAmounts++; continue; }
      available.push({name,value:current});
      const sum=sums.get(name)??{value:0,change:0,previous:0,comparable:0,missing:0};
      sum.value+=current;
      if(validAmount(previous)) { sum.change+=current-previous; sum.previous+=previous; sum.comparable++; }
      else sum.missing++;
      sums.set(name,sum);
    }
    const chainSum=available.reduce((s,c)=>s+c.value,0);
    const supply=coin.circulating?.peggedUSD;
    const mismatch=validAmount(supply) ? supply>0 ? Math.abs(chainSum-supply)/supply>CHAIN_DIFFERENCE_THRESHOLD : chainSum!==supply : false;
    if(!validAmount(supply))unavailableComparisons++;
    if(mismatch)mismatches++;
    if(coin.symbol==="USDT"||coin.symbol==="USDC") distributions.push({symbol:coin.symbol,
      chains:chainSum>0?available.sort((a,b)=>b.value-a.value).slice(0,3).map(c=>({...c,share:c.value/chainSum*100})):[],
      partial:invalid>0,mismatch,ambiguous:false});
  }
  const rows:ChainRow[]=[...sums].map(([name,s])=>({name,value:s.value,change:s.comparable?s.change:null,
    changePct:s.comparable&&s.previous>0?s.change/s.previous*100:null,missing:s.missing})).sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
  const total=rows.length?rows.reduce((s,r)=>s+r.value,0):null;
  const rest=rows.slice(8);
  const other={name:"Other chains",value:rest.reduce((s,r)=>s+r.value,0),count:rest.length};
  const leaders=["USDT","USDC"].map(symbol=>{
    const candidates=coins.filter(coin=>coin.symbol===symbol);
    const found=distributions.filter(d=>d.symbol===symbol);
    return candidates.length===1&&found.length===1?found[0]:{symbol,chains:[],partial:false,mismatch:false,ambiguous:candidates.length>1};
  });
  return {rows,top:rows.slice(0,8),other,total,leaders,missingCoins,invalidAmounts,mismatches,
    excludedCoins,duplicateRecords,unavailableComparisons};
}
