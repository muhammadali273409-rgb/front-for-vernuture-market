"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDealAction, useUpdateDealStatus } from "@/hooks/use-deals";
import { useTranslation } from "@/i18n/client";
import type { Deal } from "@/types/domain";

/** Mirrors the backend: once payment may be in flight only an admin can cancel. */
const PARTY_CANCELLABLE: Deal["status"][] = ["INITIATED", "NDA", "DUE_DILIGENCE", "AGREEMENT"];

/**
 * The next step the signed-in participant can take at the deal's current
 * stage. Stages proven by another record (both NDA signatures, a signed
 * agreement, a provider-confirmed payment) advance on their own in the
 * backend, so they only show a waiting note here. The backend re-checks
 * every one of these actions against the caller's deal role.
 */
export function DealStageActions({ deal }: { deal: Deal }) {
  const { t } = useTranslation("deals");
  const { data: user } = useCurrentUser();
  const updateStatus = useUpdateDealStatus(deal.id);
  const dealAction = useDealAction(deal.id);

  const me = deal.participants.find((p) => p.userId === user?.id);
  const role = me?.role;
  const isBuyer = role === "BUYER";
  const isSeller = role === "SELLER";
  if (!isBuyer && !isSeller) return null;

  const busy = updateStatus.isPending || dealAction.isPending;
  let primary: React.ReactNode = null;
  let note: string | null = null;

  switch (deal.status) {
    case "INITIATED":
      primary = (
        <Button size="sm" onClick={() => updateStatus.mutate("NDA")} disabled={busy}>
          {t("actions.startNda")}
        </Button>
      );
      break;
    case "NDA":
      if (me?.ndaStatus === "SIGNED") {
        note = t("actions.waitingForNda");
      } else {
        primary = (
          <Button size="sm" onClick={() => dealAction.mutate("signNda")} disabled={busy}>
            {t("actions.signNda")}
          </Button>
        );
      }
      break;
    case "DUE_DILIGENCE":
      if (isBuyer) {
        primary = (
          <Button size="sm" onClick={() => updateStatus.mutate("AGREEMENT")} disabled={busy}>
            {t("actions.closeDueDiligence")}
          </Button>
        );
      } else {
        note = t("actions.sellerDueDiligence");
      }
      break;
    case "AGREEMENT":
      note = t("actions.waitingForAgreement");
      break;
    case "TRANSACTION":
      note = t("actions.waitingForPayment");
      break;
    case "TRANSFER":
      if (isSeller) {
        if (deal.sellerTransferConfirmedAt) {
          note = t("actions.waitingForReceipt");
        } else {
          primary = (
            <Button size="sm" onClick={() => dealAction.mutate("confirmTransfer")} disabled={busy}>
              {t("actions.confirmTransfer")}
            </Button>
          );
        }
      } else if (deal.sellerTransferConfirmedAt) {
        primary = (
          <Button size="sm" onClick={() => dealAction.mutate("confirmReceipt")} disabled={busy}>
            {t("actions.confirmReceipt")}
          </Button>
        );
      } else {
        note = t("actions.waitingForTransfer");
      }
      break;
    case "DISPUTED":
      note = t("actions.disputed");
      break;
    default:
      break;
  }

  const canCancel = PARTY_CANCELLABLE.includes(deal.status);
  if (!primary && !note && !canCancel) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
      {primary}
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
      {canCancel && (
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-destructive hover:text-destructive"
          onClick={() => updateStatus.mutate("CANCELLED")}
          disabled={busy}
        >
          {t("actions.cancelDeal")}
        </Button>
      )}
    </div>
  );
}
