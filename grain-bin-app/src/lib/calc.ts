import type { Stablecoin, HistoricalRecord } from "./stablecoins";

export type HistoryPoint = { date: number; supply: number };

export function normalizeHistory(rawHistory: HistoricalRecord[]): HistoryPoint[] {
  return rawHistory.map((record) => ({
    date: Number(record.date) * 1000,
    supply: record.totalCirculatingUSD?.peggedUSD,
  })).filter((record): record is HistoryPoint =>
    Number.isFinite(record.date) && typeof record.supply === "number" &&
    Number.isFinite(record.supply) && record.supply > 0
  ).sort((a, b) => a.date - b.date);
}

// Extracted dashboard calculations. Preserve current behavior during PR 1;
// missing token amounts, residual clamping, and unbounded baseline lookups
// are legacy limitations to correct explicitly with the PR 2 views.
export function calculateDashboard(usdAssets: Stablecoin[], rawHistory: HistoricalRecord[]) {
  const history = normalizeHistory(rawHistory);
  const assetTotal = usdAssets.reduce((sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0), 0);
  const supplyFor = (symbol: string) => usdAssets.filter((coin) => coin.symbol === symbol)
    .reduce((sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0), 0);
  const usdt = supplyFor("USDT");
  const usdc = supplyFor("USDC");

  // Historical snapshots contain USD-converted totals keyed by peg type.
  // Do not infer zero when a peg type is absent from the source.
  const snapshot = [...rawHistory].sort((a, b) => Number(b.date) - Number(a.date))
    .find((point) => point.totalCirculatingUSD && Object.keys(point.totalCirculatingUSD).length > 0);
  const pegTotals = snapshot?.totalCirculatingUSD ?? {};
  const total = typeof pegTotals.peggedUSD === 'number' && pegTotals.peggedUSD > 0 ? pegTotals.peggedUSD : null;
  const snapshotDate = snapshot ? Number(snapshot.date) * 1000 : null;
  const hasAssetBreakdown = assetTotal > 0 && Number.isFinite(assetTotal);
  const others = hasAssetBreakdown ? Math.max(0, assetTotal - usdt - usdc) : 0;
  const sourceDifferencePct = total !== null && hasAssetBreakdown ? Math.abs(assetTotal - total) / total * 100 : null;
  const pegGroups = [
    { name: "USD", value: 0, color: "var(--sb-silo)", present: false },
    { name: "EUR", value: 0, color: "var(--sb-harvest)", present: false },
    { name: "Other", value: 0, color: "var(--sb-oxblood)", present: false },
  ];
  for (const [type, amount] of Object.entries(pegTotals)) {
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) continue;
    const peg = type.toLowerCase();
    if (/gold|xau|btc|bitcoin/.test(peg)) continue;
    const index = peg === "peggedusd" ? 0 : peg === "peggedeur" ? 1 : 2;
    pegGroups[index].value += amount;
    pegGroups[index].present = true;
  }
  const allPegTotal = pegGroups.reduce((sum, group) => sum + group.value, 0);
  const latest = snapshotDate !== null ? history.find(point => point.date === snapshotDate) : undefined;
  const thirtyDaysAgo = latest ? latest.date - 30 * 86400000 : 0;
  const previous = history.filter((point) => point.date <= thirtyDaysAgo).at(-1);
  const growth = total !== null && latest && previous ? total - previous.supply : null;
  const growthPct = growth !== null && previous && previous.supply > 0
    ? growth / previous.supply * 100 : null;

  const chartPoints = latest ? history.filter((point) => point.date <= latest.date && point.date >= latest.date - 365 * 86400000) : [];
  const min = chartPoints.length ? Math.min(...chartPoints.map((point) => point.supply)) : 0;
  const max = chartPoints.length ? Math.max(...chartPoints.map((point) => point.supply)) : 0;
  const span = max - min || 1;
  const firstDate = chartPoints[0]?.date ?? 0;
  const dateSpan = (latest?.date ?? 0) - firstDate || 1;
  const coordinates = chartPoints.map((point) => {
    const x = 48 + (point.date - firstDate) / dateSpan * 704;
    const y = 210 - (point.supply - min) / span * 165;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return { assetTotal, usdt, usdc, total, snapshotDate, hasAssetBreakdown, others, sourceDifferencePct, pegGroups, allPegTotal, latest, growth, growthPct, chartPoints, min, max, firstDate, coordinates };
}
