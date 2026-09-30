"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { useDueDiligence, useUpdateTaskStatus } from "@/hooks/use-deals";
import { useBusinessDocuments } from "@/hooks/use-documents";
import { DealStageActions } from "@/components/deals/deal-stage-actions";
import {
  dealStatusKey,
  dealTaskStatusKey,
  documentCategoryKey,
  documentVisibilityKey,
  dueDiligenceCategoryKey,
  dueDiligenceStatusKey,
} from "@/lib/utils/labels";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types/domain";

const DEAL_STAGE_ORDER: Deal["status"][] = ["INITIATED", "NDA", "DUE_DILIGENCE", "AGREEMENT", "TRANSACTION", "TRANSFER", "COMPLETED"];
const DEAL_STAGE_KEYS: Record<string, string> = {
  INITIATED: "offerAccepted",
  NDA: "ndaExecuted",
  DUE_DILIGENCE: "dueDiligence80",
  AGREEMENT: "purchaseAgreement",
  TRANSACTION: "escrowClosing",
  TRANSFER: "escrowClosing",
  COMPLETED: "escrowClosing",
};

export function DealRoomView({ deal }: { deal: Deal }) {
  const { t, i18n } = useTranslation(["deals", "documents"]);
  const locale = i18n.language as Locale;

  const { data: diligenceRequests = [] } = useDueDiligence(deal.id);
  const diligenceItems = diligenceRequests.flatMap((r) => r.items);
  const { data: documents = [] } = useBusinessDocuments(deal.businessId);
  const updateTaskStatus = useUpdateTaskStatus(deal.id);

  const tasks = deal.tasks ?? [];
  const completedDiligence = diligenceItems.filter((i) => i.status === "APPROVED").length;
  const diligenceProgress = diligenceItems.length > 0 ? Math.round((completedDiligence / diligenceItems.length) * 100) : 0;

  const currentStageIdx = DEAL_STAGE_ORDER.indexOf(deal.status);

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
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {t("dealRoomTitle", { name: deal.business?.name ?? t("dealIdLabel") })}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dealIdLabel")} <span className="font-mono">{deal.id}</span> · {t("activePrivateWorkspace")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary font-semibold">
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

        {/* 5-Stage Visual Progress Line */}
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-3">
          {DEAL_STAGE_ORDER.slice(0, 5).map((stage, idx) => {
            const isCompleted = currentStageIdx > idx;
            const isCurrent = currentStageIdx === idx;

            return (
              <div
                key={stage}
                className={cn(
                  "relative flex flex-col rounded-lg border p-3 text-xs transition-all",
                  isCompleted && "border-emerald-500/30 bg-emerald-500/5 text-foreground",
                  isCurrent && "border-primary bg-primary/5 ring-1 ring-primary/40 font-semibold text-primary",
                  !isCompleted && !isCurrent && "border-border/60 bg-muted/20 text-muted-foreground opacity-70",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px]">{t(`stages.${DEAL_STAGE_KEYS[stage]}`)}</span>
                  {isCompleted && <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />}
                  {isCurrent && <Clock className="size-3.5 text-primary" />}
                </div>
              </div>
            );
          })}
        </div>

        <DealStageActions deal={deal} />
      </Card>

      {/* Main Tabs Workspace */}
      <Tabs defaultValue="diligence" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
          <TabsTrigger value="diligence">{t("dueDiligenceTab", { percent: diligenceProgress })}</TabsTrigger>
          <TabsTrigger value="documents">{t("dataRoomVaultTab")}</TabsTrigger>
          <TabsTrigger value="tasks">
            {t("dealTasksTab", { done: tasks.filter((task) => task.status === "COMPLETED").length, total: tasks.length })}
          </TabsTrigger>
          <TabsTrigger value="timeline">{t("milestoneHistoryTab")}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Due Diligence Checklist */}
        <TabsContent value="diligence" className="space-y-4">
          <Card className="border border-border/80 bg-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{t("institutionalChecklistTitle")}</CardTitle>
                  <CardDescription className="text-xs">{t("institutionalChecklistDescription")}</CardDescription>
                </div>
                {diligenceItems.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-36">
                      <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                        <span>{t("progress")}</span>
                        <span>{diligenceProgress}%</span>
                      </div>
                      <Progress value={diligenceProgress} className="h-2 mt-1" />
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className={diligenceItems.length === 0 ? "p-0" : "divide-y divide-border/60 p-0"}>
              {diligenceItems.length === 0 ? (
                <EmptyState title={t("noDueDiligenceTitle")} description={t("noDueDiligenceDescription")} />
              ) : (
                diligenceItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                          {t(`categories.${dueDiligenceCategoryKey[item.category] ?? item.category}`)}
                        </Badge>
                        <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
                      </div>
                      {item.notes && <p className="text-[11px] text-muted-foreground">{item.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          item.status === "APPROVED"
                            ? "default"
                            : item.status === "UNDER_REVIEW"
                            ? "secondary"
                            : "outline"
                        }
                        className={cn(
                          "text-[10px] font-semibold",
                          item.status === "APPROVED" && "bg-emerald-600 dark:bg-emerald-500 text-white",
                        )}
                      >
                        {t(`status.${dueDiligenceStatusKey[item.status] ?? item.status}`)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Document Vault */}
        <TabsContent value="documents">
          <Card className="border border-border/80 bg-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{t("secureVaultTitle")}</CardTitle>
                  <CardDescription className="text-xs">{t("secureVaultDescription")}</CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <Lock className="size-3 mr-1" />
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
                        <p className="font-semibold text-foreground">{doc.fileName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {t("documents:categoryLabel")} {t(`documents:category.${documentCategoryKey[doc.category] ?? doc.category}`)} ·{" "}
                          {t("documents:versionNumber", { version: doc.version })} ·{" "}
                          {t("documents:uploadedOn", { date: formatDate(doc.createdAt, locale) })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-sm border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                        🔒 {t(`documents:visibility.${documentVisibilityKey[doc.visibility] ?? doc.visibility}`)}
                      </span>
                      <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs">
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

        {/* Tab 3: Deal Tasks */}
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
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id, task.status)}
                    className="flex items-center justify-between p-4 text-xs cursor-pointer hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-5 items-center justify-center rounded-md border transition-colors",
                          task.status === "COMPLETED"
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-border bg-card",
                        )}
                      >
                        {task.status === "COMPLETED" && <CheckCircle2 className="size-3.5" />}
                      </div>
                      <div>
                        <p className={cn("font-medium text-foreground", task.status === "COMPLETED" && "line-through opacity-60")}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-muted-foreground">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.dueAt && (
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {t("dueLabel")} {formatDate(task.dueAt, locale)}
                        </span>
                      )}
                      <Badge variant={task.status === "COMPLETED" ? "default" : "outline"} className="text-[10px]">
                        {t(`taskStatus.${dealTaskStatusKey[task.status] ?? task.status}`)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Timeline */}
        <TabsContent value="timeline">
          <Card className="border border-border/80 bg-card p-5">
            {!deal.timelineEvents || deal.timelineEvents.length === 0 ? (
              <EmptyState title={t("noTimelineTitle")} description={t("noTimelineDescription")} />
            ) : (
              <div className="space-y-4">
                {deal.timelineEvents.map((event, idx) => (
                  <div key={event.id} className="relative flex gap-3 pb-4">
                    {idx !== deal.timelineEvents!.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-px bg-border/80" />
                    )}
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="size-3.5" />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <p className="font-semibold text-foreground">{event.message}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{formatDateTime(event.createdAt, locale)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
