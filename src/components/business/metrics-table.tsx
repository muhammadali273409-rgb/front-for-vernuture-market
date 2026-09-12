"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatMoney, formatDate } from "@/lib/utils/format";
import { metricVerificationStatusKey } from "@/lib/utils/labels";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import type { BusinessMetric } from "@/types/domain";

export function MetricsTable({ metrics }: { metrics: BusinessMetric[] }) {
  const { t, i18n } = useTranslation("business");
  const locale = i18n.language as Locale;

  if (metrics.length === 0) {
    return <EmptyState title={t("metric.noDataYet")} description={t("metric.noDataYetDescription")} />;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("metric.label")}</TableHead>
            <TableHead>{t("metric.value")}</TableHead>
            <TableHead>{t("metric.period")}</TableHead>
            <TableHead>{t("metric.verification")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics
            .slice()
            .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())
            .map((metric) => (
              <TableRow key={metric.id}>
                <TableCell className="font-medium">{metric.metricType}</TableCell>
                <TableCell>{formatMoney(metric.value, metric.currency, locale)}</TableCell>
                <TableCell>{formatDate(metric.period, locale)}</TableCell>
                <TableCell>
                  <Badge variant={metric.verificationStatus === "VERIFIED" ? "default" : "outline"}>
                    {t(`metric.verificationStatus.${metricVerificationStatusKey[metric.verificationStatus]}`)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
