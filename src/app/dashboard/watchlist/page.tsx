"use client";

import { Heart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ListingCard } from "@/components/marketplace/listing-card";
import { ListingCardSkeleton } from "@/components/marketplace/listing-card-skeleton";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useTranslation } from "@/i18n/client";

export default function WatchlistPage() {
  const { t } = useTranslation("dashboard");
  const { data: items = [], isLoading, isError, error, refetch } = useWatchlist();

  return (
    <div className="space-y-6">
      <PageHeader title={t("watchlistPage.title")} description={t("watchlistPage.description")} />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Heart} title={t("watchlistPage.emptyTitle")} description={t("watchlistPage.emptyDescription")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items
            .filter((item) => item.business)
            .map((item) => (
              <ListingCard key={item.id} listing={item.business!} />
            ))}
        </div>
      )}
    </div>
  );
}
