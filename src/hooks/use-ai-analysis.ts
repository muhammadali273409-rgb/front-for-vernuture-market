"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiApi } from "@/lib/api/ai";
import { queryKeys } from "@/lib/query/keys";
import { ApiError } from "@/lib/api/error";

export function useAIAnalysis(businessId: string) {
  return useQuery({
    queryKey: queryKeys.aiAnalysis(businessId),
    queryFn: async () => {
      try {
        return await aiApi.getAnalysis(businessId);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(businessId),
  });
}

export function useRequestAIAnalysis(businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => aiApi.requestAnalysis(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiAnalysis(businessId) });
    },
  });
}
