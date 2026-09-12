"use client";

import { Check, Minus } from "lucide-react";
import { useTranslation } from "@/i18n/client";

type Support = boolean;

interface ComparisonRow {
  key: string;
  free: Support;
  buyerPro: Support;
  sellerPro: Support;
  business: Support;
}

const ROWS: ComparisonRow[] = [
  { key: "browsing", free: true, buyerPro: true, sellerPro: true, business: true },
  { key: "watchlist", free: true, buyerPro: true, sellerPro: true, business: true },
  { key: "messaging", free: true, buyerPro: true, sellerPro: true, business: true },
  { key: "aiAnalysis", free: false, buyerPro: true, sellerPro: false, business: true },
  { key: "priorityNotifications", free: false, buyerPro: true, sellerPro: false, business: true },
  { key: "featuredListing", free: false, buyerPro: false, sellerPro: true, business: true },
  { key: "verificationSuite", free: false, buyerPro: false, sellerPro: true, business: true },
  { key: "buyerInsights", free: false, buyerPro: false, sellerPro: true, business: true },
  { key: "teamSeats", free: false, buyerPro: false, sellerPro: false, business: true },
];

function Cell({ supported }: { supported: boolean }) {
  return supported ? (
    <Check className="mx-auto size-4 text-primary" aria-label="yes" />
  ) : (
    <Minus className="mx-auto size-4 text-muted-foreground/40" aria-label="no" />
  );
}

export function ComparisonTable() {
  const { t } = useTranslation("pricing");

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("comparison.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("comparison.subtitle")}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/30">
              <th className="px-4 py-3 text-left font-semibold text-foreground">{t("comparison.feature")}</th>
              <th className="px-3 py-3 text-center font-semibold text-foreground">{t("plans.free.name")}</th>
              <th className="px-3 py-3 text-center font-semibold text-foreground">{t("plans.buyerPro.name")}</th>
              <th className="px-3 py-3 text-center font-semibold text-foreground">{t("plans.sellerPro.name")}</th>
              <th className="px-3 py-3 text-center font-semibold text-foreground">{t("plans.business.name")}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, idx) => (
              <tr key={row.key} className={idx % 2 === 1 ? "bg-muted/10" : undefined}>
                <td className="px-4 py-2.5 text-foreground">{t(`comparison.rows.${row.key}`)}</td>
                <td className="px-3 py-2.5">
                  <Cell supported={row.free} />
                </td>
                <td className="px-3 py-2.5">
                  <Cell supported={row.buyerPro} />
                </td>
                <td className="px-3 py-2.5">
                  <Cell supported={row.sellerPro} />
                </td>
                <td className="px-3 py-2.5">
                  <Cell supported={row.business} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
