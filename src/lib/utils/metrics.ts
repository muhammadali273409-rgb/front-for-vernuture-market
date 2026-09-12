import type { BusinessMetric, ListingVerificationBadge, MetricType } from "@/types/domain";

/** Latest verified value for a metric type, or null if the seller hasn't disclosed it. */
export function getMetricValue(metrics: BusinessMetric[] | undefined, type: MetricType): number | null {
  if (!metrics || metrics.length === 0) return null;
  const matches = metrics.filter((m) => m.metricType === type);
  if (matches.length === 0) return null;
  return matches[matches.length - 1].value;
}

/** Share of a listing's verification badges that are actually VERIFIED, as a whole percentage. */
export function verificationScore(verifications: ListingVerificationBadge[] | undefined): number | null {
  if (!verifications || verifications.length === 0) return null;
  const verified = verifications.filter((v) => v.status === "VERIFIED").length;
  return Math.round((verified / verifications.length) * 100);
}
