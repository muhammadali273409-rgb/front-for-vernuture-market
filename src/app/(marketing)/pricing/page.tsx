import { Suspense } from "react";
import type { Metadata } from "next";
import { PricingView } from "@/components/pricing/pricing-view";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT("pricing");
  const title = t("meta.title");
  const description = t("meta.description");
  return {
    title,
    description,
    openGraph: { title: `${title} · VentureMarket`, description },
    twitter: { title: `${title} · VentureMarket`, description },
  };
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-[60vh] max-w-6xl animate-pulse px-4 py-16 sm:px-6" />}>
      <PricingView />
    </Suspense>
  );
}
