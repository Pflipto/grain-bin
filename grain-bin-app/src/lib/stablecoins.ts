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

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(`${BASE_URL}${path}`, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("Could not retrieve stablecoin market data");
  return response.json();
}

export async function getCoinList(): Promise<Stablecoin[]> {
  const data = await getJson("/stablecoins?includePrices=true");
  if (!data || typeof data !== "object" || !("peggedAssets" in data) || !Array.isArray(data.peggedAssets)) {
    throw new Error("Invalid stablecoin list response");
  }
  // Container validation only in this extraction. Fields stay unmodified;
  // view-specific validation belongs with the new calculations in PR 2.
  return data.peggedAssets;
}

async function getHistory(path: string): Promise<HistoricalRecord[]> {
  const data = await getJson(path);
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
