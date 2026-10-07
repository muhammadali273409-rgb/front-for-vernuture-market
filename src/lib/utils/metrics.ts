import type {
  BusinessMetric,
  Deal,
  ListingVerificationBadge,
  MetricType,
  Offer,
  OwnedBusiness,
} from "@/types/domain";

/**
 * Single source of truth for the activity counters shown on the dashboard
 * overview and the analytics page. They used to be written out inline in both
 * pages, which let the two drift into disagreeing about the same number.
 */

/**
 * Deal rooms that are finished. DISPUTED is deliberately still active — a
 * dispute keeps the room open and needing attention.
 */
const TERMINAL_DEAL_STATUSES: readonly Deal["status"][] = ["COMPLETED", "CANCELLED"];

/** Offer statuses where one side still has to act. */
const OPEN_OFFER_STATUSES: readonly Offer["status"][] = ["SUBMITTED", "COUNTERED", "VIEWED"];

export function isActiveDeal(deal: Pick<Deal, "status">): boolean {
  return !TERMINAL_DEAL_STATUSES.includes(deal.status);
}

export function isPendingOffer(offer: Pick<Offer, "status">): boolean {
  return OPEN_OFFER_STATUSES.includes(offer.status);
}

/** A business counts as published only while its listing is actually PUBLISHED. */
export function countPublishedListings(businesses: OwnedBusiness[]): number {
  return businesses.filter((business) => business.listing?.status === "PUBLISHED").length;
}

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
