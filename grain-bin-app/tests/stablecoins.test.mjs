import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getCoinList, getTotalHistory, getCoinHistory } from '../src/lib/stablecoins.ts';
import { normalizeHistory, calculateDashboard } from '../src/lib/calc.ts';
import { money, percent, shortDate } from '../src/lib/format.ts';

const fixture = name => JSON.parse(readFileSync(new URL(`../src/lib/__fixtures__/${name}.json`, import.meta.url)));
const coins = fixture('coins-top-five').peggedAssets;
const rawHistory = fixture('total-history-60');
const day = 86400000;
const record = (days, amount) => ({date: String(days * 86400), totalCirculatingUSD: {peggedUSD: amount}});

test('captured history uses USD-valued amounts, converts seconds, and retains its full window', () => {
  const history = normalizeHistory(rawHistory);
  assert.equal(history.length, 60);
  assert.equal(history.at(-1).date, Number(rawHistory.at(-1).date) * 1000);
  assert.equal(history.at(-1).supply, rawHistory.at(-1).totalCirculatingUSD.peggedUSD);
  assert.notEqual(history.at(-1).supply, rawHistory.at(-1).totalCirculating.peggedUSD);
});

test('history rejects absent, null, non-finite and non-positive amounts and sorts without mutating input', () => {
  const input = [record(3, 30), record(2, null), record(1, 10), record(4, NaN), record(5, Infinity), record(6, -1), record(7, 0), {date:'bad',totalCirculatingUSD:{peggedUSD:10}}, {date: 8 * 86400}];
  const copy = structuredClone(input);
  assert.deepEqual(normalizeHistory(input), [{date:day,supply:10},{date:3*day,supply:30}]);
  assert.deepEqual(input, copy);
});

test('historical headline and monthly change do not use the token-list denominator', () => {
  const model = calculateDashboard(coins, rawHistory);
  const last = rawHistory.at(-1);
  const baseline = rawHistory.find(r => Number(r.date) === Number(last.date) - 30*86400);
  assert.equal(model.total, last.totalCirculatingUSD.peggedUSD);
  assert.equal(model.growth, model.total - baseline.totalCirculatingUSD.peggedUSD);
  assert.equal(model.growthPct, model.growth / baseline.totalCirculatingUSD.peggedUSD * 100);
  assert.equal(model.assetTotal, coins.reduce((sum,c) => sum + c.circulating.peggedUSD, 0));
  assert.notEqual(model.total, model.assetTotal); // Fixture coins are deliberately a partial universe.
});

test('monthly lookup selects the last observation on/before the target and does not use a later point', () => {
  const m = calculateDashboard([], [record(1,100),record(9,120),record(11,150),record(40,200)]);
  assert.equal(m.growth,80);
  assert.equal(m.growthPct,80/120*100);
  assert.equal(calculateDashboard([], [record(20,100),record(40,200)]).growth,null);
});

test('a latest snapshot without USD does not borrow an older USD headline', () => {
  const m = calculateDashboard([], [record(1,100),{date: String(2*86400),totalCirculatingUSD:{peggedEUR:10}}]);
  assert.equal(m.total,null);
  assert.equal(m.snapshotDate,2*day);
  assert.equal(m.growth,null);
  assert.equal(m.latest,undefined);
});

test('peg grouping excludes commodity/crypto pegs and distinguishes absent from reported zero', () => {
  const m = calculateDashboard([], [{date:'86400',totalCirculatingUSD:{peggedUSD:100,peggedEUR:0,peggedJPY:5,peggedGOLD:900,peggedBTC:800,peggedBAD:NaN}}]);
  assert.deepEqual(m.pegGroups.map(({name,value,present})=>({name,value,present})),[
    {name:'USD',value:100,present:true},{name:'EUR',value:0,present:true},{name:'Other',value:5,present:true}
  ]);
  assert.equal(m.allPegTotal,105);
  assert.equal(calculateDashboard([], [record(1,100)]).pegGroups[1].present,false);
});

test('empty data produces existing unavailable states and no chart coordinates', () => {
  const m = calculateDashboard([], []);
  assert.equal(m.total,null);
  assert.equal(m.snapshotDate,null);
  assert.equal(m.hasAssetBreakdown,false);
  assert.equal(m.growth,null);
  assert.equal(m.sourceDifferencePct,null);
  assert.equal(m.coordinates,'');
});

test('chart window excludes older points; flat values produce finite existing geometry', () => {
  const m = calculateDashboard([], [record(1,5),record(35,10),record(400,10)]);
  assert.deepEqual(m.chartPoints.map(p=>p.date),[35*day,400*day]);
  assert.equal(m.coordinates,'48.0,210.0 752.0,210.0');
  assert.equal(m.min,10);
  assert.equal(m.max,10);
});

test('captured edge cases retain missing month, zero month, null price and raw classification typo', () => {
  const edge = fixture('coins-edge-cases').peggedAssets;
  assert.ok(edge.some(c=>c.circulatingPrevMonth?.peggedUSD == null));
  assert.ok(edge.some(c=>c.circulatingPrevMonth?.peggedUSD === 0));
  assert.ok(edge.some(c=>c.price === null));
  assert.ok(edge.some(c=>c.pegMechanism === 'crytpo-backed'));
});

test('formatters preserve compact money, share precision, and UTC month boundaries', () => {
  assert.equal(money(1234567890),'$1.23B');
  assert.equal(percent(1,3),'33.3');
  assert.equal(shortDate(Date.parse('2026-10-01T00:00:00Z')),'Oct 2026');
});

test('fetch wrappers preserve raw values, use one-hour caching and encode coin ids', async t => {
  const calls=[];
  t.mock.method(globalThis,'fetch',async (url,options)=>{
    calls.push({url,options});
    return Response.json(url.includes('/stablecoins?') ? {peggedAssets:coins} : rawHistory);
  });
  assert.deepEqual(await getCoinList(),coins);
  assert.deepEqual(await getTotalHistory(),rawHistory);
  assert.deepEqual(await getCoinHistory('id & other'),rawHistory);
  assert.deepEqual(calls.map(c=>c.url),[
    'https://stablecoins.llama.fi/stablecoins?includePrices=true',
    'https://stablecoins.llama.fi/stablecoincharts/all',
    'https://stablecoins.llama.fi/stablecoincharts/all?stablecoin=id%20%26%20other'
  ]);
  assert.ok(calls.every(c=>c.options.next.revalidate===3600));
});

test('fetch failures and malformed containers reject rather than inventing empty market data', async t => {
  t.mock.method(globalThis,'fetch',async()=>new Response('Unavailable',{status:503}));
  await assert.rejects(getCoinList(),/Could not retrieve/);
  await assert.rejects(getTotalHistory(),/Could not retrieve/);
  await assert.rejects(getCoinHistory('1'),/Could not retrieve/);
  globalThis.fetch=async()=>Response.json({});
  await assert.rejects(getCoinList(),/Invalid stablecoin list/);
  await assert.rejects(getTotalHistory(),/Invalid stablecoin history/);
  globalThis.fetch=async()=>new Response('not json');
  await assert.rejects(getTotalHistory(),SyntaxError);
  await assert.rejects(getCoinHistory(' '),/id is required/);
});

test('momentum rejects distant baselines, uses UTC year-to-date and a full-year baseline', async () => {
  const {buildMomentum,changeOver,DAY}=await import('../src/lib/calc.ts');
  const latest={date:Date.UTC(2026,9,22),supply:200};
  assert.equal(changeOver([{date:latest.date-34*DAY,supply:100},latest],latest,30),null);
  assert.equal(changeOver([{date:latest.date-32*DAY,supply:100},latest],latest,30).amount,100);
  const data=[{date:Date.UTC(2025,11,31)/1000,totalCirculatingUSD:{peggedUSD:125}},
    {date:(latest.date-365*DAY)/1000,totalCirculatingUSD:{peggedUSD:100}},
    {date:latest.date/1000,totalCirculatingUSD:{peggedUSD:200}}];
  const m=buildMomentum(data,latest.date);
  assert.equal(m.periods[3].change.amount,75);
  assert.equal(m.periods[4].change.amount,100);
  assert.equal(m.fullYear,true);
});

test('flat ranges, tied extrema, stale snapshots and gaps are represented explicitly', async()=>{
  const {buildMomentum,DAY}=await import('../src/lib/calc.ts');
  const m=buildMomentum([record(1,100),record(2,100),record(5,100)],8*DAY);
  assert.equal(m.high.date,5*DAY);
  assert.equal(m.low.date,5*DAY);
  assert.equal(m.rangePosition,null);
  assert.equal(m.distanceFromHigh,0);
  assert.equal(m.fullYear,false);
  assert.equal(m.stale,true);
  assert.equal(m.segments.length,2);
});

test('conflicting duplicate snapshots cannot produce a current headline', async()=>{
  const {buildMomentum}=await import('../src/lib/calc.ts');
  assert.equal(normalizeHistory([record(1,100),record(1,100)]).length,1);
  const m=buildMomentum([record(1,100),record(2,110),record(2,120)],3*day);
  assert.equal(m.latest,undefined);
  assert.equal(m.snapshotDate,2*day);
  assert.equal(normalizeHistory([record(1,100),record(1,null)]).length,0);
});

const coin=(id,current,previous,price=1)=>({id:String(id),name:`Coin ${id}`,symbol:`C${id}`,pegType:'peggedUSD',circulating:{peggedUSD:current},circulatingPrevMonth:{peggedUSD:previous},price});
test('largest-coins ranking, remainder and total reconcile without multiplying price twice', async()=>{
  const {buildMovers}=await import('../src/lib/calc.ts');
  const input=Array.from({length:12},(_,i)=>coin(i,i+1,i,0.9));
  const m=buildMovers(input);
  assert.equal(m.top.length,10);
  assert.equal(m.top[0].supply,12);
  assert.equal(m.other.count,2);
  assert.equal(m.other.supply,3);
  assert.equal(m.total.supply,78);
  assert.equal(m.total.change,12);
  assert.equal(m.total.changePct,12/66*100);
  assert.equal(m.top.reduce((s,r)=>s+r.supply,0)+m.other.supply,m.total.supply);
});

test('missing baselines are partial, zero baselines retain dollar changes and missing current is excluded', async()=>{
  const {buildMovers}=await import('../src/lib/calc.ts');
  const m=buildMovers([coin(1,20,10),coin(2,10,null),coin(3,null,10),coin(4,5,0,null)]);
  assert.equal(m.excluded,1);
  assert.equal(m.total.supply,35);
  assert.equal(m.total.change,15);
  assert.equal(m.total.changePct,150);
  assert.equal(m.total.missing,1);
  assert.equal(m.rows.find(r=>r.coin.id==='4').changePct,null);
  assert.equal(m.rows.find(r=>r.coin.id==='4').deviation,null);
  assert.equal(m.missingPrices,1);
  const noBaseline=buildMovers([coin(1,10,null)]);
  assert.equal(noBaseline.total.change,null);
  assert.equal(buildMovers([]).total.supply,null);
});

test('finite and nonnegative validation prevents fabricated zero amounts and prices', async()=>{
  const {buildMovers}=await import('../src/lib/calc.ts');
  const m=buildMovers([coin(1,NaN,1),coin(2,-1,1),coin(3,Infinity,1),coin(4,10,Infinity,NaN)]);
  assert.equal(m.excluded,3);
  assert.equal(m.total.change,null);
  assert.equal(m.rows[0].price,null);
  assert.equal(percent(1,0),'n/a');
  assert.equal(percent(NaN,100),'n/a');
});

test('approved quote threshold is inclusive at 0.5% and does not label missing quotes', async()=>{
  const {pegStatus,OFF_PEG_THRESHOLD_PCT}=await import('../src/lib/calc.ts');
  assert.equal(OFF_PEG_THRESHOLD_PCT,0.5);
  assert.equal(pegStatus((0.995-1)*100),'Near $1');
  assert.equal(pegStatus((1.005-1)*100),'Near $1');
  assert.equal(pegStatus(-0.51),'Off peg');
  assert.equal(pegStatus(null),'No price');
});

test('snapshot HTTP date is preserved from the cached response, not invented at render time', async t=>{
  const {getCoinSnapshot}=await import('../src/lib/stablecoins.ts');
  t.mock.method(globalThis,'fetch',async()=>Response.json({peggedAssets:coins},{headers:{date:'Thu, 22 Oct 2026 00:00:00 GMT'}}));
  assert.equal((await getCoinSnapshot()).responseDate,Date.UTC(2026,9,22));
  globalThis.fetch=async()=>Response.json({peggedAssets:coins});
  assert.equal((await getCoinSnapshot()).responseDate,null);
});

test('a failed coin request does not discard successful history (and vice versa)', async t=>{
  const {getDashboardSnapshot}=await import('../src/lib/stablecoins.ts');
  t.mock.method(globalThis,'fetch',async url=>url.includes('/stablecoins?')?new Response('failed',{status:503}):Response.json(rawHistory));
  const historical=await getDashboardSnapshot();
  assert.equal(historical.coins.status,'rejected');
  assert.equal(historical.history.status,'fulfilled');
  assert.deepEqual(historical.history.value,rawHistory);
  globalThis.fetch=async url=>url.includes('/stablecoins?')?Response.json({peggedAssets:coins}):new Response('failed',{status:503});
  const token=await getDashboardSnapshot();
  assert.equal(token.coins.status,'fulfilled');
  assert.equal(token.history.status,'rejected');
});


test('identity is keyed by id: duplicate symbols remain distinct while conflicting duplicate ids are excluded', async()=>{
  const {buildMovers}=await import('../src/lib/calc.ts');
  const a=coin(1,10,5), b={...coin(2,20,10),symbol:a.symbol};
  const duplicate=buildMovers([a,{...a},b]);
  assert.equal(duplicate.rows.length,2);
  assert.equal(duplicate.total.supply,30);
  assert.equal(duplicate.duplicateRecords,1);
  const conflict=buildMovers([a,{...a,circulating:{peggedUSD:999}},b]);
  assert.equal(conflict.excluded,1);
  assert.equal(conflict.total.supply,20);
});


test('interactive chart data inserts null gaps without inventing values or changing observations', async()=>{
  const {historicalChartData}=await import('../src/lib/calc.ts');
  const input=[{date:day,supply:100},{date:2*day,supply:110},{date:5*day,supply:120}];
  assert.deepEqual(historicalChartData(input),[
    {date:day,supply:100},{date:2*day,supply:110},{date:3*day,supply:null},{date:5*day,supply:120}
  ]);
  assert.equal(input.length,3);
  assert.deepEqual(historicalChartData([]),[]);
});
