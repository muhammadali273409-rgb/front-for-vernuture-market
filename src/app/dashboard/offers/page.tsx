"use client";

import Link from "next/link";
import { HandCoins } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMyOffers } from "@/hooks/use-offers";
import { offerStatusKey, offerStatusVariant } from "@/lib/utils/labels";
import { formatMoney, formatRelativeTime } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";

export default function OffersPage() {
  const { t, i18n } = useTranslation("offers");
  const locale = i18n.language as Locale;
  const { data: user } = useCurrentUser();
  const { data: offers = [], isLoading, isError, error, refetch } = useMyOffers();

  return (
    <div className="space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState icon={HandCoins} title={t("noOffersYet")} description={t("noOffersYetDescription")} />
      ) : (
        <div className="space-y-2">
          {offers.map((offer) => (
            <Link key={offer.id} href={`/dashboard/offers/${offer.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{offer.business?.name ?? t("offer")}</p>
                    <p className="text-sm text-muted-foreground">
                      {offer.buyerId === user?.id ? t("youAreBuying") : t("youAreSelling")} ·{" "}
                      {formatRelativeTime(offer.createdAt, locale)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatMoney(offer.amount, offer.currency, locale)}</span>
                    <Badge variant={offerStatusVariant[offer.status]}>{t(`status.${offerStatusKey[offer.status]}`)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
