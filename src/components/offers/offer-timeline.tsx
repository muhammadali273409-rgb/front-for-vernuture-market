"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/client";
import { offerStatusKey, offerStatusVariant } from "@/lib/utils/labels";
import { formatDateTime, formatMoney } from "@/lib/utils/format";
import type { Locale } from "@/i18n/settings";
import type { Offer, OfferRevision } from "@/types/domain";

export function OfferTimeline({ offer, currentUserId }: { offer: Offer; currentUserId?: string }) {
  const { t, i18n } = useTranslation(["offers", "common"] as const);
  const locale = i18n.language as Locale;
  const revisions = offer.revisions ?? [];

  function actorLabel(revision: OfferRevision) {
    if (revision.submittedById === currentUserId) return t("common:you");
    return revision.submittedById === offer.buyerId ? t("offers:buyer") : t("offers:seller");
  }

  if (revisions.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("offers:noNegotiationHistoryYet")}</p>;
  }

  return (
    <ol className="space-y-4">
      {revisions.map((revision, index) => (
        <li key={revision.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex size-2.5 rounded-full bg-primary" />
            {index < revisions.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-border" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{actorLabel(revision)}</span>
              <Badge variant={offerStatusVariant[revision.status]} className="text-xs">
                {t(`offers:status.${offerStatusKey[revision.status]}`)}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatDateTime(revision.createdAt, locale)}</span>
            </div>
            <p className="mt-1 text-lg font-semibold">{formatMoney(revision.amount, revision.currency, locale)}</p>
            {revision.terms && <p className="mt-1 text-sm text-muted-foreground">{revision.terms}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
