import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { BusinessDocument } from "@/types/domain";

export const documentsApi = {
  listForBusiness: (businessId: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<BusinessDocument[]>(`/businesses/${businessId}/documents`),

  upload: (
    businessId: string,
    file: File,
    meta: { category?: string; visibility?: string; dealId?: string },
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (meta.category) formData.append("category", meta.category);
    if (meta.visibility) formData.append("visibility", meta.visibility);
    if (meta.dealId) formData.append("dealId", meta.dealId);

    return apiFetch<BusinessDocument>(`/businesses/${businessId}/documents`, {
      method: "POST",
      body: formData,
    });
  },

  getDownloadUrl: (id: string) => apiFetch<{ url: string }>(`/documents/${id}/download`),

  /** Swagger documents no fields for GrantAccessDto — verify against the backend source before relying on this shape. */
  grantAccess: (id: string, granteeId: string) =>
    apiFetch<void>(`/documents/${id}/access`, { method: "POST", body: { granteeId } }),

  revokeAccess: (id: string, granteeId: string) =>
    apiFetch<void>(`/documents/${id}/access/${granteeId}`, { method: "DELETE" }),

  remove: (id: string) => apiFetch<void>(`/documents/${id}`, { method: "DELETE" }),
};
