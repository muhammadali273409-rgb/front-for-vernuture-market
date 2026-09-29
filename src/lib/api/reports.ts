import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { Report, ReportTargetType } from "@/types/domain";

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}

export const reportsApi = {
  listOwn: (fetcher: ApiFetcher = apiFetch) => fetcher<Report[]>("/reports"),

  create: (input: CreateReportInput) => apiFetch<Report>("/reports", { method: "POST", body: input }),
};
