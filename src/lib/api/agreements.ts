import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { Agreement } from "@/types/domain";

export interface CreateAgreementInput {
  title: string;
  type?: string;
}

/** Swagger documents no fields for CreateAgreementVersionDto — verify against the backend source before relying on this shape. */
export interface CreateAgreementVersionInput {
  content: string;
}

export const agreementsApi = {
  list: (dealId: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<Agreement[]>(`/deals/${dealId}/agreements`),

  create: (dealId: string, input: CreateAgreementInput) =>
    apiFetch<Agreement>(`/deals/${dealId}/agreements`, { method: "POST", body: input }),

  addVersion: (dealId: string, agreementId: string, input: CreateAgreementVersionInput) =>
    apiFetch<Agreement>(`/deals/${dealId}/agreements/${agreementId}/versions`, {
      method: "POST",
      body: input,
    }),

  sign: (dealId: string, agreementId: string, versionId: string) =>
    apiFetch<Agreement>(`/deals/${dealId}/agreements/${agreementId}/versions/${versionId}/sign`, {
      method: "POST",
    }),
};
