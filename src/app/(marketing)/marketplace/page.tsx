import { Suspense } from "react";
import { MarketplaceView } from "./marketplace-view";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Marketplace",
  "Browse verified, revenue-generating businesses for acquisition — filter by industry, price, revenue, and growth on VentureMarket.",
);

export default function MarketplacePage() {
  return (
    <Suspense>
      <MarketplaceView />
    </Suspense>
  );
}
