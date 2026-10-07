"use client";

import { BarChart3, Briefcase, HandCoins, Handshake } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBusinesses } from "@/hooks/use-businesses";
import { useMyOffers } from "@/hooks/use-offers";
import { useDeals } from "@/hooks/use-deals";
import { isActiveDeal, countPublishedListings } from "@/lib/utils/metrics";
import { useTranslation } from "@/i18n/client";

export default function AnalyticsPage() {
  const { t } = useTranslation("dashboard");
  const businessesQuery = useMyBusinesses();
  const offersQuery = useMyOffers();
  const dealsQuery = useDeals();

  // Without these the page used to read every query as "empty" while it was
  // still in flight and after it failed, so it reported zeros — or "not enough
  // data" — instead of an actual measurement.
  const isLoading = businessesQuery.isLoading || offersQuery.isLoading || dealsQuery.isLoading;
  const isError = businessesQuery.isError || offersQuery.isError || dealsQuery.isError;

  const businesses = businessesQuery.data ?? [];
  const offers = offersQuery.data ?? [];
  const deals = dealsQuery.data ?? [];

  const publishedListings = countPublishedListings(businesses);
  const activeDeals = deals.filter(isActiveDeal).length;
  const hasData = businesses.length > 0 || offers.length > 0 || deals.length > 0;

  function retry() {
    void businessesQuery.refetch();
    void offersQuery.refetch();
    void dealsQuery.refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("analyticsPage.title")} description={t("analyticsPage.description")} />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={retry} />
      ) : !hasData ? (
        <EmptyState
          icon={BarChart3}
          title={t("analyticsPage.notEnoughDataTitle")}
          description={t("analyticsPage.notEnoughDataDescription")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label={t("analyticsPage.publishedListings")} value={publishedListings} icon={Briefcase} />
          <StatCard label={t("analyticsPage.totalOffers")} value={offers.length} icon={HandCoins} />
          <StatCard label={t("analyticsPage.activeDeals")} value={activeDeals} icon={Handshake} />
        </div>
      )}
    </div>
  );
}