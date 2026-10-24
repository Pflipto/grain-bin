/** Provider-reported USD-valued amounts; null and absent are not zero. */
export type PegAmounts = Record<string, number | null | undefined>;
export type Stablecoin = {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  gecko_id?: string | null;
  priceSource?: string | null;
  pegMechanism?: string | null;
  circulating?: PegAmounts | null;
  circulatingPrevDay?: PegAmounts | null;
  circulatingPrevWeek?: PegAmounts | null;
  circulatingPrevMonth?: PegAmounts | null;
  chainCirculating?: Record<string, {
    current?: PegAmounts | null;
    circulatingPrevDay?: PegAmounts | null;
    circulatingPrevWeek?: PegAmounts | null;
    circulatingPrevMonth?: PegAmounts | null;
  }> | null;
  chains?: string[];
  price?: number | null;
};
export type HistoricalRecord = {
  date: string | number;
  totalCirculating?: PegAmounts | null;
  totalCirculatingUSD?: PegAmounts | null;
};

const BASE_URL = "https://stablecoins.llama.fi";

async function getResponse(path: string) {
  const response = await fetch(`${BASE_URL}${path}`, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("Could not retrieve stablecoin market data");
  const date = response.headers.get("date");
  const parsedDate = date ? Date.parse(date) : NaN;
  return {data: await response.json() as unknown, responseDate: Number.isFinite(parsedDate) ? parsedDate : null};
}

export async function getCoinSnapshot(): Promise<{coins:Stablecoin[]; responseDate:number|null}> {
  const {data,responseDate} = await getResponse("/stablecoins?includePrices=true");
  if (!data || typeof data !== "object" || !("peggedAssets" in data) || !Array.isArray(data.peggedAssets)) {
    throw new Error("Invalid stablecoin list response");
  }
  return {coins:data.peggedAssets,responseDate};
}

export async function getCoinList(): Promise<Stablecoin[]> {
  return (await getCoinSnapshot()).coins;
}

async function getHistory(path: string): Promise<HistoricalRecord[]> {
  const {data} = await getResponse(path);
  if (!Array.isArray(data)) throw new Error("Invalid stablecoin history response");
  return data;
}

export function getTotalHistory(): Promise<HistoricalRecord[]> {
  return getHistory("/stablecoincharts/all");
}

/** Optional history request; callers handle rejection per view, not globally. */
export function getCoinHistory(id: string): Promise<HistoricalRecord[]> {
  if (!id.trim()) return Promise.reject(new Error("Stablecoin id is required"));
  return getHistory(`/stablecoincharts/all?stablecoin=${encodeURIComponent(id)}`);
}

/** One shared load; an unavailable source must not blank independent views. */
export async function getDashboardSnapshot() {
  const [coins,history] = await Promise.allSettled([getCoinSnapshot(),getTotalHistory()]);
  return {coins,history,generatedAt:Date.now()};
}
