import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { BusinessCategory } from "@/types/domain";

export const categoriesApi = {
  list: (fetcher: ApiFetcher = apiFetch) => fetcher<BusinessCategory[]>("/categories"),
};
