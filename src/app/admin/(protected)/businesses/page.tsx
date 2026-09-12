"use client";

import { Briefcase } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useAdminBusinesses, useApproveBusiness, useRejectBusiness, useSuspendBusiness } from "@/hooks/use-admin";
import { formatCompactMoney, formatDate } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import { toast } from "sonner";

export default function AdminBusinessesPage() {
  const { t } = useTranslation("admin");
  const { data, isLoading, isError, error, refetch } = useAdminBusinesses({ limit: 50 });
  const approve = useApproveBusiness();
  const reject = useRejectBusiness();
  const suspend = useSuspendBusiness();
  const anyPending = approve.isPending || reject.isPending || suspend.isPending;

  function run(mutation: typeof approve, id: string, successKey: string) {
    mutation.mutate(
      { id },
      {
        onSuccess: () => toast.success(t(successKey)),
        onError: () => toast.error(t("unableToLoad")),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("businessesPage.title")} description={t("businessesPage.description")} />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && data && data.data.length === 0 ? (
        <EmptyState icon={Briefcase} title={t("empty.businesses")} />
      ) : (
        <div className="rounded-lg border border-border/80 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.business")}</TableHead>
                <TableHead>{t("columns.owner")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.askingPrice")}</TableHead>
                <TableHead>{t("columns.created")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.data ?? []).map((business) => (
                <TableRow key={business.id}>
                  <TableCell className="font-medium">{business.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{business.owner.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {business.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {business.listing?.askingPrice != null
                      ? formatCompactMoney(business.listing.askingPrice, business.listing.currency)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(business.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {business.status === "PENDING_REVIEW" ? (
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] text-emerald-600 hover:bg-emerald-500/10"
                          disabled={anyPending}
                          onClick={() => run(approve, business.id, "toastApproved")}
                        >
                          {t("approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                          disabled={anyPending}
                          onClick={() => run(reject, business.id, "toastRejected")}
                        >
                          {t("reject")}
                        </Button>
                      </div>
                    ) : business.status === "PUBLISHED" ? (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                          disabled={anyPending}
                          onClick={() => run(suspend, business.id, "toastSuspended")}
                        >
                          {t("suspend")}
                        </Button>
                      </div>
                    ) : null}
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
