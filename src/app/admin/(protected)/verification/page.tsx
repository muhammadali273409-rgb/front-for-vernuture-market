"use client";

import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useAdminVerifications } from "@/hooks/use-admin";
import { formatDate } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";

export default function AdminVerificationPage() {
  const { t } = useTranslation("admin");
  const { data, isLoading, isError, error, refetch } = useAdminVerifications({ limit: 50 });

  return (
    <div className="space-y-6">
      <PageHeader title={t("verificationsPage.title")} description={t("verificationsPage.description")} />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && data && data.data.length === 0 ? (
        <EmptyState icon={ShieldCheck} title={t("empty.verifications")} />
      ) : (
        <div className="rounded-lg border border-border/80 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.business")}</TableHead>
                <TableHead>{t("columns.type")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.created")}</TableHead>
                <TableHead>{t("columns.expires")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.business.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.expiresAt ? formatDate(item.expiresAt) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
