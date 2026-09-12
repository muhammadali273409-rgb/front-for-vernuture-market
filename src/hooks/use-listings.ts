"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { listingsApi, type SearchListingsParams } from "@/lib/api/listings";
import { categoriesApi } from "@/lib/api/categories";
import { queryKeys } from "@/lib/query/keys";

export function useListings(params: SearchListingsParams) {
  return useQuery({
    queryKey: queryKeys.listings(params as Record<string, unknown>),
    queryFn: () => listingsApi.search(params),
    placeholderData: (prev) => prev,
  });
}

export function useInfiniteListings(params: Omit<SearchListingsParams, "cursor">) {
  return useInfiniteQuery({
    queryKey: queryKeys.listings(params as Record<string, unknown>),
    queryFn: ({ pageParam }) => listingsApi.search({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
    placeholderData: (prev) => prev,
  });
}

export function useListing(idOrSlug: string) {
  return useQuery({
    queryKey: queryKeys.listing(idOrSlug),
    queryFn: () => listingsApi.getOne(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => categoriesApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}

