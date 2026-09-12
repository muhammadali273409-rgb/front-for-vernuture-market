import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import { buildQueryString } from "@/lib/api/query-string";
import type { ApiPaginated } from "@/types/api";
import type { ListingDetail, ListingSummary } from "@/types/domain";

export interface SearchListingsParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minMrr?: number;
  verified?: boolean;
  country?: string;
  sortBy?: "createdAt" | "price" | "mrr";
  sortDir?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}

export const listingsApi = {
  search: (params: SearchListingsParams, fetcher: ApiFetcher = apiFetch) =>
    fetcher<ApiPaginated<ListingSummary>>(
      `/listings${buildQueryString(params as unknown as Record<string, string | number | boolean | null | undefined>)}`,
    ),

  getOne: (idOrSlug: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<ListingDetail>(`/listings/${idOrSlug}`),
};
