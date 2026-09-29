import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { Transaction } from "@/types/domain";

/** Swagger documents no fields for CreateTransactionDto — verify against the backend source before relying on this shape. */
export interface CreateTransactionInput {
  amount: number;
  currency?: string;
}

export const transactionsApi = {
  getOne: (dealId: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<Transaction>(`/deals/${dealId}/transaction`),

  create: (dealId: string, input: CreateTransactionInput) =>
    apiFetch<Transaction>(`/deals/${dealId}/transaction`, { method: "POST", body: input }),
};
