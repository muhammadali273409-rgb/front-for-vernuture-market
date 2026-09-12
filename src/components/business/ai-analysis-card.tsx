"use client";

import { ShieldAlert, Cpu, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCompactMoney, formatDate } from "@/lib/utils/format";
import { useAIAnalysis, useRequestAIAnalysis } from "@/hooks/use-ai-analysis";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";

interface AIAnalysisCardProps {
  businessId: string;
  currency?: string;
}

export function AIAnalysisCard({ businessId, currency = "USD" }: AIAnalysisCardProps) {
  const { t, i18n } = useTranslation("business");
  const locale = i18n.language as Locale;
  const { data: analysis, isLoading, isError } = useAIAnalysis(businessId);
  const requestAnalysis = useRequestAIAnalysis(businessId);

  return (
    <Card className="border border-border/80 bg-card">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Cpu className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{t("aiAnalysis.engineTitle")}</CardTitle>
              <CardDescription className="text-xs">{t("aiAnalysis.engineDescription")}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs font-semibold">
            {t("aiAnalysis.institutionalAudit")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>{t("aiAnalysis.analysisPending")}</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="size-6 text-destructive" />
            <p className="text-sm font-semibold text-foreground">{t("aiAnalysis.analysisFailedTitle")}</p>
            <Button size="sm" onClick={() => requestAnalysis.mutate()} disabled={requestAnalysis.isPending}>
              {t("aiAnalysis.retryAnalysis")}
            </Button>
          </div>
        ) : !analysis || analysis.status === "FAILED" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Sparkles className="size-6 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{t("aiAnalysis.notRunTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("aiAnalysis.notRunDescription")}</p>
            </div>
            <Button size="sm" onClick={() => requestAnalysis.mutate()} disabled={requestAnalysis.isPending}>
              {requestAnalysis.isPending && <Loader2 className="size-3.5 animate-spin" />}
              {t("aiAnalysis.runAnalysis")}
            </Button>
          </div>
        ) : analysis.status === "PENDING" || analysis.status === "RUNNING" ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>{t("aiAnalysis.analysisPending")}</span>
          </div>
        ) : (
          <>
            {analysis.summary && (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {t("aiAnalysis.executiveSynthesis")}
                </span>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{analysis.summary}</p>
              </div>
            )}

            {analysis.valuationEstimate !== null && (
              <div className="rounded-lg border border-border/60 bg-card p-3.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                  {t("aiAnalysis.estimatedFairValue")}
                </span>
                <div className="mt-1">
                  <span className="font-mono text-xl font-bold text-foreground">
                    {formatCompactMoney(analysis.valuationEstimate, currency, locale)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <ShieldAlert className="size-4" />
                <span>{t("aiAnalysis.riskFactorsTitle")}</span>
              </div>
              {analysis.riskFactors && analysis.riskFactors.length > 0 ? (
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {analysis.riskFactors.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 size-1 rounded-full bg-amber-500 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">{t("aiAnalysis.noRiskFactors")}</p>
              )}
            </div>

            {analysis.completedAt && (
              <p className="text-[11px] text-muted-foreground">
                {t("aiAnalysis.completedAt", { date: formatDate(analysis.completedAt, locale) })}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
