import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Coin = {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  circulating?: Record<string, number>;
  circulatingPrevDay?: Record<string, number>;
  price?: number;
};
type Snapshot = {
  date: string | number;
  totalCirculating?: Record<string, number>;
  totalCirculatingUSD?: Record<string, number>;
};

export async function GET() {
  try {
    const [assetResponse, chartResponse] = await Promise.all([
      fetch("https://stablecoins.llama.fi/stablecoins?includePrices=true", { cache: "no-store" }),
      fetch("https://stablecoins.llama.fi/stablecoincharts/all", { cache: "no-store" }),
    ]);
    if (!assetResponse.ok || !chartResponse.ok) {
      return NextResponse.json({ error: "Upstream data unavailable", status: [assetResponse.status, chartResponse.status] }, { status: 502 });
    }
    const assets = (await assetResponse.json()) as { peggedAssets: Coin[] };
    const charts = (await chartResponse.json()) as Snapshot[];
    const latest = charts.filter(p => Number.isFinite(Number(p.date)) && p.totalCirculatingUSD?.peggedUSD != null)
      .sort((a, b) => Number(b.date) - Number(a.date))[0];
    if (!latest) return NextResponse.json({ error: "No USD-pegged aggregate snapshot" }, { status: 502 });
    const usd = assets.peggedAssets.filter(c => c.pegType === "peggedUSD");
    const sum = (f: (c: Coin) => number) => usd.reduce((n, c) => n + f(c), 0);
    const assetSupply = sum(c => c.circulating?.peggedUSD ?? 0);
    const assetMarked = sum(c => (c.circulating?.peggedUSD ?? 0) * (typeof c.price === "number" ? c.price : 1));
    const aggregateUsd = latest.totalCirculatingUSD?.peggedUSD ?? null;
    const aggregateNative = latest.totalCirculating?.peggedUSD ?? null;
    const largest = [...usd].sort((a, b) => (b.circulating?.peggedUSD ?? 0) - (a.circulating?.peggedUSD ?? 0))
      .slice(0, 20).map(c => ({ name: c.name, symbol: c.symbol, supply: c.circulating?.peggedUSD ?? 0, price: c.price ?? null, markedValue: (c.circulating?.peggedUSD ?? 0) * (c.price ?? 1) }));
    const discrepancy = aggregateUsd === null ? null : assetSupply - aggregateUsd;
    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      historicalSnapshotUTC: new Date(Number(latest.date) * 1000).toISOString(),
      usdPegged: {
        aggregateMarketValueUSD: aggregateUsd,
        aggregateNativeSupply: aggregateNative,
        currentIndividualSupply: assetSupply,
        currentIndividualSupplyTimesPrice: assetMarked,
        individualMinusAggregate: discrepancy,
        differencePercent: aggregateUsd ? discrepancy! / aggregateUsd * 100 : null,
        numberOfAssets: usd.length,
        assetsWithoutPrice: usd.filter(c => typeof c.price !== "number").length,
      },
      allPegsInHistoricalSnapshotUSD: latest.totalCirculatingUSD,
      top20UsdAssets: largest,
      note: "Diagnostic only. Current token records and historical aggregate may have different as-of times. This endpoint does not assert equivalence to the website's filtered market-cap total."
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Diagnostic fetch failed" }, { status: 502 });
  }
}
