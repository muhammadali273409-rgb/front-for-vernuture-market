import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { getServerLocale, getT } from "@/i18n/server";
import { LOCALE_BCP47 } from "@/i18n/settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://venturemarket.io";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const t = await getT("common", locale);
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: "%s · VentureMarket",
    },
    description,
    keywords: [
      "buy a business",
      "sell a business",
      "business marketplace",
      "startup acquisition",
      "SaaS acquisition",
      "business valuation",
      "due diligence platform",
      "VentureMarket",
    ],
    applicationName: "VentureMarket",
    authors: [{ name: "VentureMarket" }],
    creator: "VentureMarket",
    publisher: "VentureMarket",
    formatDetection: { telephone: false },
    category: "business",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: "/",
      siteName: "VentureMarket",
      title,
      description,
      locale: LOCALE_BCP47[locale],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1420" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();

  return (
    <html
      lang={LOCALE_BCP47[locale]}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders locale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
