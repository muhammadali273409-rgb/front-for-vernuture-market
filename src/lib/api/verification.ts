import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { VerificationStatus, VerificationSubmission, VerificationType } from "@/types/domain";

/** Swagger documents no fields for SubmitVerificationDto — verify against the backend source before relying on this shape. */
export interface SubmitVerificationInput {
  type: VerificationType;
  evidence?: Record<string, unknown>;
}

/** Swagger documents no fields for ReviewVerificationDto — verify against the backend source before relying on this shape. */
export interface ReviewVerificationInput {
  status: VerificationStatus;
  reason?: string;
}

export const verificationApi = {
  listForBusiness: (businessId: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<VerificationSubmission[]>(`/businesses/${businessId}/verification`),

  submit: (businessId: string, input: SubmitVerificationInput) =>
    apiFetch<VerificationSubmission>(`/businesses/${businessId}/verification`, {
      method: "POST",
      body: input,
    }),

  review: (id: string, input: ReviewVerificationInput) =>
    apiFetch<VerificationSubmission>(`/verification/${id}/review`, { method: "PATCH", body: input }),
};
