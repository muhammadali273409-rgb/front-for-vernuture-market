import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { ApiPaginated } from "@/types/api";
import type { Conversation, Message } from "@/types/domain";

export const conversationsApi = {
  list: (fetcher: ApiFetcher = apiFetch) => fetcher<Conversation[]>("/conversations"),

  get: (id: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<Conversation>(`/conversations/${encodeURIComponent(id)}`),

  /**
   * Buyer → seller enquiry about a listing. The backend resolves the seller
   * from the business and returns the buyer's existing thread if there is one.
   */
  startForBusiness: (businessId: string, message?: string) =>
    apiFetch<Conversation>(`/businesses/${encodeURIComponent(businessId)}/conversations`, {
      method: "POST",
      body: message ? { message } : {},
    }),

  messages: (id: string, cursor?: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<ApiPaginated<Message>>(
      `/conversations/${encodeURIComponent(id)}/messages${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
    ),

  sendMessage: (id: string, body: string) =>
    apiFetch<Message>(`/conversations/${encodeURIComponent(id)}/messages`, { method: "POST", body: { body } }),
};
