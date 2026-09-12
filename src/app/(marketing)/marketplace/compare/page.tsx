"use client";

import Link from "next/link";
import {
  Scale,
  ArrowRight,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUiStore } from "@/stores/ui-store";
import { useListings } from "@/hooks/use-listings";
import { formatCompactMoney } from "@/lib/utils/format";
import { getMetricValue } from "@/lib/utils/metrics";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";

export default function ComparePage() {
  const { t, i18n } = useTranslation(["marketplace", "business"]);
  const locale = i18n.language as Locale;
  const { comparisonList, removeFromComparison, addToComparison, clearComparison } = useUiStore();
  const { data: suggestions } = useListings({});

  const selectedBusinesses = comparisonList;
  const comparedIds = new Set(selectedBusinesses.map((b) => b.id));
  const availableToAdd = (suggestions?.data ?? []).filter((b) => !comparedIds.has(b.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="size-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("comparePageTitle")}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("comparePageDescription")}</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedBusinesses.length > 0 && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={clearComparison}>
              {t("clearAll")}
            </Button>
          )}
          <Button asChild size="sm" className="h-8 text-xs font-semibold">
            <Link href="/marketplace">{t("browseMoreAssets")}</Link>
          </Button>
        </div>
      </div>

      {selectedBusinesses.length === 0 ? (
        <Card className="mt-12 border border-border/80 bg-card p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Scale className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">{t("noBusinessesSelected")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("selectUpToFour")}</p>
          <Button asChild className="mt-6 text-xs font-semibold" size="sm">
            <Link href="/marketplace">{t("exploreMarketplace")}</Link>
          </Button>
        </Card>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80">
                <th className="w-48 p-3 text-left font-bold uppercase text-muted-foreground">{t("metricCriteria")}</th>
                {selectedBusinesses.map((b) => (
                  <th key={b.id} className="w-64 p-3 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/marketplace/${b.slug}`} className="font-bold text-foreground hover:text-primary transition-colors">
                          {b.name}
                        </Link>
                        <p className="text-[11px] font-normal text-muted-foreground truncate max-w-[180px]">
                          {b.category} · {b.country}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromComparison(b.id)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={t("removeAriaLabel", { name: b.name })}
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {/* Asking Price */}
              <tr className="bg-muted/10">
                <td className="p-3 font-semibold text-muted-foreground">{t("business:askingPrice")}</td>
                {selectedBusinesses.map((b) => (
                  <td key={b.id} className="p-3 font-mono text-sm font-bold text-foreground">
                    {formatCompactMoney(b.askingPrice, b.currency, locale)}
                  </td>
                ))}
              </tr>

              {/* Verified MRR */}
              <tr>
                <td className="p-3 font-semibold text-muted-foreground">{t("verifiedMrr")}</td>
                {selectedBusinesses.map((b) => {
                  const mrr = getMetricValue(b.metrics, "MRR");
                  return (
                    <td key={b.id} className="p-3 font-mono font-medium text-foreground">
                      {mrr !== null ? `${formatCompactMoney(mrr, b.currency, locale)}${t("perMonth")}` : t("notDisclosed")}
                    </td>
                  );
                })}
              </tr>

              {/* Run-rate ARR */}
              <tr>
                <td className="p-3 font-semibold text-muted-foreground">{t("runRateArr")}</td>
                {selectedBusinesses.map((b) => {
                  const arr = getMetricValue(b.metrics, "ARR");
                  return (
                    <td key={b.id} className="p-3 font-mono font-medium text-foreground">
                      {arr !== null ? `${formatCompactMoney(arr, b.currency, locale)}${t("perYear")}` : t("notDisclosed")}
                    </td>
                  );
                })}
              </tr>

              {/* Valuation Multiple */}
              <tr className="bg-muted/10">
                <td className="p-3 font-semibold text-muted-foreground">{t("valuationMultiple")}</td>
                {selectedBusinesses.map((b) => {
                  const arr = getMetricValue(b.metrics, "ARR");
                  const multiple = b.askingPrice && arr ? (b.askingPrice / arr).toFixed(1) : null;
                  return (
                    <td key={b.id} className="p-3 font-mono font-bold text-primary">
                      {multiple ? `${multiple}${t("xArrSuffix")}` : t("notDisclosed")}
                    </td>
                  );
                })}
              </tr>

              {/* Annual Growth Rate */}
              <tr>
                <td className="p-3 font-semibold text-muted-foreground">{t("annualGrowth")}</td>
                {selectedBusinesses.map((b) => {
                  const growth = getMetricValue(b.metrics, "GROWTH");
                  return (
                    <td key={b.id} className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {growth !== null ? t("annualGrowthYoy", { growth }) : t("notDisclosed")}
                    </td>
                  );
                })}
              </tr>

              {/* Net Operating Profit */}
              <tr>
                <td className="p-3 font-semibold text-muted-foreground">{t("monthlyNetProfit")}</td>
                {selectedBusinesses.map((b) => {
                  const profit = getMetricValue(b.metrics, "PROFIT");
                  return (
                    <td key={b.id} className="p-3 font-mono font-medium text-foreground">
                      {profit !== null ? `${formatCompactMoney(profit, b.currency, locale)}${t("perMonth")}` : t("notDisclosed")}
                    </td>
                  );
                })}
              </tr>

              {/* Active Customers */}
              <tr className="bg-muted/10">
                <td className="p-3 font-semibold text-muted-foreground">{t("activeCustomers")}</td>
                {selectedBusinesses.map((b) => {
                  const customers = getMetricValue(b.metrics, "CUSTOMERS");
                  return (
                    <td key={b.id} className="p-3 font-mono font-medium text-foreground">
                      {customers !== null ? customers.toLocaleString() : t("notDisclosed")}
                    </td>
                  );
                })}
              </tr>

              {/* Direct Actions */}
              <tr className="bg-muted/20">
                <td className="p-3 font-semibold text-muted-foreground">{t("nextAction")}</td>
                {selectedBusinesses.map((b) => (
                  <td key={b.id} className="p-3 space-y-2">
                    <Button asChild size="sm" className="w-full text-xs font-semibold">
                      <Link href={`/marketplace/${b.slug}`}>
                        {t("viewAsset")}
                        <ArrowRight className="size-3 ml-1" />
                      </Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Add Available Assets Drawer */}
      {selectedBusinesses.length < 4 && availableToAdd.length > 0 && (
        <div className="mt-12 rounded-xl border border-border/80 bg-card p-5">
          <h3 className="text-sm font-bold text-foreground">{t("addMoreAssets")}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {availableToAdd.slice(0, 8).map((b) => (
              <button
                key={b.id}
                onClick={() => addToComparison(b)}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground hover:border-border hover:text-foreground transition-all"
              >
                <Plus className="size-3 text-primary" />
                <span className="font-semibold text-foreground">{b.name}</span>
                <span className="font-mono text-[10px]">({formatCompactMoney(b.askingPrice, b.currency, locale)})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
