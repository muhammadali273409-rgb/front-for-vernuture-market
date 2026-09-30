import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { OwnedBusiness, OwnedListing, BusinessMetric } from "@/types/domain";

export interface CreateBusinessInput {
  name: string;
  description?: string;
  categoryId?: string;
  businessModel?: string;
  foundedAt?: string;
  country?: string;
  website?: string;
  organizationId?: string;
}

export type UpdateBusinessInput = Partial<CreateBusinessInput>;

export interface UpdateListingInput {
  headline?: string;
  askingPrice?: number;
  currency?: string;
  visibility?: "PUBLIC" | "UNLISTED" | "PRIVATE";
}

export interface CreateMetricInput {
  metricType: string;
  value: number;
  currency?: string;
  period: string;
  source?: string;
}

export const businessesApi = {
  listMine: (fetcher: ApiFetcher = apiFetch) => fetcher<OwnedBusiness[]>("/businesses"),

  getOne: (id: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<OwnedBusiness>(`/businesses/${id}`),

  create: (input: CreateBusinessInput) =>
    apiFetch<OwnedBusiness>("/businesses", { method: "POST", body: input }),

  update: (id: string, input: UpdateBusinessInput) =>
    apiFetch<OwnedBusiness>(`/businesses/${id}`, { method: "PATCH", body: input }),

  updateListing: (id: string, input: UpdateListingInput) =>
    apiFetch<OwnedListing>(`/businesses/${id}/listing`, { method: "PATCH", body: input }),

  /** DRAFT/REJECTED → PENDING_REVIEW. Only an admin can then publish it. */
  submitForReview: (id: string) =>
    apiFetch<OwnedBusiness>(`/businesses/${id}/submit-review`, { method: "POST" }),

  /** PENDING_REVIEW → DRAFT, to keep editing. */
  withdrawSubmission: (id: string) =>
    apiFetch<OwnedBusiness>(`/businesses/${id}/withdraw-submission`, { method: "POST" }),

  /** PUBLISHED → PAUSED. */
  unpublish: (id: string) =>
    apiFetch<OwnedBusiness>(`/businesses/${id}/unpublish`, { method: "POST" }),

  /** PAUSED → PUBLISHED (refused while a deal on the business is active). */
  resume: (id: string) =>
    apiFetch<OwnedBusiness>(`/businesses/${id}/resume`, { method: "POST" }),

  addMetric: (id: string, input: CreateMetricInput) =>
    apiFetch<BusinessMetric>(`/businesses/${id}/metrics`, { method: "POST", body: input }),

  remove: (id: string) => apiFetch<void>(`/businesses/${id}`, { method: "DELETE" }),
};
