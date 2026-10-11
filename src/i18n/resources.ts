import type { Resource } from "i18next";

import tjCommon from "./locales/tj/common.json";
import tjAuth from "./locales/tj/auth.json";
import tjNavigation from "./locales/tj/navigation.json";
import tjHome from "./locales/tj/home.json";
import tjAbout from "./locales/tj/about.json";
import tjFaq from "./locales/tj/faq.json";
import tjMarketplace from "./locales/tj/marketplace.json";
import tjBusiness from "./locales/tj/business.json";
import tjOffers from "./locales/tj/offers.json";
import tjMessages from "./locales/tj/messages.json";
import tjDeals from "./locales/tj/deals.json";
import tjDocuments from "./locales/tj/documents.json";
import tjVerification from "./locales/tj/verification.json";
import tjNotifications from "./locales/tj/notifications.json";
import tjDashboard from "./locales/tj/dashboard.json";
import tjSettings from "./locales/tj/settings.json";
import tjAdmin from "./locales/tj/admin.json";
import tjAi from "./locales/tj/ai.json";
import tjErrors from "./locales/tj/errors.json";
import tjPricing from "./locales/tj/pricing.json";
import tjValidation from "./locales/tj/validation.json";

import ruCommon from "./locales/ru/common.json";
import ruAuth from "./locales/ru/auth.json";
import ruNavigation from "./locales/ru/navigation.json";
import ruHome from "./locales/ru/home.json";
import ruAbout from "./locales/ru/about.json";
import ruFaq from "./locales/ru/faq.json";
import ruMarketplace from "./locales/ru/marketplace.json";
import ruBusiness from "./locales/ru/business.json";
import ruOffers from "./locales/ru/offers.json";
import ruMessages from "./locales/ru/messages.json";
import ruDeals from "./locales/ru/deals.json";
import ruDocuments from "./locales/ru/documents.json";
import ruVerification from "./locales/ru/verification.json";
import ruNotifications from "./locales/ru/notifications.json";
import ruDashboard from "./locales/ru/dashboard.json";
import ruSettings from "./locales/ru/settings.json";
import ruAdmin from "./locales/ru/admin.json";
import ruAi from "./locales/ru/ai.json";
import ruErrors from "./locales/ru/errors.json";
import ruPricing from "./locales/ru/pricing.json";
import ruValidation from "./locales/ru/validation.json";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enNavigation from "./locales/en/navigation.json";
import enHome from "./locales/en/home.json";
import enAbout from "./locales/en/about.json";
import enFaq from "./locales/en/faq.json";
import enMarketplace from "./locales/en/marketplace.json";
import enBusiness from "./locales/en/business.json";
import enOffers from "./locales/en/offers.json";
import enMessages from "./locales/en/messages.json";
import enDeals from "./locales/en/deals.json";
import enDocuments from "./locales/en/documents.json";
import enVerification from "./locales/en/verification.json";
import enNotifications from "./locales/en/notifications.json";
import enDashboard from "./locales/en/dashboard.json";
import enSettings from "./locales/en/settings.json";
import enAdmin from "./locales/en/admin.json";
import enAi from "./locales/en/ai.json";
import enErrors from "./locales/en/errors.json";
import enPricing from "./locales/en/pricing.json";
import enValidation from "./locales/en/validation.json";

type Bundle = { [key: string]: string | Bundle };

/**
 * Tajik has one noun form after a number ("5 бизнес"), so its files only
 * define `_one`/`_other`. But "tj" isn't a CLDR language code (Tajik is
 * "tg"), so i18next resolves plural rules through Intl.PluralRules("tj"),
 * which in browsers falls back to another language's rules (often Russian)
 * and asks for `_few`/`_many` — keys Tajik doesn't have, so the text fell
 * back to English ("0 businesses"). Filling every plural category from
 * `_other` makes Tajik plurals work whatever rule the runtime picks.
 */
function withAllPluralForms<T>(bundle: T): T {
  const source = bundle as unknown as Bundle;
  const out: Bundle = {};
  for (const [key, value] of Object.entries(source)) {
    out[key] = typeof value === "string" ? value : withAllPluralForms(value);
  }
  for (const [key, value] of Object.entries(source)) {
    if (typeof value !== "string" || !key.endsWith("_other")) continue;
    const base = key.slice(0, -"_other".length);
    for (const form of ["zero", "one", "two", "few", "many"]) {
      if (!(`${base}_${form}` in out)) out[`${base}_${form}`] = value;
    }
  }
  return out as unknown as T;
}

const tjResources = {
    common: tjCommon,
    auth: tjAuth,
    navigation: tjNavigation,
    home: tjHome,
    about: tjAbout,
    faq: tjFaq,
    marketplace: tjMarketplace,
    business: tjBusiness,
    offers: tjOffers,
    messages: tjMessages,
    deals: tjDeals,
    documents: tjDocuments,
    verification: tjVerification,
    notifications: tjNotifications,
    dashboard: tjDashboard,
    settings: tjSettings,
    admin: tjAdmin,
    ai: tjAi,
    errors: tjErrors,
    pricing: tjPricing,
    validation: tjValidation,
};

export const resources: Resource = {
  tj: Object.fromEntries(
    Object.entries(tjResources).map(([ns, bundle]) => [ns, withAllPluralForms(bundle)]),
  ),
  ru: {
    common: ruCommon,
    auth: ruAuth,
    navigation: ruNavigation,
    home: ruHome,
    about: ruAbout,
    faq: ruFaq,
    marketplace: ruMarketplace,
    business: ruBusiness,
    offers: ruOffers,
    messages: ruMessages,
    deals: ruDeals,
    documents: ruDocuments,
    verification: ruVerification,
    notifications: ruNotifications,
    dashboard: ruDashboard,
    settings: ruSettings,
    admin: ruAdmin,
    ai: ruAi,
    errors: ruErrors,
    pricing: ruPricing,
    validation: ruValidation,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    navigation: enNavigation,
    home: enHome,
    about: enAbout,
    faq: enFaq,
    marketplace: enMarketplace,
    business: enBusiness,
    offers: enOffers,
    messages: enMessages,
    deals: enDeals,
    documents: enDocuments,
    verification: enVerification,
    notifications: enNotifications,
    dashboard: enDashboard,
    settings: enSettings,
    admin: enAdmin,
    ai: enAi,
    errors: enErrors,
    pricing: enPricing,
    validation: enValidation,
  },
};
