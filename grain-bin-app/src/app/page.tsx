
type Stablecoin = {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  circulating?: {
    peggedUSD?: number;
  };
};

type StablecoinResponse = {
  peggedAssets: Stablecoin[];
};

async function getStablecoins(): Promise<Stablecoin[]> {
  const response = await fetch(
    "https://stablecoins.llama.fi/stablecoins?includePrices=true",
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch stablecoin data");
  }

  const data: StablecoinResponse = await response.json();
  return data.peggedAssets;
}

export default async function Home() {
  const stablecoins = await getStablecoins();

  const usdStablecoins = stablecoins.filter(
    (coin) => coin.pegType === "peggedUSD"
  );

  const totalSupply = usdStablecoins.reduce(
    (sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0),
    0
  );

  
  // Calculate circulating supply for each major stablecoin
  const usdtSupply = usdStablecoins
    .filter((coin) => coin.symbol === "USDT")
    .reduce(
      (sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0),
      0
    );

  const usdcSupply = usdStablecoins
    .filter((coin) => coin.symbol === "USDC")
    .reduce(
      (sum, coin) => sum + (coin.circulating?.peggedUSD ?? 0),
      0
    );

  // Everything outside USDT and USDC
  const otherSupply = totalSupply - usdtSupply - usdcSupply;

  // Calculate percentages of total market supply
  const marketShare = (supply: number) =>
    totalSupply > 0
      ? ((supply / totalSupply) * 100).toFixed(1)
      : "0.0";

  const topTwoConcentration =
    totalSupply > 0
      ? (((usdtSupply + usdcSupply) / totalSupply) * 100).toFixed(1)
      : "0.0";

  const formattedSupply = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(totalSupply);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-sm text-amber-400">
          SHELTERBELT / EXPERIMENT 001
        </p>

        <h1 className="mb-2 text-4xl font-bold">
          🌾 Grain Bin
        </h1>

        <p className="mb-12 text-slate-400">
          Exploring the stablecoin ecosystem.
        </p>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8">
          <p className="mb-3 text-sm text-slate-400">
            TOTAL USD STABLECOIN SUPPLY
          </p>

          <h2 className="text-5xl font-semibold">
            {formattedSupply}
          </h2>

          <p className="mt-4 text-sm text-slate-500">
            Source: DefiLlama · Updated hourly
          </p>
        </div>
        
<div className="mt-6 grid gap-4 md:grid-cols-3">
  {[
    { name: "USDT", supply: usdtSupply },
    { name: "USDC", supply: usdcSupply },
    { name: "Others", supply: otherSupply },
  ].map((coin) => (
    <div
      key={coin.name}
      className="rounded-xl border border-slate-800 bg-slate-900 p-6"
    >
      <p className="text-sm text-slate-400">{coin.name}</p>
      <h3 className="mt-3 text-3xl font-semibold">
        {marketShare(coin.supply)}%
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        ${(coin.supply / 1e9).toFixed(2)}B circulating
      </p>
    </div>
  ))}
</div>

<div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
  <p className="text-sm text-slate-400">
    TOP TWO MARKET CONCENTRATION
  </p>
  <h3 className="mt-3 text-3xl font-semibold text-amber-400">
    {topTwoConcentration}%
  </h3>
  <p className="mt-2 text-sm text-slate-500">
    Combined market share of USDT and USDC
  </p>
</div>

      </div>
    </main>
  );
}