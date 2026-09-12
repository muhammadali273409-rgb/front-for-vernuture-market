import { formatCurrency, formatDate as formatDateIntl, formatRelativeTime as formatRelativeTimeIntl } from "@/i18n/format";
import type { Locale } from "@/i18n/settings";

export function formatMoney(value: number | null | undefined, currency = "USD", locale: Locale = "en"): string {
  if (value === null || value === undefined) return "—";
  return formatCurrency(value, locale, currency, { maximumFractionDigits: value >= 1000 ? 0 : 2 });
}

export function formatCompactMoney(value: number | null | undefined, currency = "USD", locale: Locale = "en"): string {
  if (value === null || value === undefined) return "—";
  return formatCurrency(value, locale, currency, { notation: "compact", maximumFractionDigits: 1 });
}

export function formatDate(value: string | Date | null | undefined, locale: Locale = "en"): string {
  if (!value) return "—";
  return formatDateIntl(value, locale, { dateStyle: "medium" });
}

export function formatDateTime(value: string | Date | null | undefined, locale: Locale = "en"): string {
  if (!value) return "—";
  return formatDateIntl(value, locale, { dateStyle: "medium", timeStyle: "short" });
}

export function formatRelativeTime(value: string | Date | null | undefined, locale: Locale = "en"): string {
  if (!value) return "—";
  return formatRelativeTimeIntl(value, locale);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

export function initials(firstName?: string | null, lastName?: string | null, email?: string): string {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  const combined = `${f}${l}`.toUpperCase();
  if (combined) return combined;
  return (email?.[0] ?? "?").toUpperCase();
}
