"use client";

import * as React from "react";
import { createInstance, type i18n as I18nInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { resources } from "./resources";
import { DEFAULT_NAMESPACE, LOCALE_BCP47, LOCALE_COOKIE, NAMESPACES, type Locale } from "./settings";

/**
 * A fresh i18next instance is created per provider mount (not a module-level
 * singleton) so concurrent SSR requests never share or race on language state.
 * All resources are bundled statically, so init completes synchronously and
 * the very first server-rendered markup already matches the client's initial
 * render — no hydration mismatch.
 */
function createI18nInstance(locale: Locale): I18nInstance {
  const instance = createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: "en",
    defaultNS: DEFAULT_NAMESPACE,
    ns: NAMESPACES,
    resources,
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });
  return instance;
}

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [i18n] = React.useState(() => createI18nInstance(locale));

  React.useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
    // <html lang> lives outside React's tree, so it's synced here rather than
    // mutated imperatively from click handlers (e.g. the language switcher).
    document.documentElement.lang = LOCALE_BCP47[locale];
  }, [i18n, locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

/** Persists the chosen locale so the server can read it on the next request. */
export function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  try {
    window.localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    // localStorage can be unavailable (private mode, disabled storage) — cookie is the source of truth.
  }
}

export { useTranslation } from "react-i18next";
