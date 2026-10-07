import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  businessesApi,
  type CreateBusinessInput,
  type UpdateBusinessInput,
  type UpdateListingInput,
  type CreateMetricInput,
} from "@/lib/api/businesses";
import { queryKeys } from "@/lib/query/keys";
import type { BusinessImageKind } from "@/types/domain";

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

export type ListingStatusAction =
  | "publish"
  | "submitForReview"
  | "withdrawSubmission"
  | "unpublish"
  | "resume";

/** Invalidates everything a listing's status change can affect, marketplace included. */
function invalidateAfterStatusChange(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.business(id) });
  queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
  queryClient.invalidateQueries({ queryKey: ["listings"] });
}

/** Seller-driven listing lifecycle moves; the backend decides whether each is allowed. */
export function useListingStatusAction(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: ListingStatusAction) => businessesApi[action](id),
    onSuccess: () => invalidateAfterStatusChange(queryClient, id),
  });
}

/** Same as useListingStatusAction, for lists where the business id varies per call. */
export function useBusinessStatusAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: ListingStatusAction }) =>
      businessesApi[action](id),
    onSuccess: (_data, { id }) => invalidateAfterStatusChange(queryClient, id),
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessesApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.business(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
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

export function useUploadBusinessImage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, kind }: { file: File; kind: BusinessImageKind }) =>
      businessesApi.uploadImage(id, file, kind),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
    },
  });
}

export function useDeleteBusinessImage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => businessesApi.deleteImage(id, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myBusinesses });
    },
  });
}
