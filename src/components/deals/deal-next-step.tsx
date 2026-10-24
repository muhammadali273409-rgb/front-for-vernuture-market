"use client";

import * as React from "react";
import { Hourglass, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DealFlowMutations } from "@/hooks/use-deal-flow";
import type { DealAction, DealSide, NextStep } from "@/lib/deals/flow";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types/domain";

/** Mirrors the backend: once payment may be in flight only an admin can cancel. */
const PARTY_CANCELLABLE: Deal["status"][] = ["INITIATED", "NDA", "DUE_DILIGENCE", "AGREEMENT"];

/** Actions that need input: the panel opens the matching dialog / tab instead of calling the API. */
export type DealUiIntent =
  | { kind: "dueDiligenceRequest" }
  | { kind: "createAgreement" }
  | { kind: "addAgreementVersion" }
  | { kind: "markPaid" }
  | { kind: "tab"; tab: "diligence" | "agreement" | "payment" };

interface DealNextStepProps {
  deal: Deal;
  step: NextStep;
  side: DealSide | null;
  mutations: DealFlowMutations;
  /** Signs the current agreement's latest version (needs ids the panel doesn't own). */
  onSignAgreement: () => void;
  onIntent: (intent: DealUiIntent) => void;
}

/**
 * The single source of "what now" in the deal room: what is happening, whose
 * turn it is, and the one button that person should press. Everyone else
 * sees that they are waiting for the other party.
 */
export function DealNextStep({ deal, step, side, mutations, onSignAgreement, onIntent }: DealNextStepProps) {
  const { t } = useTranslation("deals");
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  const busy = Object.values(mutations).some((m) => m.isPending);
  const yourTurn = step.action !== null;
  const actorLabel =
    step.actor === "NONE"
      ? null
      : side && (step.actor === side || step.actor === "BOTH")
        ? t("flow.actor.you")
        : t(`flow.actor.${step.actor}`);

  function run(action: DealAction) {
    switch (action) {
      case "startNda":
        return mutations.startNda.mutate();
      case "signNda":
        return mutations.signNda.mutate();
      case "addDueDiligenceRequest":
        return onIntent({ kind: "dueDiligenceRequest" });
      case "answerDueDiligence":
      case "reviewDueDiligence":
        return onIntent({ kind: "tab", tab: "diligence" });
      case "closeDueDiligence":
        return mutations.closeDueDiligence.mutate();
      case "createAgreement":
        return onIntent({ kind: "createAgreement" });
      case "addAgreementVersion":
        return onIntent({ kind: "addAgreementVersion" });
      case "signAgreement":
        return onSignAgreement();
      case "markPaid":
        return onIntent({ kind: "markPaid" });
      case "payByCard":
        return mutations.payByCard.mutate();
      case "confirmTransfer":
        return mutations.confirmTransfer.mutate();
      case "confirmReceipt":
        return mutations.confirmReceipt.mutate();
    }
  }

  const canCancel = side !== null && PARTY_CANCELLABLE.includes(deal.status);

  return (
    <section
      aria-labelledby="deal-next-step"
      data-testid="deal-next-step"
      className={cn(
        "mt-5 rounded-lg border p-4",
        yourTurn ? "border-primary/50 bg-primary/5" : "border-border/60 bg-muted/20",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <p id="deal-next-step" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("flow.whatIsHappening")}
          </p>
          <p className="text-sm font-medium text-foreground">{t(`flow.stage.${step.stage}`)}</p>
          {actorLabel && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserRound className="size-3.5" />
              {t("flow.whoActs")}{" "}
              <Badge variant={yourTurn ? "default" : "outline"} className="text-[10px]" data-testid="deal-actor">
                {actorLabel}
              </Badge>
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {step.action && (
            <Button
              size="sm"
              onClick={() => run(step.action!)}
              disabled={busy}
              data-testid="deal-primary-action"
            >
              {t(`flow.action.${step.action}`)}
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmCancel(true)}
              disabled={busy}
            >
              {t("actions.cancelDeal")}
            </Button>
          )}
        </div>
      </div>

      {step.waiting && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground" data-testid="deal-waiting">
          <Hourglass className="mt-0.5 size-3.5 shrink-0" />
          <span>
            <span className="font-medium text-foreground">{t("flow.waitingOther")}</span>
            {step.waitingFor ? ` — ${t(`flow.waiting.${step.waitingFor}`)}` : null}
          </span>
        </p>
      )}

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("flow.cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("flow.cancelDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("flow.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => mutations.cancel.mutate()}
            >
              {t("actions.cancelDeal")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
