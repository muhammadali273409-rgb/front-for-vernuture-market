"use client";

import * as React from "react";
import { Landmark } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
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
import { useAdminTransactions, useConfirmTransaction, useRejectTransaction } from "@/hooks/use-admin";
import type { AdminTransaction } from "@/lib/api/admin";
import { friendlyErrorMessage } from "@/lib/api/error";
import { formatDateTime, formatMoney } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import type { TransactionStatus } from "@/types/domain";

const FILTERS = ["PROCESSING", "PENDING", "COMPLETED"] as const satisfies TransactionStatus[];

/**
 * Manual deal payments (PAYMENT_PROVIDER=manual). The buyer marks "I have
 * paid"; confirming here is what moves the deal from payment to handover.
 */
export default function AdminPaymentsPage() {
  const { t } = useTranslation(["admin", "deals"]);
  const [status, setStatus] = React.useState<TransactionStatus>("PROCESSING");
  const { data = [], isLoading, isError, error, refetch } = useAdminTransactions(status);
  const confirm = useConfirmTransaction();
  const reject = useRejectTransaction();
  const [pending, setPending] = React.useState<{ tx: AdminTransaction; kind: "confirm" | "reject" } | null>(null);
  const busy = confirm.isPending || reject.isPending;

  function decide() {
    if (!pending) return;
    const mutation = pending.kind === "confirm" ? confirm : reject;
    mutation.mutate(pending.tx.id, {
      onSuccess: () =>
        toast.success(t(pending.kind === "confirm" ? "paymentsPage.toastConfirmed" : "paymentsPage.toastRejected")),
      onError: (err) => toast.error(friendlyErrorMessage(err, t)),
    });
    setPending(null);
  }

  const party = (tx: AdminTransaction, role: "BUYER" | "SELLER") =>
    tx.deal.participants.find((p) => p.role === role)?.user.email ?? "—";
  const reference = (tx: AdminTransaction) => {
    const marked = tx.events?.find((e) => e.type === "BUYER_MARKED_PAID");
    const ref = marked?.metadata?.reference;
    return { at: marked?.createdAt, ref: typeof ref === "string" ? ref : null };
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("paymentsPage.title")} description={t("paymentsPage.description")} />

      <Tabs value={status} onValueChange={(v) => setStatus(v as TransactionStatus)}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f}>
              {t(`deals:flow.transactionStatus.${f}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !isLoading && data.length === 0 ? (
        <EmptyState icon={Landmark} title={t("paymentsPage.empty")} />
      ) : (
        <div className="rounded-lg border border-border/80 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.business")}</TableHead>
                <TableHead>{t("paymentsPage.buyer")}</TableHead>
                <TableHead>{t("paymentsPage.seller")}</TableHead>
                <TableHead>{t("paymentsPage.amount")}</TableHead>
                <TableHead>{t("paymentsPage.markedPaid")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((tx) => {
                const marked = reference(tx);
                return (
                  <TableRow key={tx.id} data-testid="admin-payment-row">
                    <TableCell className="font-medium">
                      {tx.deal.business.name}
                      <div className="font-mono text-[10px] text-muted-foreground">{tx.deal.id}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{party(tx, "BUYER")}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{party(tx, "SELLER")}</TableCell>
                    <TableCell className="font-mono text-xs">{formatMoney(tx.amount, tx.currency)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {marked.at ? formatDateTime(marked.at) : "—"}
                      {marked.ref && <div className="font-mono text-[10px]">{marked.ref}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {t(`deals:flow.transactionStatus.${tx.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {tx.status === "PROCESSING" && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="h-7 text-[11px]"
                            disabled={busy}
                            onClick={() => setPending({ tx, kind: "confirm" })}
                            data-testid="admin-confirm-payment"
                          >
                            {t("paymentsPage.confirm")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                            disabled={busy}
                            onClick={() => setPending({ tx, kind: "reject" })}
                          >
                            {t("paymentsPage.reject")}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.kind === "confirm" ? t("paymentsPage.confirmTitle") : t("paymentsPage.rejectTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending &&
                t(pending.kind === "confirm" ? "paymentsPage.confirmDescription" : "paymentsPage.rejectDescription", {
                  amount: formatMoney(pending.tx.amount, pending.tx.currency),
                  business: pending.tx.deal.business.name,
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deals:flow.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={decide} data-testid="admin-confirm-payment-dialog">
              {pending?.kind === "confirm" ? t("paymentsPage.confirm") : t("paymentsPage.reject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
