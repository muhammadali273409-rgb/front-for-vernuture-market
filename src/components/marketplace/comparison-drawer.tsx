"use client";

import Link from "next/link";
import { Scale, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { formatCompactMoney } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";

export function ComparisonDrawer() {
  const { t, i18n } = useTranslation("marketplace");
  const locale = i18n.language as Locale;
  const { comparisonList, removeFromComparison, clearComparison } = useUiStore();

  if (comparisonList.length === 0) return null;

  const comparedBusinesses = comparisonList;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[95%] max-w-3xl -translate-x-1/2 transform rounded-xl border border-border/80 bg-card/95 p-3 shadow-xl backdrop-blur-md transition-all duration-300 sm:bottom-6 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Scale className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold sm:text-sm">
              {t("comparisonCount", { count: comparisonList.length })}
            </h4>
            <p className="text-[11px] text-muted-foreground">{t("comparisonDescription")}</p>
          </div>
        </div>

        {/* Selected business chips */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1 sm:py-0">
          {comparedBusinesses.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2 py-1 text-xs"
            >
              <span className="max-w-[100px] truncate font-medium">{b.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {formatCompactMoney(b.askingPrice, b.currency, locale)}
              </span>
              <button
                onClick={() => removeFromComparison(b.id)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={t("removeAriaLabel", { name: b.name })}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearComparison}
          >
            {t("common:clear")}
          </Button>
          <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold">
            <Link href="/marketplace/compare">
              <span>{t("compareNow")}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
