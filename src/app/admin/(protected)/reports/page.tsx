"use client";

import { Flag } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useAdminReports } from "@/hooks/use-admin";
import { formatDate } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";

export default function AdminReportsPage() {
  const { t } = useTranslation("admin");
  const { data, isLoading, isError, error, refetch } = useAdminReports({ limit: 50 });

  return (
    <div className="space-y-6">
      <PageHeader title={t("reportsPage.title")} description={t("reportsPage.description")} />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && data && data.data.length === 0 ? (
        <EmptyState icon={Flag} title={t("empty.reports")} />
      ) : (
        <div className="rounded-lg border border-border/80 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.target")}</TableHead>
                <TableHead>{t("columns.reason")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.created")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {report.targetType} · {report.targetId.slice(0, 8)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs">{report.reason}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
