import {test} from 'node:test';import assert from 'node:assert/strict';
import {buildClassifications} from '../src/lib/classifications.ts';
const coin=(id,value,label)=>({id,name:id,symbol:id,pegType:'peggedUSD',circulating:{peggedUSD:value},pegMechanism:label});
test('classification totals reconcile; only the documented typo is aliased',()=>{
 const assets=[coin('a',40,'fiat-backed'),coin('b',20,'crypto-backed'),coin('c',10,'crytpo-backed'),coin('d',5,'experimental')];
 const m=buildClassifications(assets);
 assert.equal(m.total,75);assert.equal(m.corrected,1);assert.equal(m.groups.find(g=>g.label==='crypto-backed').value,30);
 assert.ok(m.groups.some(g=>g.label==='experimental'));assert.equal(assets[2].pegMechanism,'crytpo-backed');
 assert.equal(m.groups.reduce((s,g)=>s+g.value,0),m.total);assert.ok(Math.abs(m.groups.reduce((s,g)=>s+g.share,0)-100)<1e-10);
});
test('missing labels stay unclassified and missing amounts never become zero',()=>{
 const m=buildClassifications([coin('a',10,null),coin('b',20,''),coin('c',null,'fiat-backed')]);
 assert.equal(m.excluded,1);assert.equal(m.groups.length,1);assert.equal(m.groups[0].label,'Not classified');assert.equal(m.total,30);
 assert.equal(buildClassifications([]).total,null);assert.equal(buildClassifications([coin('a',0,null)]).groups[0].share,null);
});
test('top three membership is by id/value and duplicate conflicts do not inflate totals',()=>{
 const a=coin('a',10,'fiat-backed');
 const m=buildClassifications([a,{...a},coin('b',30,'fiat-backed'),coin('c',20,'fiat-backed'),coin('d',5,'fiat-backed')]);
 assert.equal(m.groups[0].coins.length,3);assert.equal(m.groups[0].coins[0].id,'b');assert.equal(m.total,65);
 const conflict=buildClassifications([a,coin('a',500,'fiat-backed')]);assert.equal(conflict.total,null);
});

test('unknown labels cannot resolve inherited object properties as aliases',()=>{
 const m=buildClassifications([coin('a',10,'constructor')]);assert.equal(m.groups[0].label,'constructor');assert.equal(m.corrected,0);
});
