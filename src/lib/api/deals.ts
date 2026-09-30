import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { Deal, DealTask, DueDiligenceRequest } from "@/types/domain";

/** Swagger documents no fields for AddParticipantDto — verify against the backend source before relying on this shape. */
export interface AddParticipantInput {
  userId: string;
  role: string;
}

export const dealsApi = {
  list: (fetcher: ApiFetcher = apiFetch) => fetcher<Deal[]>("/deals"),

  getOne: (id: string, fetcher: ApiFetcher = apiFetch) => fetcher<Deal>(`/deals/${id}`),

  updateStatus: (id: string, status: string) =>
    apiFetch<Deal>(`/deals/${id}/status`, { method: "PATCH", body: { status } }),

  /** Buyer/seller signs the deal NDA; due diligence opens once both have. */
  signNda: (id: string) => apiFetch<Deal>(`/deals/${id}/nda/sign`, { method: "POST" }),

  /** Seller: the business has been handed over. */
  confirmTransfer: (id: string) => apiFetch<Deal>(`/deals/${id}/confirm-transfer`, { method: "POST" }),

  /** Buyer: the business was received — completes the deal. */
  confirmReceipt: (id: string) => apiFetch<Deal>(`/deals/${id}/confirm-receipt`, { method: "POST" }),

  addParticipant: (id: string, input: AddParticipantInput) =>
    apiFetch<Deal>(`/deals/${id}/participants`, { method: "POST", body: input }),

  createTask: (id: string, input: { title: string; description?: string; ownerId?: string; dueAt?: string }) =>
    apiFetch<DealTask>(`/deals/${id}/tasks`, { method: "POST", body: input }),

  listTasks: (id: string, fetcher: ApiFetcher = apiFetch) => fetcher<DealTask[]>(`/deals/${id}/tasks`),

  updateTaskStatus: (dealId: string, taskId: string, status: string) =>
    apiFetch<DealTask>(`/deals/${dealId}/tasks/${taskId}/status`, { method: "PATCH", body: { status } }),

  listDueDiligence: (dealId: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<DueDiligenceRequest[]>(`/deals/${dealId}/due-diligence`),
};
