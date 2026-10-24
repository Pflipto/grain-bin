import {test} from 'node:test';import assert from 'node:assert/strict';
import {buildShareHistory,resolveShareIds} from '../src/lib/share-history.ts';
const point=(day,value)=>({date:String(day*86400),totalCirculatingUSD:{peggedUSD:value}});
const series=(value)=>Array.from({length:366},(_,i)=>point(i+1,value));
test('twelve-month aligned shares reconcile and percentage points are not percent growth',()=>{
 const a=series(60);a[a.length-1]=point(366,65);
 const m=buildShareHistory(series(100),a,series(20));
 assert.equal(m.reason,null);assert.equal(m.points.length,366);assert.equal(m.firstShare,80);assert.equal(m.lastShare,85);assert.equal(m.changePoints,5);assert.equal(m.points.at(-1).others,15);
});
test('missing dates and negative residuals are null gaps, never zeroed or clamped',()=>{
 const a=series(60);a[100]=point(101,90);
 const b=series(20);b.splice(20,1);
 const m=buildShareHistory(series(100),a,b);
 assert.equal(m.omitted,2);assert.equal(m.points[100].others,null);assert.equal(m.points[20].usdc,null);
});
test('short coverage, conflicting duplicates and unaligned latest observations are unavailable',()=>{
 assert.ok(buildShareHistory(series(100).slice(1),series(60),series(20)).reason);
 const a=series(60);a.push(point(366,61));assert.ok(buildShareHistory(series(100),a,series(20)).reason);
 assert.ok(buildShareHistory(series(100),series(60).slice(0,-1),series(20)).reason);
});
test('real zero coin observations are allowed and ids are never inferred from symbols alone',()=>{
 const m=buildShareHistory(series(100),series(0),series(20));assert.equal(m.firstShare,20);
 const assets=[{id:'a',symbol:'USDT',pegType:'peggedUSD'},{id:'b',symbol:'USDC',pegType:'peggedUSD'}];
 assert.deepEqual(resolveShareIds(assets),{usdt:'a',usdc:'b'});
 assert.equal(resolveShareIds([...assets,{...assets[0],id:'c'}]).usdt,null);
});
