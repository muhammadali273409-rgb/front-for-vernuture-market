import { apiFetch } from "@/lib/api/client";
import type { PlanCode, Subscription } from "@/types/domain";

/** Never send raw card data (PAN/CVC) through this module — only `planCode`. */
export const subscriptionApi = {
  getCurrent: () => apiFetch<Subscription>("/billing/subscription"),

  subscribe: (planCode: PlanCode) =>
    apiFetch<Subscription>("/billing/subscription", {
      method: "PUT",
      body: { planCode },
    }),

  cancel: () =>
    apiFetch<Subscription>("/billing/subscription/cancel", {
      method: "POST",
    }),

  resume: () =>
    apiFetch<Subscription>("/billing/subscription/resume", {
      method: "POST",
    }),
};
