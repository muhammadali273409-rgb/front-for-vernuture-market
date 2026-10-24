import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { PaymentConfig, Transaction } from "@/types/domain";

export const transactionsApi = {
  /** `null` until the buyer starts paying. */
  getOne: (dealId: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<Transaction | null>(`/deals/${dealId}/transaction`),

  /** Buyer starts paying. With Stripe the result carries `checkoutUrl`. */
  create: (dealId: string) => apiFetch<Transaction>(`/deals/${dealId}/transaction`, { method: "POST", body: {} }),

  /** Manual payments: the buyer says the money was sent; an admin then confirms it. */
  markPaid: (dealId: string, reference?: string) =>
    apiFetch<Transaction>(`/deals/${dealId}/transaction/mark-paid`, {
      method: "POST",
      body: reference ? { reference } : {},
    }),

  /** Which payment flow the server runs (PAYMENT_PROVIDER). */
  config: (fetcher: ApiFetcher = apiFetch) => fetcher<PaymentConfig>("/payments/config"),
};
