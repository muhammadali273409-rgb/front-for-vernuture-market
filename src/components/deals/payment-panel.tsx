"use client";

import { CheckCircle2, Circle, CreditCard, Landmark } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatMoney } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import type { Deal, PaymentConfig, Transaction } from "@/types/domain";

interface PaymentPanelProps {
  deal: Deal;
  transaction: Transaction | null | undefined;
  config: PaymentConfig | undefined;
}

function Milestone({ done, label, at, locale }: { done: boolean; label: string; at?: string | null; locale: Locale }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {done ? (
        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Circle className="size-4 text-muted-foreground" />
      )}
      <span className={done ? "font-medium text-foreground" : "text-muted-foreground"}>{label}</span>
      {done && at && <span className="text-[11px] text-muted-foreground">· {formatDateTime(at, locale)}</span>}
    </li>
  );
}

/** Read-only status of payment and hand-over; the buttons live in the next-step panel. */
export function PaymentPanel({ deal, transaction, config }: PaymentPanelProps) {
  const { t, i18n } = useTranslation("deals");
  const locale = i18n.language as Locale;
  const provider = transaction?.provider ?? config?.provider;
  const amount = transaction?.amount ?? deal.acceptedOffer?.amount;
  const currency = transaction?.currency ?? deal.acceptedOffer?.currency ?? "USD";
  const eventAt = (type: string) => transaction?.events?.find((e) => e.type === type)?.createdAt;
  const paid = transaction?.status === "COMPLETED" || ["TRANSFER", "COMPLETED"].includes(deal.status);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border border-border/80 bg-card">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            {provider === "stripe" ? <CreditCard className="size-4" /> : <Landmark className="size-4" />}
            {t("flow.payment.title")}
          </CardTitle>
          <CardDescription className="text-xs">
            {provider === "stripe" ? t("flow.payment.stripeHelp") : t("flow.payment.manualHelp")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("flow.payment.amount")}</span>
            <span className="font-mono text-sm font-semibold">
              {amount != null ? formatMoney(amount, currency, locale) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("flow.payment.status")}</span>
            <Badge variant="outline" className="text-[10px]" data-testid="payment-status">
              {paid
                ? t("flow.transactionStatus.COMPLETED")
                : transaction
                  ? t(`flow.transactionStatus.${transaction.status}`)
                  : t("flow.payment.notStarted")}
            </Badge>
          </div>
          {provider === "manual" && config?.manualInstructions && deal.status === "TRANSACTION" && (
            <div className="whitespace-pre-line rounded-md border border-border/60 bg-muted/30 p-3 text-xs">
              {config.manualInstructions}
            </div>
          )}
          <ul className="space-y-1.5">
            {provider === "manual" ? (
              <>
                <Milestone
                  done={Boolean(eventAt("BUYER_MARKED_PAID")) || paid}
                  at={eventAt("BUYER_MARKED_PAID")}
                  label={t("flow.payment.buyerMarked")}
                  locale={locale}
                />
                <Milestone
                  done={paid}
                  at={eventAt("ADMIN_CONFIRMED_PAYMENT")}
                  label={t("flow.payment.adminConfirmed")}
                  locale={locale}
                />
              </>
            ) : (
              <Milestone done={paid} label={t("flow.payment.providerConfirmed")} locale={locale} />
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="border border-border/80 bg-card">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-base font-semibold">{t("flow.transfer.title")}</CardTitle>
          <CardDescription className="text-xs">{t("flow.transfer.description")}</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <ul className="space-y-1.5">
            <Milestone
              done={Boolean(deal.sellerTransferConfirmedAt)}
              at={deal.sellerTransferConfirmedAt}
              label={t("flow.transfer.sellerHandedOver")}
              locale={locale}
            />
            <Milestone
              done={Boolean(deal.buyerReceiptConfirmedAt)}
              at={deal.buyerReceiptConfirmedAt}
              label={t("flow.transfer.buyerReceived")}
              locale={locale}
            />
            <Milestone done={deal.status === "COMPLETED"} label={t("flow.transfer.completed")} locale={locale} />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
