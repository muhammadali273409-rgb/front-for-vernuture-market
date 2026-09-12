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

  publish: (id: string) =>
    apiFetch<OwnedListing>(`/businesses/${id}/publish`, { method: "POST" }),

  unpublish: (id: string) =>
    apiFetch<OwnedListing>(`/businesses/${id}/unpublish`, { method: "POST" }),

  addMetric: (id: string, input: CreateMetricInput) =>
    apiFetch<BusinessMetric>(`/businesses/${id}/metrics`, { method: "POST", body: input }),
};
