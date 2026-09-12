export const LOCALES = ["tj", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Fallback chain used when a key is missing in the active locale. */
export const FALLBACK_LOCALES: Record<Locale, Locale[]> = {
  tj: ["tj", "ru", "en"],
  ru: ["ru", "tj", "en"],
  en: ["en", "ru", "tj"],
};

export const LOCALE_LABELS: Record<Locale, string> = {
  tj: "Тоҷикӣ",
  ru: "Русский",
  en: "English",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  tj: "🇹🇯",
  ru: "🇷🇺",
  en: "🇬🇧",
};

/** BCP-47 tag used for <html lang>, Intl formatters, and metadata. */
export const LOCALE_BCP47: Record<Locale, string> = {
  tj: "tg",
  ru: "ru",
  en: "en",
};

export const NAMESPACES = [
  "common",
  "auth",
  "navigation",
  "home",
  "about",
  "faq",
  "marketplace",
  "business",
  "offers",
  "messages",
  "deals",
  "documents",
  "verification",
  "notifications",
  "dashboard",
  "settings",
  "admin",
  "ai",
  "errors",
  "pricing",
  "validation",
] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NAMESPACE: Namespace = "common";

export const LOCALE_COOKIE = "venturemarket_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
