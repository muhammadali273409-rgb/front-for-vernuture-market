"use client";

import { use } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferTimeline } from "@/components/offers/offer-timeline";
import { OfferActions } from "@/components/offers/offer-actions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useOffer } from "@/hooks/use-offers";
import { offerStatusKey, offerStatusVariant } from "@/lib/utils/labels";
import { useTranslation } from "@/i18n/client";

export default function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation("offers");
  const { data: user } = useCurrentUser();
  const { data: offer, isLoading, isError, error, refetch } = useOffer(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !offer) {
    return <ErrorState error={error} onRetry={() => refetch()} title={t("couldntLoad")} />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={offer.business?.name ?? t("offer")}
        description={
          offer.business ? (
            <Link href={`/marketplace/${offer.business.slug}`} className="text-primary hover:underline">
              {t("viewListing")}
            </Link>
          ) : undefined
        }
        action={<Badge variant={offerStatusVariant[offer.status]}>{t(`status.${offerStatusKey[offer.status]}`)}</Badge>}
      />

      <Card>
        <CardContent className="space-y-6">
          <OfferActions offer={offer} currentUserId={user?.id} />
          <div>
            <h3 className="mb-3 font-medium">{t("negotiationHistory")}</h3>
            <OfferTimeline offer={offer} currentUserId={user?.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
