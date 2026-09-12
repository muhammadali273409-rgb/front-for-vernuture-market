"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "@/lib/api/subscriptions";
import { salesApi, type BusinessInquiryInput } from "@/lib/api/sales";
import { queryKeys } from "@/lib/query/keys";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { Subscription } from "@/types/domain";

export function useSubscription() {
  const { data: user } = useCurrentUser();

  return useQuery<Subscription | null>({
    queryKey: [...queryKeys.subscription, user?.id ?? null],
    queryFn: () => subscriptionApi.getCurrent(),
    enabled: Boolean(user),
    staleTime: 30 * 1000,
  });
}

export function useSelectFreePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.subscribe("FREE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionApi.resume(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
    },
  });
}

export function useContactSales() {
  return useMutation({
    mutationFn: (input: BusinessInquiryInput) => salesApi.submitInquiry(input),
  });
}
