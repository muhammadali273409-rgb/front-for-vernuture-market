import { apiFetch } from "@/lib/api/client";
import type { DueDiligenceItem, DueDiligenceRequest, DueDiligenceStatus } from "@/types/domain";

export interface CreateDueDiligenceRequestInput {
  title: string;
  items?: { category: string; title: string }[];
}

export interface UpdateDueDiligenceItemInput {
  status: DueDiligenceStatus;
  notes?: string;
}

/**
 * `list` (GET /deals/{dealId}/due-diligence) already lives on `dealsApi.listDueDiligence` —
 * kept there to avoid churning existing call sites. This module covers the two
 * write endpoints that weren't implemented yet.
 */
export const dueDiligenceApi = {
  create: (dealId: string, input: CreateDueDiligenceRequestInput) =>
    apiFetch<DueDiligenceRequest>(`/deals/${dealId}/due-diligence`, { method: "POST", body: input }),

  updateItem: (dealId: string, itemId: string, input: UpdateDueDiligenceItemInput) =>
    apiFetch<DueDiligenceItem>(`/deals/${dealId}/due-diligence/items/${itemId}`, {
      method: "PATCH",
      body: input,
    }),
};
