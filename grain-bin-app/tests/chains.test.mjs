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

test('dominant coin uses each chain amount rather than global token size',()=>{
 const m=buildChains([coin('1','USDT',1000,{A:chain(20,10),B:chain(90,80)}),coin('2','USDC',100,{A:chain(80,70),B:chain(10,5)})]);
 assert.deepEqual(m.rows.find(r=>r.name==='A').dominant,{symbols:['USDC'],share:80});
 assert.deepEqual(m.rows.find(r=>r.name==='B').dominant,{symbols:['USDT'],share:90});
});
test('dominant coin excludes invalid and conflicting records, retains ties, and leaves zero chains unavailable',()=>{
 const m=buildChains([coin('1','USDT',100,{A:chain(50,10),Z:chain(0,0)}),coin('2','USDC',100,{A:chain(50,10)}),coin('3','BAD',100,{A:chain(null,10)}),coin('4','CONFLICT',100,{A:chain(100,10)}),coin('4','CONFLICT',200,{A:chain(200,10)})]);
 assert.deepEqual(m.rows.find(r=>r.name==='A').dominant,{symbols:['USDC','USDT'],share:50});
 assert.equal(m.rows.find(r=>r.name==='Z').dominant,null);
});
