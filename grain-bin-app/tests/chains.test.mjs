import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildChains} from '../src/lib/chains.ts';
const coin=(id,symbol,current,chains)=>({id,name:symbol,symbol,pegType:'peggedUSD',circulating:{peggedUSD:current},chainCirculating:chains});
const chain=(current,previous)=>({current:{peggedUSD:current},circulatingPrevMonth:{peggedUSD:previous}});
test('chain shares use chain sums and missing baselines remain partial',()=>{
 const m=buildChains([coin('1','USDT',100,{A:chain(60,50),B:chain(40,null)}),coin('2','USDC',50,{A:chain(50,25)})]);
 assert.equal(m.total,150);assert.equal(m.top[0].value,110);assert.equal(m.top[0].change,35);assert.equal(m.top[1].change,null);
 assert.equal(m.leaders[0].chains[0].share,60);assert.equal(m.mismatches,0);
});
test('missing and invalid values are excluded, zero denominator is not a share',()=>{
 const m=buildChains([coin('1','USDT',100,{A:chain(50,0),B:chain(null,10)}),coin('2','USDC',20,null)]);
 assert.equal(m.total,50);assert.equal(m.invalidAmounts,1);assert.equal(m.missingCoins,1);assert.equal(m.mismatches,1);
 assert.equal(m.top[0].change,50);assert.equal(m.top[0].changePct,null);assert.equal(m.leaders[0].chains[0].share,100);
 assert.equal(buildChains([]).total,null);
});
test('top eight plus other reconcile and ambiguous symbols are not merged',()=>{
 const chains=Object.fromEntries(Array.from({length:10},(_,i)=>['C'+i,chain(i+1,i)]));
 const m=buildChains([coin('1','USDT',55,chains),coin('3','USDT',1,{A:chain(1,1)})]);
 assert.equal(m.top.length,8);assert.equal(m.top.reduce((s,r)=>s+r.value,0)+m.other.value,m.total);assert.equal(m.leaders[0].ambiguous,true);
});

test('valid chain values survive a missing token-level total',()=>{
 const m=buildChains([coin('1','USDT',null,{A:chain(20,10)})]);
 assert.equal(m.total,20);assert.equal(m.unavailableComparisons,1);assert.equal(m.leaders[0].chains[0].share,100);
});
