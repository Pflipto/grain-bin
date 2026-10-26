import{test}from'node:test';import assert from'node:assert/strict';
import{buildTimeline,eventTimestamp,eventsInWindow}from'../src/lib/timeline.ts';
const day=86400000;
const event=(id,date,sourceUrl='https://example.com/primary')=>({id,date,sourceUrl,label:'Synthetic test event'});
test('timeline starts at observed history, not an invented launch date, and preserves gaps',()=>{
 const input=[{date:Date.UTC(2017,10,29),supply:100},{date:Date.UTC(2026,9,24),supply:200}];
 const all=buildTimeline(input,'all');assert.equal(all.start,input[0].date);assert.equal(all.points.length,3);assert.equal(all.points[1].supply,null);
 const recent=buildTimeline(input,'year');assert.equal(recent.start,input[1].date);assert.equal(input.length,2);
});
test('event source/date validation allows owner annotations without sources but rejects unsafe URLs and invalid dates',()=>{
 assert.equal(eventTimestamp(event('a','2025-07-18',undefined)),Date.UTC(2025,6,18));
 assert.equal(eventTimestamp({...event('a','2025-07-18'),sourceUrl:undefined}),Date.UTC(2025,6,18));
 assert.equal(eventTimestamp(event('a','2025-07-18','')),null);
 assert.equal(eventTimestamp(event('a','2025-07-18','javascript:alert(1)')),null);
 assert.equal(eventTimestamp(event('a','2025-02-31')),null);
 assert.equal(eventTimestamp(event('a','2025-07-18')),Date.UTC(2025,6,18));
});
test('events are ordered, limited to actual coverage, deduplicated, and conflicts excluded',()=>{
 const start=Date.UTC(2017,0,1),end=Date.UTC(2026,0,1);
 const a=event('a','2020-01-01'),b=event('b','2021-01-01');
 assert.deepEqual(eventsInWindow([b,a,a,event('old','2014-10-06')],start,end),[a,b]);
 assert.deepEqual(eventsInWindow([a,{...a,label:'conflict'}],start,end),[]);
 assert.deepEqual(eventsInWindow([event('future','2027-01-18')],start,end),[]);
});
test('one-year range uses dated observations and computes its own extrema',()=>{
 const m=buildTimeline([{date:day,supply:1},{date:1000*day,supply:50},{date:1300*day,supply:40}], 'year');
 assert.equal(m.low.supply,40);assert.equal(m.high.supply,50);assert.equal(m.start,1000*day);
});

test('owner dataset excludes scheduled and external supply records and normalizes approximate months',async()=>{
 const {marketEvents}=await import('../src/data/market-events.ts');
 assert.ok(marketEvents.length>0);
 for(const e of marketEvents){assert.notEqual(eventTimestamp(e),null);if(e.datePrecision==='month')assert.ok(e.date.endsWith('-01'));}
 assert.ok(!marketEvents.some(e=>['genius-effective-2027','supply-record-2026'].includes(e.id)));
});
