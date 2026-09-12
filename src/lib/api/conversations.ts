import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { ApiPaginated } from "@/types/api";
import type { Conversation, Message } from "@/types/domain";

export const conversationsApi = {
  list: (fetcher: ApiFetcher = apiFetch) => fetcher<Conversation[]>("/conversations"),

  create: (input: { businessId?: string; participantIds: string[]; initialMessage: string }) =>
    apiFetch<Conversation>("/conversations", { method: "POST", body: input }),

  messages: (id: string, cursor?: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<ApiPaginated<Message>>(`/conversations/${id}/messages${cursor ? `?cursor=${cursor}` : ""}`),

  sendMessage: (id: string, body: string) =>
    apiFetch<Message>(`/conversations/${id}/messages`, { method: "POST", body: { body } }),
};
