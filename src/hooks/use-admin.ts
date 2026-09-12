"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, type AdminCursorParams } from "@/lib/api/admin";
import { queryKeys } from "@/lib/query/keys";
import type { BusinessStatus } from "@/types/domain";

export function useAdminUsers(params: AdminCursorParams = {}) {
  return useQuery({
    queryKey: queryKeys.adminUsers(params.cursor),
    queryFn: () => adminApi.listUsers(params),
  });
}

export function useAdminBusinesses(params: AdminCursorParams & { status?: BusinessStatus } = {}) {
  return useQuery({
    queryKey: queryKeys.adminBusinesses(params.status, params.cursor),
    queryFn: () => adminApi.listBusinesses(params),
  });
}

export function useAdminVerifications(params: AdminCursorParams = {}) {
  return useQuery({
    queryKey: queryKeys.adminVerifications(params.cursor),
    queryFn: () => adminApi.listVerifications(params),
  });
}

export function useAdminReports(params: AdminCursorParams = {}) {
  return useQuery({
    queryKey: queryKeys.adminReports(params.cursor),
    queryFn: () => adminApi.listReports(params),
  });
}

export function useAdminAuditLogs(params: AdminCursorParams = {}) {
  return useQuery({
    queryKey: queryKeys.adminAuditLogs(params.cursor),
    queryFn: () => adminApi.listAuditLogs(params),
  });
}

function useBusinessModerationMutation(action: (id: string, reason?: string) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => action(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
    },
  });
}

export function useApproveBusiness() {
  return useBusinessModerationMutation(adminApi.approveBusiness);
}

export function useRejectBusiness() {
  return useBusinessModerationMutation(adminApi.rejectBusiness);
}

export function useSuspendBusiness() {
  return useBusinessModerationMutation(adminApi.suspendBusiness);
}
