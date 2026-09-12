import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { Deal, DealTask, DueDiligenceRequest } from "@/types/domain";

export const dealsApi = {
  list: (fetcher: ApiFetcher = apiFetch) => fetcher<Deal[]>("/deals"),

  getOne: (id: string, fetcher: ApiFetcher = apiFetch) => fetcher<Deal>(`/deals/${id}`),

  updateStatus: (id: string, status: string) =>
    apiFetch<Deal>(`/deals/${id}/status`, { method: "PATCH", body: { status } }),

  createTask: (id: string, input: { title: string; description?: string; ownerId?: string; dueAt?: string }) =>
    apiFetch<DealTask>(`/deals/${id}/tasks`, { method: "POST", body: input }),

  updateTaskStatus: (dealId: string, taskId: string, status: string) =>
    apiFetch<DealTask>(`/deals/${dealId}/tasks/${taskId}/status`, { method: "PATCH", body: { status } }),

  listDueDiligence: (dealId: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<DueDiligenceRequest[]>(`/deals/${dealId}/due-diligence`),
};
