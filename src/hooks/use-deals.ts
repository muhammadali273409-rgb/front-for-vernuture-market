"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dealsApi } from "@/lib/api/deals";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

export function useDeals() {
  return useQuery({
    queryKey: queryKeys.deals,
    queryFn: () => dealsApi.list(),
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: queryKeys.deal(id),
    queryFn: () => dealsApi.getOne(id),
    enabled: Boolean(id),
  });
}

export function useDueDiligence(dealId: string) {
  return useQuery({
    queryKey: queryKeys.dueDiligence(dealId),
    queryFn: () => dealsApi.listDueDiligence(dealId),
    enabled: Boolean(dealId),
  });
}

export function useUpdateDealStatus(dealId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["deals", "errors"]);
  return useMutation({
    mutationFn: (status: string) => dealsApi.updateStatus(dealId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deal(dealId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.deals });
      toast.success(t("toastStatusUpdated"));
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}

export function useUpdateTaskStatus(dealId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("errors");
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      dealsApi.updateTaskStatus(dealId, taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deal(dealId) });
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}
