
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
      </div>
    </main>
  );
}