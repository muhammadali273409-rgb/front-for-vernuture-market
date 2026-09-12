"use client";

import * as React from "react";
import { BarChart3, LineChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCompactMoney } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import { cn } from "@/lib/utils";
import type { BusinessMetric } from "@/types/domain";

interface FinancialChartsProps {
  metrics: BusinessMetric[];
  currency?: string;
}

export function FinancialCharts({ metrics, currency = "USD" }: FinancialChartsProps) {
  const { t, i18n } = useTranslation("business");
  const locale = i18n.language as Locale;

  const mrrPointsByPeriod = React.useMemo(() => {
    const map = new Map<string, { mrr?: number; profit?: number }>();
    for (const m of metrics) {
      if (m.metricType !== "MRR" && m.metricType !== "PROFIT") continue;
      const entry = map.get(m.period) ?? {};
      if (m.metricType === "MRR") entry.mrr = m.value;
      if (m.metricType === "PROFIT") entry.profit = m.value;
      map.set(m.period, entry);
    }
    return Array.from(map.entries())
      .filter(([, v]) => v.mrr !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, v]) => ({ period, mrr: v.mrr!, profit: v.profit }));
  }, [metrics]);

  const [activeHoverIdx, setActiveHoverIdx] = React.useState<number | null>(mrrPointsByPeriod.length - 1);

  if (mrrPointsByPeriod.length < 2) {
    return (
      <Card className="border border-border/80 bg-card">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <CardTitle className="text-base font-semibold">{t("financialChart.verifiedFinancialPerformance")}</CardTitle>
          </div>
          <CardDescription className="text-xs">{t("financialChart.trailingRevenueDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <EmptyState
            icon={LineChart}
            title={t("financialChart.notEnoughDataTitle")}
            description={t("financialChart.notEnoughDataDescription")}
          />
        </CardContent>
      </Card>
    );
  }

  const dataPoints = mrrPointsByPeriod;
  const maxMrr = Math.max(...dataPoints.map((d) => d.mrr)) * 1.15;
  const chartHeight = 180;
  const chartWidth = 540;

  const mrrPoints = dataPoints
    .map((d, i) => {
      const x = (i / (dataPoints.length - 1)) * chartWidth;
      const y = chartHeight - (d.mrr / maxMrr) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const hasProfitSeries = dataPoints.every((d) => d.profit !== undefined);
  const profitPoints = hasProfitSeries
    ? dataPoints
        .map((d, i) => {
          const x = (i / (dataPoints.length - 1)) * chartWidth;
          const y = chartHeight - (d.profit! / maxMrr) * chartHeight;
          return `${x},${y}`;
        })
        .join(" ")
    : null;

  const activeData = activeHoverIdx !== null ? dataPoints[activeHoverIdx] : dataPoints[dataPoints.length - 1];

  return (
    <Card className="overflow-hidden border border-border/80 bg-card">
      <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <CardTitle className="text-base font-semibold">{t("financialChart.verifiedFinancialPerformance")}</CardTitle>
          </div>
          <CardDescription className="text-xs">{t("financialChart.trailingRevenueDescription")}</CardDescription>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-medium uppercase text-muted-foreground">{t("financialChart.currentMrr")}</span>
            <p className="font-mono text-base font-bold text-foreground">
              {formatCompactMoney(activeData.mrr, currency, locale)}
            </p>
          </div>
          {activeData.profit !== undefined && (
            <>
              <div className="h-7 w-px bg-border/60" />
              <div className="text-right">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">{t("financialChart.netMargin")}</span>
                <p className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round((activeData.profit / activeData.mrr) * 100)}%
                </p>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="relative">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-44 w-full overflow-visible"
            preserveAspectRatio="none"
          >
            {[0.25, 0.5, 0.75, 1.0].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                y1={chartHeight * (1 - ratio)}
                x2={chartWidth}
                y2={chartHeight * (1 - ratio)}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
              />
            ))}

            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <polygon points={`0,${chartHeight} ${mrrPoints} ${chartWidth},${chartHeight}`} fill="url(#mrrGrad)" />

            <polyline
              points={mrrPoints}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {profitPoints && (
              <polyline
                points={profitPoints}
                fill="none"
                stroke="var(--success)"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {dataPoints.map((d, i) => {
              const x = (i / (dataPoints.length - 1)) * chartWidth;
              const y = chartHeight - (d.mrr / maxMrr) * chartHeight;
              const isActive = activeHoverIdx === i;

              return (
                <g key={i} className="cursor-pointer" onMouseEnter={() => setActiveHoverIdx(i)}>
                  {isActive && (
                    <line x1={x} y1="0" x2={x} y2={chartHeight} stroke="var(--primary)" strokeOpacity="0.4" strokeWidth="1.5" />
                  )}
                  <circle cx={x} cy={y} r={isActive ? 5 : 3} fill="var(--card)" stroke="var(--primary)" strokeWidth={isActive ? 3 : 2} />
                </g>
              );
            })}
          </svg>

          <div className="mt-2 flex justify-between text-[11px] font-mono text-muted-foreground">
            {dataPoints.map((d, i) => (
              <span
                key={i}
                className={cn("cursor-pointer transition-colors", activeHoverIdx === i && "font-bold text-foreground")}
                onMouseEnter={() => setActiveHoverIdx(i)}
              >
                {d.period}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-3.5 py-2 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-primary" />
              <span className="font-medium text-foreground">{t("financialChart.grossMrr")}</span>
            </div>
            {hasProfitSeries && (
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">{t("financialChart.netOperatingProfit")}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>
              <strong className="text-muted-foreground">{t("financialChart.selectedLabel")}</strong> {activeData.period}
            </span>
            <span>
              <strong className="text-muted-foreground">{t("financialChart.mrrLabel")}</strong> {formatCompactMoney(activeData.mrr, currency, locale)}
            </span>
            {activeData.profit !== undefined && (
              <span>
                <strong className="text-muted-foreground">{t("financialChart.profitLabel")}</strong> {formatCompactMoney(activeData.profit, currency, locale)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
