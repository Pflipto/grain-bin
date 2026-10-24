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

test('legacy monthly lookup selects the last observation on/before the target and does not use a later point', () => {
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
