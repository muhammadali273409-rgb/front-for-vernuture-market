import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { ApiPaginated } from "@/types/api";
import type { Notification } from "@/types/domain";

export const notificationsApi = {
  /** GET /notifications is cursor-paginated on the backend (see NotificationsService.list),
   * so the response envelope is `{ data, pagination }`, not a bare array. */
  list: (fetcher: ApiFetcher = apiFetch) => fetcher<ApiPaginated<Notification>>("/notifications"),

  markRead: (id: string) =>
    apiFetch<Notification>(`/notifications/${id}/read`, { method: "POST" }),

  markAllRead: () => apiFetch<{ success: boolean }>("/notifications/read-all", { method: "POST" }),
};
