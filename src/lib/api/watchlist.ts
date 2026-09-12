import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { WatchlistItem, SavedSearch } from "@/types/domain";

export const watchlistApi = {
  list: (fetcher: ApiFetcher = apiFetch) => fetcher<WatchlistItem[]>("/watchlist"),

  add: (businessId: string) =>
    apiFetch<WatchlistItem>(`/businesses/${businessId}/watchlist`, { method: "POST" }),

  remove: (businessId: string) =>
    apiFetch<void>(`/businesses/${businessId}/watchlist`, { method: "DELETE" }),
};

export const savedSearchesApi = {
  list: (fetcher: ApiFetcher = apiFetch) => fetcher<SavedSearch[]>("/saved-searches"),

  create: (input: { name: string; filters: Record<string, unknown>; alertsEnabled?: boolean }) =>
    apiFetch<SavedSearch>("/saved-searches", { method: "POST", body: input }),

  remove: (id: string) => apiFetch<void>(`/saved-searches/${id}`, { method: "DELETE" }),
};
