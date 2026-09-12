import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { Deal, Offer } from "@/types/domain";

export interface CreateOfferInput {
  amount: number;
  currency?: string;
  terms?: string;
}

export const offersApi = {
  listMine: (fetcher: ApiFetcher = apiFetch) => fetcher<Offer[]>("/offers"),

  getOne: (id: string, fetcher: ApiFetcher = apiFetch) => fetcher<Offer>(`/offers/${id}`),

  create: (businessId: string, input: CreateOfferInput) =>
    apiFetch<Offer>(`/businesses/${businessId}/offers`, { method: "POST", body: input }),

  counter: (id: string, input: CreateOfferInput) =>
    apiFetch<Offer>(`/offers/${id}/counter`, { method: "POST", body: input }),

  accept: (id: string) => apiFetch<Deal>(`/offers/${id}/accept`, { method: "POST" }),

  reject: (id: string) => apiFetch<Offer>(`/offers/${id}/reject`, { method: "POST" }),

  withdraw: (id: string) => apiFetch<Offer>(`/offers/${id}/withdraw`, { method: "POST" }),
};
