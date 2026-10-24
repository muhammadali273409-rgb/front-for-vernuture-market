import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { Agreement, AgreementSignature, AgreementVersion } from "@/types/domain";

export interface CreateAgreementInput {
  title: string;
}

/** A version is an uploaded deal document (PDF) and/or an external link. */
export interface CreateAgreementVersionInput {
  documentId?: string;
  contentUrl?: string;
  /** SHA-256 hex of the file, so both sides can prove which file they signed. */
  contentHash?: string;
}

export const agreementsApi = {
  /** Newest agreement first; each agreement's versions newest first. */
  list: (dealId: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<Agreement[]>(`/deals/${dealId}/agreements`),

  create: (dealId: string, input: CreateAgreementInput) =>
    apiFetch<Agreement>(`/deals/${dealId}/agreements`, { method: "POST", body: input }),

  addVersion: (dealId: string, agreementId: string, input: CreateAgreementVersionInput) =>
    apiFetch<AgreementVersion>(`/deals/${dealId}/agreements/${agreementId}/versions`, {
      method: "POST",
      body: input,
    }),

  /** Once buyer and seller have both signed the latest version, the deal moves to TRANSACTION. */
  sign: (dealId: string, agreementId: string, versionId: string) =>
    apiFetch<AgreementSignature>(`/deals/${dealId}/agreements/${agreementId}/versions/${versionId}/sign`, {
      method: "POST",
    }),
};
