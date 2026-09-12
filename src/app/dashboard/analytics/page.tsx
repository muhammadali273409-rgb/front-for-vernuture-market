"use client";

import { BarChart3, Briefcase, HandCoins, Handshake } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { useMyBusinesses } from "@/hooks/use-businesses";
import { useMyOffers } from "@/hooks/use-offers";
import { useDeals } from "@/hooks/use-deals";
import { useTranslation } from "@/i18n/client";

export default function AnalyticsPage() {
  const { t } = useTranslation("dashboard");
  const { data: businesses = [] } = useMyBusinesses();
  const { data: offers = [] } = useMyOffers();
  const { data: deals = [] } = useDeals();

  const publishedListings = businesses.filter((b) => b.listing?.status === "PUBLISHED").length;
  const activeDeals = deals.filter((d) => !["COMPLETED", "CANCELLED"].includes(d.status)).length;
  const hasData = businesses.length > 0 || offers.length > 0 || deals.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader title={t("analyticsPage.title")} description={t("analyticsPage.description")} />

      {!hasData ? (
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
