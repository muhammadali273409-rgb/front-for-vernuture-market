"use client";

import * as React from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ListingCard } from "@/components/marketplace/listing-card";
import { ListingCardSkeleton } from "@/components/marketplace/listing-card-skeleton";
import { useListings } from "@/hooks/use-listings";
import { useTranslation } from "@/i18n/client";
import { PAGE_SIZE } from "@/lib/marketplace/filters";
import { cn } from "@/lib/utils";

/** The seller's live listings, straight from GET /listings?sellerId=… */
export function SellerListings({ sellerId }: { sellerId: string }) {
  const { t } = useTranslation("marketplace");
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError, error, refetch, isPlaceholderData } = useListings({
    sellerId,
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  if (isError) return <ErrorState title={t("unableToLoad")} error={error} onRetry={() => refetch()} />;

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const listings = data?.data ?? [];
  const pagination = data?.pagination;
  if (listings.length === 0) return <EmptyState icon={Store} title={t("sellerNoListings")} />;

  return (
    <>
      <div className={cn("grid gap-5 sm:grid-cols-2 xl:grid-cols-3", isPlaceholderData && "opacity-60")}>
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-xs">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("previousPage")}
          </Button>
          <span className="text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={!pagination.hasMore} onClick={() => setPage((p) => p + 1)}>
            {t("nextPage")}
          </Button>
        </div>
      )}
    </>
  );
}
