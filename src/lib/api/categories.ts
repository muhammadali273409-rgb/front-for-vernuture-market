import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { BusinessCategory } from "@/types/domain";

/** Swagger documents no fields for CreateCategoryDto — verify against the backend source before relying on this shape. */
export interface CreateCategoryInput {
  name: string;
  slug?: string;
}

export const categoriesApi = {
  list: (fetcher: ApiFetcher = apiFetch) => fetcher<BusinessCategory[]>("/categories"),

  create: (input: CreateCategoryInput) =>
    apiFetch<BusinessCategory>("/categories", { method: "POST", body: input }),
};
