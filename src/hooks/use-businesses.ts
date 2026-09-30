import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  businessesApi,
  type CreateBusinessInput,
  type UpdateBusinessInput,
  type UpdateListingInput,
  type CreateMetricInput,
} from "@/lib/api/businesses";
import { queryKeys } from "@/lib/query/keys";

export function useMyBusinesses({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.myBusinesses,
    queryFn: () => businessesApi.listMine(),
    enabled,
  });
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: queryKeys.business(id),
    queryFn: () => businessesApi.getOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBusinessInput) => businessesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
    },
  });
}

export function useUpdateBusiness(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBusinessInput) => businessesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
    },
  });
}

export function useUpdateListing(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateListingInput) => businessesApi.updateListing(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business(id) });
    },
  });
}

export type ListingStatusAction = "submitForReview" | "withdrawSubmission" | "unpublish" | "resume";

/** Seller-driven listing lifecycle moves; the backend decides whether each is allowed. */
export function useListingStatusAction(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: ListingStatusAction) => businessesApi[action](id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
    },
  });
}

export function useAddMetric(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMetricInput) => businessesApi.addMetric(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business(id) });
    },
  });
}
