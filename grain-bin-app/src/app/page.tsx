type Stablecoin = {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  circulating?: { peggedUSD?: number };
};

type StablecoinResponse = { peggedAssets: Stablecoin[] };
type HistoricalRecord = {
  date: string | number;
  totalCirculatingUSD?: { peggedUSD?: number };
};

async function getMarketData() {
  const [assetsResponse, historyResponse] = await Promise.all([
    fetch("https://stablecoins.llama.fi/stablecoins?includePrices=true", {
      next: { revalidate: 3600 },
    }),
    fetch("https://stablecoins.llama.fi/stablecoincharts/all", {
      next: { revalidate: 3600 },
    }),
  ]);

  if (!assetsResponse.ok || !historyResponse.ok) {
    throw new Error("Could not retrieve stablecoin market data");
  }

  const assets: StablecoinResponse = await assetsResponse.json();
  const rawHistory: HistoricalRecord[] = await historyResponse.json();

  // DefiLlama reports values for multiple pegs. We count only USD-pegged assets.
  const usdAssets = assets.peggedAssets.filter(
    (coin) => coin.pegType === "peggedUSD"
  );
  const history = rawHistory
    .map((record) => ({
      date: Number(record.date) * 1000,
      supply: record.totalCirculatingUSD?.peggedUSD,
    }))
    .filter(
      (record): record is { date: number; supply: number } =>
        Number.isFinite(record.date) &&
        typeof record.supply === "number" &&
        Number.isFinite(record.supply) &&
        record.supply > 0
    )
    .sort((a, b) => a.date - b.date);

  return { usdAssets, history };
}

function usd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function percent(part: number, whole: number) {
  return whole > 0 ? (100 * part / whole).toFixed(1) : "0.0";
}

export default async function Home() {
  const { usdAssets, history } = await getMarketData();
  const total = usdAssets.reduce(
    (sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0), 0
  );
  const supplyFor = (symbol: string) =>
    usdAssets.filter((coin) => coin.symbol === symbol).reduce(
      (sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0), 0
    );
  const usdt = supplyFor("USDT");
  const usdc = supplyFor("USDC");
  const others = total - usdt - usdc;

  const latest = history.at(-1);
  const thirtyDaysAgo = latest ? latest.date - 30 * 86400000 : 0;
  // Use the last available historical observation on or before the target day.
  const previous = history.filter((point) => point.date <= thirtyDaysAgo).at(-1);
  const growth = latest && previous ? latest.supply - previous.supply : null;
  const growthPct = growth !== null && previous && previous.supply > 0
    ? growth / previous.supply * 100 : null;

  const chartPoints = latest
    ? history.filter((point) => point.date >= latest.date - 365 * 86400000)
    : [];
  const min = Math.min(...chartPoints.map((point) => point.supply));
  const max = Math.max(...chartPoints.map((point) => point.supply));
  const span = max - min || 1;
  const firstDate = chartPoints[0]?.date ?? 0;
  const dateSpan = (latest?.date ?? 0) - firstDate || 1;
  const line = chartPoints.map((point) => {
    const x = 20 + (point.date - firstDate) / dateSpan * 760;
    const y = 190 - (point.supply - min) / span * 160;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-sm text-amber-400">SHELTERBELT / EXPERIMENT 001</p>
        <h1 className="mb-2 text-4xl font-bold">🌾 Grain Bin</h1>
        <p className="mb-10 text-slate-400">Exploring the stablecoin ecosystem.</p>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-8">
          <p className="mb-3 text-sm text-slate-400">TOTAL USD STABLECOIN SUPPLY</p>
          <h2 className="text-5xl font-semibold">{usd(total)}</h2>
          <p className="mt-4 text-sm text-slate-500">Source: DefiLlama · Data cached for up to one hour</p>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { name: "USDT", supply: usdt },
            { name: "USDC", supply: usdc },
            { name: "Others", supply: others },
          ].map((coin) => (
            <section key={coin.name} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm text-slate-400">{coin.name}</p>
              <h3 className="mt-3 text-3xl font-semibold">{percent(coin.supply, total)}%</h3>
              <p className="mt-2 text-sm text-slate-500">{usd(coin.supply)} circulating</p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">TOP TWO MARKET CONCENTRATION</p>
          <h3 className="mt-3 text-3xl font-semibold text-amber-400">
            {percent(usdt + usdc, total)}%
          </h3>
          <p className="mt-2 text-sm text-slate-500">Combined share of USDT and USDC</p>
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">30-DAY SUPPLY CHANGE</p>
          {growth !== null && growthPct !== null ? (
            <>
              <h3 className="mt-3 text-3xl font-semibold">
                {growth >= 0 ? "+" : "−"}{usd(Math.abs(growth))}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {growthPct >= 0 ? "+" : ""}{growthPct.toFixed(2)}% over 30 days
              </p>
            </>
          ) : (
            <p className="mt-3 text-slate-400">Historical data unavailable</p>
          )}
          <p className="mt-3 text-xs text-slate-500">
            Growth compares historical USD-pegged supply snapshots, not today's live total.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-semibold">Supply over the last year</h3>
          <p className="mt-1 text-sm text-slate-400">Historical USD-pegged circulating supply</p>
          {chartPoints.length > 1 ? (
            <>
              <svg viewBox="0 0 800 220" role="img"
                aria-label="Line chart of historical USD stablecoin supply over the last year"
                className="mt-6 w-full">
                <line x1="20" x2="780" y1="190" y2="190" stroke="#475569" />
                <polyline points={line} fill="none" stroke="#fbbf24"
                  strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                <text x="20" y="18" fill="#94a3b8" fontSize="15">{usd(max)}</text>
                <text x="20" y="211" fill="#94a3b8" fontSize="15">{usd(min)}</text>
              </svg>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{new Date(firstDate).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}</span>
                <span>{new Date(latest!.date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}</span>
              </div>
            </>
          ) : (
            <p className="mt-6 text-slate-400">Not enough historical data to chart.</p>
          )}
        </section>
      </div>
    </main>
  );
}
