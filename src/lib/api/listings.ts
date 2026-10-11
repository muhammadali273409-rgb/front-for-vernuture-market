import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import { buildQueryString } from "@/lib/api/query-string";
import type { ApiPagedList } from "@/types/api";
import type { ListingDetail, ListingFacets, ListingSummary, PublicSeller } from "@/types/domain";

/**
 * GET /listings query. All filtering, sorting and paging happens on the
 * backend. Build marketplace queries with `toApiParams` from
 * `@/lib/marketplace/filters`, which validates them first.
 */
export interface SearchListingsParams {
  /** Free-text search, matched server-side (name, headline, description, model, city, category). */
  q?: string;
  /** Category slug. */
  category?: string;
  categoryId?: string;
  businessModel?: string;
  city?: string;
  /** Only listings published by this seller. */
  sellerId?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Monthly revenue (latest MRR). */
  minRevenue?: number;
  maxRevenue?: number;
  /** Monthly profit (latest PROFIT). */
  minProfit?: number;
  maxProfit?: number;
  verified?: "true";
  country?: string;
  sortBy?: "createdAt" | "price" | "revenue" | "profit";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const listingsApi = {
  search: (params: SearchListingsParams, fetcher: ApiFetcher = apiFetch, signal?: AbortSignal) =>
    fetcher<ApiPagedList<ListingSummary>>(
      `/listings${buildQueryString(params as Record<string, string | number | undefined>)}`,
      signal ? { signal } : undefined,
    ),

  facets: (fetcher: ApiFetcher = apiFetch) => fetcher<ListingFacets>("/listings/facets"),

  getOne: (idOrSlug: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<ListingDetail>(`/listings/${encodeURIComponent(idOrSlug)}`),

  seller: (id: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<PublicSeller>(`/sellers/${encodeURIComponent(id)}`),
};
