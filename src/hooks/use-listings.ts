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
    queryKey: queryKeys.infiniteListings(params as Record<string, unknown>),
    queryFn: ({ pageParam }) => listingsApi.search({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
  });
}

/** The backend rejects `limit` above 100, so this is the widest page it will return. */
const SEARCH_PAGE_SIZE = 100;

/**
 * The public `/listings` endpoint rejects every unknown query key, so it has no
 * text-search parameter at all. A search term therefore has to be matched
 * client-side, which only works if we walk the backend's whole published
 * dataset — hence the widest page size plus caller-driven pagination.
 */
export function useListingSearch(
  params: Omit<SearchListingsParams, "cursor" | "limit">,
  enabled: boolean,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.infiniteListings({ ...params, limit: SEARCH_PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      listingsApi.search({ ...params, limit: SEARCH_PAGE_SIZE, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
    enabled,
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

