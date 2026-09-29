import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { BillingPlan, PlanCode, Subscription } from "@/types/domain";

/** Never send raw card data (PAN/CVC) through this module — only `planCode`. */
export const subscriptionApi = {
  listPlans: (fetcher: ApiFetcher = apiFetch) => fetcher<BillingPlan[]>("/billing/plans"),

  getCurrent: () => apiFetch<Subscription>("/billing/subscription"),

  // Swagger: POST /billing/subscribe (SubscribeDto) — was previously PUT /billing/subscription,
  // which does not exist on the backend.
  subscribe: (planCode: PlanCode) =>
    apiFetch<Subscription>("/billing/subscribe", {
      method: "POST",
      body: { planCode },
    }),

  // NOT IN SWAGGER: no /billing/subscription/cancel path exists on the backend
  // (confirmed against the full OpenAPI spec, not just the docs UI). This call
  // will 404 in production. Needs a real endpoint from the backend team before
  // this can work — left in place rather than guessed at.
  cancel: () =>
    apiFetch<Subscription>("/billing/subscription/cancel", {
      method: "POST",
    }),

  // NOT IN SWAGGER: same issue as `cancel` above — no matching backend route.
  resume: () =>
    apiFetch<Subscription>("/billing/subscription/resume", {
      method: "POST",
    }),
};
