import { apiFetch } from "@/lib/api/client";
import { buildQueryString } from "@/lib/api/query-string";
import type { ApiPaginated } from "@/types/api";
import type {
  AccountStatus,
  BusinessStatus,
  ListingStatus,
  UserRole,
  VerificationStatus,
  VerificationType,
} from "@/types/domain";

export interface AdminCursorParams {
  cursor?: string;
  limit?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminBusinessSummary {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  status: BusinessStatus;
  country: string | null;
  createdAt: string;
  owner: { id: string; email: string };
  listing: { status: ListingStatus; askingPrice: number | null; currency: string } | null;
}

export interface AdminVerificationSummary {
  id: string;
  businessId: string;
  type: VerificationType;
  status: VerificationStatus;
  createdAt: string;
  expiresAt: string | null;
  business: { id: string; name: string };
}

export interface AdminReportSummary {
  id: string;
  reporterId: string;
  targetType: "BUSINESS" | "USER" | "MESSAGE" | "LISTING";
  targetId: string;
  businessId: string | null;
  reason: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";
  createdAt: string;
}

export interface AdminAuditLogSummary {
  id: string;
  userId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export const adminApi = {
  listUsers: (params: AdminCursorParams = {}) =>
    apiFetch<ApiPaginated<AdminUserSummary>>(`/admin/users${buildQueryString(params)}`),

  listBusinesses: (params: AdminCursorParams & { status?: BusinessStatus } = {}) =>
    apiFetch<ApiPaginated<AdminBusinessSummary>>(`/admin/businesses${buildQueryString(params)}`),

  listVerifications: (params: AdminCursorParams = {}) =>
    apiFetch<ApiPaginated<AdminVerificationSummary>>(`/admin/verifications${buildQueryString(params)}`),

  listReports: (params: AdminCursorParams = {}) =>
    apiFetch<ApiPaginated<AdminReportSummary>>(`/admin/reports${buildQueryString(params)}`),

  listAuditLogs: (params: AdminCursorParams = {}) =>
    apiFetch<ApiPaginated<AdminAuditLogSummary>>(`/admin/audit-logs${buildQueryString(params)}`),

  approveBusiness: (id: string, reason?: string) =>
    apiFetch(`/admin/businesses/${id}/approve`, { method: "POST", body: { reason } }),

  rejectBusiness: (id: string, reason?: string) =>
    apiFetch(`/admin/businesses/${id}/reject`, { method: "POST", body: { reason } }),

  suspendBusiness: (id: string, reason?: string) =>
    apiFetch(`/admin/businesses/${id}/suspend`, { method: "POST", body: { reason } }),
};
