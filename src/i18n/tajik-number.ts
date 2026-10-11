/**
 * Browsers ship little or no Tajik ("tg") number data, so Intl silently
 * falls back to another locale — compact amounts came out Russian
 * ("1 тыс. $"). Tajik money is therefore formatted by hand: symbol first,
 * space-grouped thousands, comma decimals, and Tajik abbreviations.
 *
 * Dependency-free on purpose — it's unit-tested with `node --test`.
 */

const TAJIK_COMPACT_UNITS: [number, string][] = [
  [1e9, "млрд"],
  [1e6, "млн"],
  [1e3, "ҳаз."],
];

function currencySymbol(currency: string): string {
  try {
    const part = new Intl.NumberFormat("en", { style: "currency", currency, currencyDisplay: "narrowSymbol" })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? currency;
  } catch {
    return currency;
  }
}

function tajikNumber(value: number, maximumFractionDigits: number): string {
  let fixed = Math.abs(value).toFixed(maximumFractionDigits);
  // Drop trailing zeros of the fraction only ("1,50" → "1,5", "2,0" → "2").
  if (fixed.includes(".")) fixed = fixed.replace(/0+$/, "").replace(/\.$/, "");
  const [whole, fraction] = fixed.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${value < 0 ? "−" : ""}${grouped}${fraction ? `,${fraction}` : ""}`;
}

export function formatTajikCurrency(
  value: number,
  currency: string,
  options: Intl.NumberFormatOptions = {},
): string {
  const symbol = currencySymbol(currency);
  const digits = options.maximumFractionDigits ?? 0;
  if (options.notation === "compact") {
    const unit = TAJIK_COMPACT_UNITS.find(([size]) => Math.abs(value) >= size);
    if (unit) return `${symbol}${tajikNumber(value / unit[0], Math.min(digits, 1))} ${unit[1]}`;
  }
  return `${symbol}${tajikNumber(value, digits)}`;
}
