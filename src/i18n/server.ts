import "server-only";
import { cookies } from "next/headers";
import { createInstance } from "i18next";
import { resources } from "./resources";
import { DEFAULT_LOCALE, DEFAULT_NAMESPACE, isLocale, LOCALE_COOKIE, NAMESPACES, type Locale, type Namespace } from "./settings";

/** Reads the visitor's locale preference from the persisted cookie (server-side only). */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Synchronous translator for Server Components, layouts, and generateMetadata.
 * Creates a throwaway i18next instance per call (resources are static, so this
 * is cheap) to avoid sharing mutable language state across concurrent requests.
 */
export async function getT(namespace: Namespace | Namespace[] = DEFAULT_NAMESPACE, locale?: Locale) {
  const resolvedLocale = locale ?? (await getServerLocale());
  const instance = createInstance();
  instance.init({
    lng: resolvedLocale,
    fallbackLng: "en",
    defaultNS: DEFAULT_NAMESPACE,
    ns: NAMESPACES,
    resources,
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });
  return instance.getFixedT(resolvedLocale, namespace);
}
