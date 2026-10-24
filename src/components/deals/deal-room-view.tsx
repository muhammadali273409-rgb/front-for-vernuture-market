"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Lock, CheckCircle2, Clock, ArrowRight, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDueDiligence, useUpdateTaskStatus } from "@/hooks/use-deals";
import { useBusinessDocuments } from "@/hooks/use-documents";
import {
  useAgreements,
  useDealFlowMutations,
  useDealTransaction,
  usePaymentConfig,
} from "@/hooks/use-deal-flow";
import { DealNextStep, type DealUiIntent } from "@/components/deals/deal-next-step";
import { DueDiligencePanel, useOpenDocument } from "@/components/deals/due-diligence-panel";
import { AgreementPanel } from "@/components/deals/agreement-panel";
import { PaymentPanel } from "@/components/deals/payment-panel";
import {
  AgreementVersionDialog,
  CreateAgreementDialog,
  DueDiligenceRequestDialog,
  MarkPaidDialog,
} from "@/components/deals/deal-dialogs";
import {
  DEAL_STAGES,
  currentAgreement,
  dueDiligenceProgress,
  latestVersion,
  nextStep,
  viewerSide,
} from "@/lib/deals/flow";
import {
  dealStatusKey,
  dealTaskStatusKey,
  documentCategoryKey,
  documentVisibilityKey,
} from "@/lib/utils/labels";
import { formatMoney } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types/domain";

type DealTab = "diligence" | "agreement" | "payment" | "documents" | "tasks" | "timeline";

const PAYMENT_STAGES: Deal["status"][] = ["TRANSACTION", "TRANSFER", "COMPLETED"];

/** The tab that holds the current stage's work. */
function tabForStatus(status: Deal["status"]): DealTab {
  if (status === "AGREEMENT") return "agreement";
  if (PAYMENT_STAGES.includes(status)) return "payment";
  return "diligence";
}

type OpenDialog = "ddRequest" | "createAgreement" | "addVersion" | "markPaid" | null;

export function DealRoomView({ deal }: { deal: Deal }) {
  const { t, i18n } = useTranslation(["deals", "documents"]);
  const locale = i18n.language as Locale;
  const { data: user } = useCurrentUser();

  const { data: diligenceRequests = [] } = useDueDiligence(deal.id);
  const { data: agreements = [] } = useAgreements(deal.id);
  const { data: transaction } = useDealTransaction(deal.id, PAYMENT_STAGES.includes(deal.status));
  const { data: paymentConfig } = usePaymentConfig();
  const { data: documents = [] } = useBusinessDocuments(deal.businessId);
  const updateTaskStatus = useUpdateTaskStatus(deal.id);
  const mutations = useDealFlowMutations(deal);
  const openDoc = useOpenDocument();

  const diligenceItems = diligenceRequests.flatMap((r) => r.items);
  const progress = dueDiligenceProgress(diligenceItems);
  const side = viewerSide(deal, user?.id);
  const step = nextStep({
    deal,
    viewerId: user?.id,
    diligenceItems,
    agreements,
    transaction,
    paymentProvider: paymentConfig?.provider,
  });
  const agreement = currentAgreement(agreements);

  // Follow the deal to the tab of its current stage, unless the user picked one for this stage.
  const [tabChoice, setTabChoice] = React.useState<{ status: Deal["status"]; tab: DealTab } | null>(null);
  const tab = tabChoice?.status === deal.status ? tabChoice.tab : tabForStatus(deal.status);
  const selectTab = (next: string) => setTabChoice({ status: deal.status, tab: next as DealTab });

  const [dialog, setDialog] = React.useState<OpenDialog>(null);
  const [versionFor, setVersionFor] = React.useState<string | null>(null);

  function handleIntent(intent: DealUiIntent) {
    switch (intent.kind) {
      case "dueDiligenceRequest":
        return setDialog("ddRequest");
      case "createAgreement":
        return setDialog("createAgreement");
      case "addAgreementVersion":
        setVersionFor(agreement?.id ?? null);
        return setDialog("addVersion");
      case "markPaid":
        return setDialog("markPaid");
      case "tab":
        return selectTab(intent.tab);
    }
  }

  function signCurrentAgreement() {
    const version = latestVersion(agreement);
    if (agreement && version) mutations.signAgreement.mutate({ agreementId: agreement.id, versionId: version.id });
  }

  const tasks = deal.tasks ?? [];
  const currentStageIdx = deal.status === "COMPLETED" ? DEAL_STAGES.length : DEAL_STAGES.indexOf(deal.status as never);
  const amount = transaction?.amount ?? deal.acceptedOffer?.amount;
  const currency = transaction?.currency ?? deal.acceptedOffer?.currency ?? "USD";

  function toggleTask(taskId: string, currentStatus: string) {
    updateTaskStatus.mutate({ taskId, status: currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED" });
  }

  return (
    <div className="space-y-6">
      {/* Top Stage Pipeline Indicator */}
      <Card className="border border-border/80 bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-2 animate-pulse rounded-full bg-emerald-500" />
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {t("dealRoomTitle", { name: deal.business?.name ?? t("dealIdLabel") })}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dealIdLabel")} <span className="font-mono">{deal.id}</span> · {t("activePrivateWorkspace")}
              {side && <> · {t("flow.youAre", { role: t(`flow.actor.${side}`) })}</>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 font-semibold text-primary"
              data-testid="deal-status"
              data-status={deal.status}
            >
              {t(`roomStatus.${dealStatusKey[deal.status] ?? deal.status}`)}
            </Badge>
            <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
              <Link href="/dashboard/messages">
                <span>{t("negotiationChat")}</span>
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stage strip — the due diligence figure comes from real items. */}
        <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {DEAL_STAGES.map((stage, idx) => {
            const isCompleted = currentStageIdx > idx;
            const isCurrent = currentStageIdx === idx;
            const label =
              stage === "DUE_DILIGENCE"
                ? t("flow.stages.DUE_DILIGENCE_PROGRESS", { percent: progress.percent })
                : t(`flow.stages.${stage}`);
            return (
              <li
                key={stage}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "relative flex flex-col rounded-lg border p-3 text-xs transition-all",
                  isCompleted && "border-emerald-500/30 bg-emerald-500/5 text-foreground",
                  isCurrent && "border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary/40",
                  !isCompleted && !isCurrent && "border-border/60 bg-muted/20 text-muted-foreground opacity-70",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px]">
                    {idx + 1}. {label}
                  </span>
                  {isCompleted && <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />}
                  {isCurrent && <Clock className="size-3.5 text-primary" />}
                </div>
              </li>
            );
          })}
        </ol>

        <DealNextStep
          deal={deal}
          step={step}
          side={side}
          mutations={mutations}
          onSignAgreement={signCurrentAgreement}
          onIntent={handleIntent}
        />
      </Card>

      {/* Main Tabs Workspace */}
      <Tabs value={tab} onValueChange={selectTab} className="space-y-4">
        <TabsList className="w-full max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="diligence">{t("dueDiligenceTab", { percent: progress.percent })}</TabsTrigger>
          <TabsTrigger value="agreement">{t("flow.tabs.agreement")}</TabsTrigger>
          <TabsTrigger value="payment">{t("flow.tabs.payment")}</TabsTrigger>
          <TabsTrigger value="documents">{t("dataRoomVaultTab")}</TabsTrigger>
          <TabsTrigger value="tasks">
            {t("dealTasksTab", { done: tasks.filter((task) => task.status === "COMPLETED").length, total: tasks.length })}
          </TabsTrigger>
          <TabsTrigger value="timeline">{t("milestoneHistoryTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="diligence">
          <DueDiligencePanel
            deal={deal}
            side={side}
            requests={diligenceRequests}
            progress={progress}
            mutations={mutations}
            onNewRequest={() => setDialog("ddRequest")}
          />
        </TabsContent>

        <TabsContent value="agreement">
          <AgreementPanel
            deal={deal}
            side={side}
            viewerId={user?.id}
            agreements={agreements}
            mutations={mutations}
            onCreate={() => setDialog("createAgreement")}
            onAddVersion={(id) => {
              setVersionFor(id);
              setDialog("addVersion");
            }}
          />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentPanel deal={deal} transaction={transaction} config={paymentConfig} />
        </TabsContent>

        {/* Document Vault */}
        <TabsContent value="documents">
          <Card className="border border-border/80 bg-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{t("secureVaultTitle")}</CardTitle>
                  <CardDescription className="text-xs">{t("secureVaultDescription")}</CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Lock className="mr-1 size-3" />
                  {t("encryptedVault")}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className={documents.length === 0 ? "p-0" : "divide-y divide-border/60 p-0"}>
              {documents.length === 0 ? (
                <EmptyState icon={FileText} title={t("documents:noDocumentsYet")} description={t("documents:noDocumentsYetDescription")} />
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <FileText className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{doc.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {t("documents:categoryLabel")} {t(`documents:category.${documentCategoryKey[doc.category] ?? doc.category}`)} ·{" "}
                          {t("documents:uploadedOn", { date: formatDate(doc.createdAt, locale) })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-sm border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        🔒 {t(`documents:visibility.${documentVisibilityKey[doc.visibility] ?? doc.visibility}`)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1 text-xs"
                        disabled={openDoc.isPending}
                        onClick={() => openDoc.open(doc.id)}
                      >
                        <Download className="size-3.5" />
                        <span>{t("documents:download")}</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deal Tasks */}
        <TabsContent value="tasks">
          <Card className="border border-border/80 bg-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-semibold">{t("closingChecklistTitle")}</CardTitle>
              <CardDescription className="text-xs">{t("closingChecklistDescription")}</CardDescription>
            </CardHeader>

            <CardContent className={tasks.length === 0 ? "p-0" : "divide-y divide-border/60 p-0"}>
              {tasks.length === 0 ? (
                <EmptyState title={t("noTasksTitle")} description={t("noTasksDescription")} />
              ) : (
                tasks.map((task) => (
                  <button
                    type="button"
                    key={task.id}
                    onClick={() => toggleTask(task.id, task.status)}
                    className="flex w-full cursor-pointer items-center justify-between p-4 text-left text-xs transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-5 items-center justify-center rounded-md border transition-colors",
                          task.status === "COMPLETED" ? "border-emerald-600 bg-emerald-600 text-white" : "border-border bg-card",
                        )}
                      >
                        {task.status === "COMPLETED" && <CheckCircle2 className="size-3.5" />}
                      </div>
                      <div>
                        <p className={cn("font-medium text-foreground", task.status === "COMPLETED" && "line-through opacity-60")}>
                          {task.title}
                        </p>
                        {task.description && <p className="text-[11px] text-muted-foreground">{task.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.dueAt && (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {t("dueLabel")} {formatDate(task.dueAt, locale)}
                        </span>
                      )}
                      <Badge variant={task.status === "COMPLETED" ? "default" : "outline"} className="text-[10px]">
                        {t(`taskStatus.${dealTaskStatusKey[task.status] ?? task.status}`)}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card className="border border-border/80 bg-card p-5">
            {!deal.timelineEvents || deal.timelineEvents.length === 0 ? (
              <EmptyState title={t("noTimelineTitle")} description={t("noTimelineDescription")} />
            ) : (
              <ol className="space-y-4">
                {deal.timelineEvents.map((event, idx) => {
                  const to = typeof event.metadata?.to === "string" ? event.metadata.to : undefined;
                  return (
                    <li key={event.id} className="relative flex gap-3 pb-4">
                      {idx !== deal.timelineEvents!.length - 1 && (
                        <div className="absolute bottom-0 left-3 top-6 w-px bg-border/80" />
                      )}
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CheckCircle2 className="size-3.5" />
                      </div>
                      <div className="space-y-0.5 text-xs">
                        <p className="font-semibold text-foreground">
                          {t(`flow.events.${event.type}`, { defaultValue: event.type })}
                          {to && <> → {t(`roomStatus.${dealStatusKey[to] ?? to}`)}</>}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">{formatDateTime(event.createdAt, locale)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <DueDiligenceRequestDialog open={dialog === "ddRequest"} onOpenChange={(o) => setDialog(o ? "ddRequest" : null)} mutations={mutations} />
      <CreateAgreementDialog
        open={dialog === "createAgreement"}
        onOpenChange={(o) => setDialog(o ? "createAgreement" : null)}
        mutations={mutations}
        defaultTitle={t("flow.form.agreementDefaultTitle", { name: deal.business?.name ?? "" })}
      />
      <AgreementVersionDialog
        open={dialog === "addVersion"}
        onOpenChange={(o) => setDialog(o ? "addVersion" : null)}
        mutations={mutations}
        agreementId={versionFor}
      />
      <MarkPaidDialog
        open={dialog === "markPaid"}
        onOpenChange={(o) => setDialog(o ? "markPaid" : null)}
        mutations={mutations}
        amountLabel={amount != null ? formatMoney(amount, currency, locale) : "—"}
        instructions={paymentConfig?.manualInstructions ?? ""}
      />
    </div>
  );
}
