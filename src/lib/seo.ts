import type { Metadata } from "next";

/**
 * Builds page metadata whose <title>/description stay in sync with its
 * og:title/og:description and twitter:title/twitter:description — otherwise
 * those fields silently fall back to the root layout's locale-aware defaults,
 * which can disagree with a page's own static (English) title.
 */
export function pageMetadata(title: string, description: string): Metadata {
  const fullTitle = `${title} · VentureMarket`;
  return {
    title,
    description,
    openGraph: { title: fullTitle, description },
    twitter: { title: fullTitle, description },
  };
}
