import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { AIAnalysis } from "@/types/domain";

export const aiApi = {
  getAnalysis: (businessId: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<AIAnalysis>(`/businesses/${businessId}/ai-analysis`),

  requestAnalysis: (businessId: string) =>
    apiFetch<AIAnalysis>(`/businesses/${businessId}/ai-analysis`, { method: "POST" }),

  getJob: (jobId: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<AIAnalysis>(`/ai-jobs/${jobId}`),
};
