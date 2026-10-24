import { apiFetch } from "@/lib/api/client";
import type {
  DueDiligenceCategory,
  DueDiligenceItem,
  DueDiligenceRequest,
  DueDiligenceStatus,
} from "@/types/domain";

export interface CreateDueDiligenceRequestInput {
  category: DueDiligenceCategory;
  title: string;
  /** One description per requested item (at least one). */
  items: string[];
}

export interface UpdateDueDiligenceItemInput {
  status: DueDiligenceStatus;
  /** Seller side only: a document of this business to share as evidence. */
  documentId?: string;
  /** Seller side only: written answer. */
  response?: string;
}

/**
 * `list` (GET /deals/{dealId}/due-diligence) lives on `dealsApi.listDueDiligence`.
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
