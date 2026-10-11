"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listingsApi, type SearchListingsParams } from "@/lib/api/listings";
import { categoriesApi } from "@/lib/api/categories";
import { queryKeys } from "@/lib/query/keys";

/**
 * One request per distinct query: React Query dedupes identical keys, and
 * passes an AbortSignal so a superseded request (the user typed or clicked
 * again) is cancelled and its response can never overwrite newer results.
 * The previous page stays on screen while the next one loads.
 */
export function useListings(params: SearchListingsParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.listings(params as Record<string, unknown>),
    queryFn: ({ signal }) => listingsApi.search(params, undefined, signal),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useListingFacets() {
  return useQuery({
    queryKey: queryKeys.listingFacets,
    queryFn: () => listingsApi.facets(),
    staleTime: 5 * 60 * 1000,
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
