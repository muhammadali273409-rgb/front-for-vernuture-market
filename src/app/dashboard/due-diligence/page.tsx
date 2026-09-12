"use client";

import { useQueries } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeals } from "@/hooks/use-deals";
import { dealsApi } from "@/lib/api/deals";
import { dueDiligenceCategoryKey, dueDiligenceStatusKey } from "@/lib/utils/labels";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { DueDiligenceItem } from "@/types/domain";

const CATEGORIES = ["Financials", "Technology", "Legal", "Operations"];

export default function DueDiligencePage() {
  const { t } = useTranslation("deals");
  const { data: deals = [], isLoading: dealsLoading, isError: dealsError, refetch: refetchDeals } = useDeals();
  const activeDeals = deals.filter((d) => !["COMPLETED", "CANCELLED"].includes(d.status));

  const requestQueries = useQueries({
    queries: activeDeals.map((deal) => ({
      queryKey: ["deal", deal.id, "due-diligence"],
      queryFn: () => dealsApi.listDueDiligence(deal.id),
      enabled: activeDeals.length > 0,
    })),
  });

  const isLoading = dealsLoading || requestQueries.some((q) => q.isLoading);
  const isError = dealsError || requestQueries.some((q) => q.isError);
  const items: DueDiligenceItem[] = requestQueries.flatMap((q) => q.data ?? []).flatMap((req) => req.items);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("dueDiligencePageTitle")} description={t("dueDiligencePageDescription")} />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("dueDiligencePageTitle")} description={t("dueDiligencePageDescription")} />
        <ErrorState onRetry={() => refetchDeals()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("dueDiligencePageTitle")} description={t("dueDiligencePageDescription")} />

      {items.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={t("noDueDiligenceTitle")}
          description={t("noDueDiligenceDescription")}
        />
      ) : (
        <>
          {/* Progress Cards per Category */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => {
              const catItems = items.filter((i) => i.category === cat);
              const approved = catItems.filter((i) => i.status === "APPROVED").length;
              const pct = catItems.length > 0 ? Math.round((approved / catItems.length) * 100) : 0;

              return (
                <Card key={cat} className="border border-border/80 bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>{t(`categories.${dueDiligenceCategoryKey[cat]}`)}</span>
                    <span className="font-mono">{catItems.length > 0 ? `${pct}%` : "—"}</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {t("itemsVerifiedCount", { approved, total: catItems.length })}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Main Checklist */}
          <Card className="border border-border/80 bg-card">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base font-semibold">{t("activeAuditTasks")}</CardTitle>
              <CardDescription className="text-xs">{t("auditTasksDescription")}</CardDescription>
            </CardHeader>

            <CardContent className="divide-y divide-border/60 p-0">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] font-mono uppercase">
                        {t(`categories.${dueDiligenceCategoryKey[item.category] ?? item.category}`)}
                      </Badge>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                    </div>
                    {item.notes && <p className="text-[11px] text-muted-foreground">{item.notes}</p>}
                  </div>

                  <div className="shrink-0">
                    <Badge
                      variant={item.status === "APPROVED" ? "default" : "outline"}
                      className={cn(
                        "text-[10px] font-semibold",
                        item.status === "APPROVED" && "bg-emerald-600 dark:bg-emerald-500 text-white",
                      )}
                    >
                      {t(`status.${dueDiligenceStatusKey[item.status] ?? item.status}`)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
