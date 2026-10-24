// Existing display formatting; invalid-denominator behavior is retained for PR 1.
export const money = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2,
}).format(value);
export const percent = (part: number, whole: number) => whole > 0 ? (100 * part / whole).toFixed(1) : "0.0";
export const shortDate = (date: number) => new Date(date).toLocaleDateString("en-US", {
  month: "short", year: "numeric", timeZone: "UTC",
});

