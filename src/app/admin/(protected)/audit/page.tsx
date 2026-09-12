"use client";

import { ScrollText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useAdminAuditLogs } from "@/hooks/use-admin";
import { formatDate } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";

export default function AdminAuditLogPage() {
  const { t } = useTranslation("admin");
  const { data, isLoading, isError, error, refetch } = useAdminAuditLogs({ limit: 100 });

  return (
    <div className="space-y-6">
      <PageHeader title={t("auditLogsPage.title")} description={t("auditLogsPage.description")} />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && data && data.data.length === 0 ? (
        <EmptyState icon={ScrollText} title={t("empty.auditLogs")} />
      ) : (
        <div className="rounded-lg border border-border/80 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.action")}</TableHead>
                <TableHead>{t("columns.target")}</TableHead>
                <TableHead>{t("columns.ipAddress")}</TableHead>
                <TableHead>{t("columns.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-[11px] font-medium">{entry.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {entry.targetType ? `${entry.targetType} · ${entry.targetId?.slice(0, 8)}` : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{entry.ipAddress ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
