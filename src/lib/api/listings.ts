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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitizeParams(params: SearchListingsParams): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};

  if (params.categoryId && UUID_REGEX.test(params.categoryId)) {
    clean.categoryId = params.categoryId;
  }
  if (typeof params.minPrice === "number" && !isNaN(params.minPrice) && params.minPrice >= 0) {
    clean.minPrice = params.minPrice;
  }
  if (typeof params.maxPrice === "number" && !isNaN(params.maxPrice) && params.maxPrice >= 0) {
    clean.maxPrice = params.maxPrice;
  }
  if (typeof params.minMrr === "number" && !isNaN(params.minMrr) && params.minMrr >= 0) {
    clean.minMrr = params.minMrr;
  }
  if (typeof params.verified === "boolean") {
    clean.verified = params.verified;
  }
  if (params.country && typeof params.country === "string" && params.country.trim()) {
    clean.country = params.country.trim().toUpperCase();
  }
  if (params.sortBy) {
    const sort = (params.sortBy as string) === "askingPrice" ? "price" : params.sortBy;
    if (["createdAt", "price", "mrr"].includes(sort)) {
      clean.sortBy = sort;
    }
  }
  if (params.sortDir && ["asc", "desc"].includes(params.sortDir)) {
    clean.sortDir = params.sortDir;
  }
  if (params.cursor) {
    clean.cursor = params.cursor;
  }
  if (typeof params.limit === "number" && !isNaN(params.limit) && params.limit > 0) {
    clean.limit = params.limit;
  }

  return clean;
}

export const listingsApi = {
  search: (params: SearchListingsParams, fetcher: ApiFetcher = apiFetch) =>
    fetcher<ApiPaginated<ListingSummary>>(
      `/listings${buildQueryString(sanitizeParams(params))}`,
    ),

  getOne: (idOrSlug: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<ListingDetail>(`/listings/${idOrSlug}`),
};

