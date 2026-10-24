export const money = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2,
}).format(value);
export const percent = (part: number, whole: number) => Number.isFinite(part) && Number.isFinite(whole) && whole > 0 ? (100 * part / whole).toFixed(1) : "n/a";
export const shortDate = (date: number) => new Date(date).toLocaleDateString("en-US", {
  month: "short", year: "numeric", timeZone: "UTC",
});
export const fullDate = (date:number) => new Date(date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"});
export const utcTime = (date:number) => `${new Date(date).toISOString().replace("T"," ").slice(0,16)} UTC`;
export const direction = (value:number) => value===0 ? "Unchanged" : value>0 ? "Up" : "Down";
export const signedMoney = (value:number) => `${value>0?"+":value<0?"−":""}${money(Math.abs(value))}`;
export const signedPercent = (value:number) => {
  const rounded=Math.abs(value).toFixed(2);
  return `${Number(rounded)===0?"":value>0?"+":value<0?"−":""}${rounded}%`;
};
