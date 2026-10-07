import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type {
  OwnedBusiness,
  OwnedListing,
  BusinessMetric,
  BusinessImage,
  BusinessImageKind,
} from "@/types/domain";

export interface CreateBusinessInput {
  name: string;
  description?: string;
  categoryId?: string;
  businessModel?: string;
  foundedAt?: string;
  country?: string;
  city?: string;
  website?: string;
  organizationId?: string;
  /** Listing fields, so a project can be created complete in one request. */
  headline?: string;
  askingPrice?: number;
  currency?: string;
  /** Stored by the backend as a REVENUE metric for the current year. */
  annualRevenue?: number;
}

/** Price/headline are edited via updateListing and revenue via addMetric. */
export type UpdateBusinessInput = Partial<
  Omit<CreateBusinessInput, "headline" | "askingPrice" | "currency" | "annualRevenue">
>;

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

  /** DRAFT/REJECTED → PUBLISHED: live on the marketplace immediately. PAUSED → PUBLISHED too. */
  publish: (id: string) =>
    apiFetch<OwnedBusiness>(`/businesses/${id}/publish`, { method: "POST" }),

  /** Optional manual-review path: DRAFT/REJECTED → PENDING_REVIEW. */
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

  /** JPEG/PNG/WebP up to 5MB. A new LOGO replaces the previous one. */
  uploadImage: (id: string, file: File, kind: BusinessImageKind) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    return apiFetch<BusinessImage>(`/businesses/${id}/images`, { method: "POST", body: formData });
  },

  deleteImage: (id: string, imageId: string) =>
    apiFetch<{ success: boolean }>(`/businesses/${id}/images/${imageId}`, { method: "DELETE" }),

  remove: (id: string) => apiFetch<void>(`/businesses/${id}`, { method: "DELETE" }),
};
