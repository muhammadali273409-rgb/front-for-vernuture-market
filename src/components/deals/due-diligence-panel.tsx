"use client";

import * as React from "react";
import { Download, FileText, MessageSquareText, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { AnswerItemDialog } from "@/components/deals/deal-dialogs";
import { useDownloadDocument } from "@/hooks/use-documents";
import type { DealFlowMutations } from "@/hooks/use-deal-flow";
import {
  BUYER_TURN_STATUSES,
  OPEN_DUE_DILIGENCE_STATUSES,
  SELLER_TURN_STATUSES,
  type DealSide,
  type DueDiligenceProgress,
} from "@/lib/deals/flow";
import { dueDiligenceStatusKey } from "@/lib/utils/labels";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { Deal, DueDiligenceItem, DueDiligenceRequest, DueDiligenceStatus } from "@/types/domain";

const STATUS_TONE: Partial<Record<DueDiligenceStatus, string>> = {
  APPROVED: "bg-emerald-600 text-white dark:bg-emerald-500",
  COMPLETED: "bg-emerald-600 text-white dark:bg-emerald-500",
  REJECTED: "bg-destructive text-white",
  UPLOADED: "bg-primary text-primary-foreground",
  NEEDS_CLARIFICATION: "bg-amber-500 text-white",
};

export function useOpenDocument() {
  const download = useDownloadDocument();
  return {
    open: (documentId: string) =>
      download.mutate(documentId, {
        onSuccess: ({ url }) => window.open(url, "_blank", "noopener,noreferrer"),
      }),
    isPending: download.isPending,
  };
}

interface DueDiligencePanelProps {
  deal: Deal;
  side: DealSide | null;
  requests: DueDiligenceRequest[];
  progress: DueDiligenceProgress;
  mutations: DealFlowMutations;
  onNewRequest: () => void;
}

export function DueDiligencePanel({ deal, side, requests, progress, mutations, onNewRequest }: DueDiligencePanelProps) {
  const { t } = useTranslation("deals");
  const [answering, setAnswering] = React.useState<DueDiligenceItem | null>(null);
  const openDoc = useOpenDocument();
  const active = deal.status === "DUE_DILIGENCE";
  const review = mutations.reviewDueDiligenceItem;

  return (
    <Card className="border border-border/80 bg-card">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{t("institutionalChecklistTitle")}</CardTitle>
            <CardDescription className="text-xs">
              {side === "SELLER" ? t("flow.dd.sellerHelp") : t("flow.dd.buyerHelp")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-40" data-testid="dd-progress">
              <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                <span>{t("flow.dd.closedOf", { closed: progress.closed, total: progress.total })}</span>
                <span>{progress.percent}%</span>
              </div>
              <Progress value={progress.percent} className="mt-1 h-2" />
            </div>
            {active && side === "BUYER" && (
              <Button size="sm" variant="outline" onClick={onNewRequest}>
                <Plus className="size-3.5" />
                {t("flow.dd.newRequest")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {requests.length === 0 ? (
          <EmptyState
            title={t("noDueDiligenceTitle")}
            description={active && side === "BUYER" ? t("flow.dd.emptyBuyer") : t("flow.dd.emptyOther")}
          />
        ) : (
          requests.map((request) => (
            <div key={request.id} className="border-b border-border/60 last:border-b-0">
              <div className="flex items-center gap-2 bg-muted/30 px-4 py-2">
                <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                  {t(`flow.ddCategory.${request.category}`, { defaultValue: request.category })}
                </Badge>
                <h4 className="text-xs font-semibold text-foreground">{request.title}</h4>
              </div>
              <ul className="divide-y divide-border/60">
                {request.items.map((item) => {
                  const sellerTurn = active && side === "SELLER" && SELLER_TURN_STATUSES.includes(item.status);
                  const buyerTurn = active && side === "BUYER" && BUYER_TURN_STATUSES.includes(item.status);
                  const buyerCanClose = active && side === "BUYER" && OPEN_DUE_DILIGENCE_STATUSES.includes(item.status);
                  return (
                    <li key={item.id} className="space-y-2 p-4" data-testid="dd-item">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-xs font-medium text-foreground">{item.description}</p>
                        <Badge
                          variant="outline"
                          className={cn("shrink-0 text-[10px] font-semibold", STATUS_TONE[item.status])}
                          data-testid="dd-item-status"
                        >
                          {t(`status.${dueDiligenceStatusKey[item.status] ?? item.status}`)}
                        </Badge>
                      </div>

                      {(item.response || item.documentId) && (
                        <div className="space-y-1.5 rounded-md border border-border/60 bg-muted/20 p-3 text-xs">
                          <p className="text-[11px] font-semibold text-muted-foreground">{t("flow.dd.sellerAnswer")}</p>
                          {item.response && (
                            <p className="flex gap-1.5 whitespace-pre-line text-foreground">
                              <MessageSquareText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                              {item.response}
                            </p>
                          )}
                          {item.documentId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 px-2 text-xs"
                              disabled={openDoc.isPending}
                              onClick={() => openDoc.open(item.documentId!)}
                            >
                              <FileText className="size-3.5" />
                              {t("flow.dd.openDocument")}
                              <Download className="size-3" />
                            </Button>
                          )}
                        </div>
                      )}

                      {(sellerTurn || buyerTurn || buyerCanClose) && (
                        <div className="flex flex-wrap gap-2">
                          {sellerTurn && (
                            <Button size="sm" onClick={() => setAnswering(item)} data-testid="dd-answer">
                              {t("flow.dd.answer")}
                            </Button>
                          )}
                          {buyerTurn && (
                            <>
                              <Button
                                size="sm"
                                disabled={review.isPending}
                                onClick={() => review.mutate({ itemId: item.id, status: "APPROVED" })}
                                data-testid="dd-approve"
                              >
                                {t("flow.dd.approve")}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={review.isPending}
                                onClick={() => review.mutate({ itemId: item.id, status: "NEEDS_CLARIFICATION" })}
                              >
                                {t("flow.dd.askClarification")}
                              </Button>
                            </>
                          )}
                          {buyerCanClose && !buyerTurn && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={review.isPending}
                              onClick={() => review.mutate({ itemId: item.id, status: "COMPLETED" })}
                            >
                              {t("flow.dd.markDone")}
                            </Button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </CardContent>

      <AnswerItemDialog
        open={answering !== null}
        onOpenChange={(open) => !open && setAnswering(null)}
        mutations={mutations}
        item={answering}
      />
    </Card>
  );
}
