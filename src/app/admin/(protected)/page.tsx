"use client";

import * as React from "react";
import { Briefcase, ShieldCheck, Users, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminBusinesses, useAdminAuditLogs, useAdminUsers, useApproveBusiness, useRejectBusiness } from "@/hooks/use-admin";
import { formatCompactMoney, formatRelativeTime } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const { t } = useTranslation("admin");
  const pendingBusinesses = useAdminBusinesses({ status: "PENDING_REVIEW", limit: 5 });
  const users = useAdminUsers({ limit: 1 });
  const auditLogs = useAdminAuditLogs({ limit: 6 });
  const approve = useApproveBusiness();
  const reject = useRejectBusiness();

  function handleApprove(id: string, name: string) {
    approve.mutate(
      { id },
      {
        onSuccess: () => toast.success(t("toastApproved") + `: ${name}`),
        onError: () => toast.error(t("unableToLoad")),
      },
    );
  }

  function handleReject(id: string, name: string) {
    reject.mutate(
      { id },
      {
        onSuccess: () => toast.success(t("toastRejected") + `: ${name}`),
        onError: () => toast.error(t("unableToLoad")),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("dashboardPage.title")} description={t("dashboardPage.description")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("businessesPage.title")}
          value={pendingBusinesses.data ? String(pendingBusinesses.data.data.length) : "—"}
          icon={Briefcase}
        />
        <StatCard label={t("verification")} icon={ShieldCheck} value="—" />
        <StatCard
          label={t("users")}
          value={users.data ? (users.data.pagination.hasMore ? "20+" : String(users.data.data.length)) : "—"}
          icon={Users}
        />
        <StatCard label={t("auditLogs")} icon={ScrollText} value={auditLogs.data ? String(auditLogs.data.data.length) : "—"} />
      </div>

      <Card className="border border-border/80 bg-card">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="text-base font-semibold">{t("businessesPage.title")}</CardTitle>
          <CardDescription className="text-xs">{t("businessesPage.description")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 text-xs">
          {pendingBusinesses.isError ? (
            <ErrorState error={pendingBusinesses.error} onRetry={() => pendingBusinesses.refetch()} />
          ) : pendingBusinesses.isLoading ? (
            <div className="p-6 text-center text-muted-foreground">{t("unableToLoad")}</div>
          ) : pendingBusinesses.data && pendingBusinesses.data.data.length > 0 ? (
            <div className="divide-y divide-border/60">
              {pendingBusinesses.data.data.map((business) => (
                <div key={business.id} className="flex items-center justify-between p-4">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-foreground">{business.name}</h4>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {business.owner.email}
                      {business.listing?.askingPrice != null &&
                        ` · ${formatCompactMoney(business.listing.askingPrice, business.listing.currency)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] text-emerald-600 hover:bg-emerald-500/10"
                      disabled={approve.isPending || reject.isPending}
                      onClick={() => handleApprove(business.id, business.name)}
                    >
                      {t("approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                      disabled={approve.isPending || reject.isPending}
                      onClick={() => handleReject(business.id, business.name)}
                    >
                      {t("reject")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Briefcase} title={t("empty.businesses")} />
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/80 bg-card">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="text-base font-semibold">{t("auditLogsPage.title")}</CardTitle>
          <CardDescription className="text-xs">{t("auditLogsPage.description")}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 p-0 text-xs font-mono">
          {auditLogs.isError ? (
            <ErrorState error={auditLogs.error} onRetry={() => auditLogs.refetch()} />
          ) : auditLogs.data && auditLogs.data.data.length > 0 ? (
            auditLogs.data.data.map((entry) => (
              <div key={entry.id} className="space-y-0.5 p-3">
                <span className="font-bold text-primary">[{entry.action}]</span>
                {entry.targetType && (
                  <p className="text-muted-foreground">
                    {entry.targetType} {entry.targetId}
                  </p>
                )}
                <span className="text-[10px] text-muted-foreground">{formatRelativeTime(entry.createdAt)}</span>
              </div>
            ))
          ) : (
            <EmptyState icon={ScrollText} title={t("empty.auditLogs")} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
