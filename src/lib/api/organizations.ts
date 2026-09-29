import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { Organization } from "@/types/domain";

export interface CreateOrganizationInput {
  name: string;
}

/** Swagger documents no fields for AddMemberDto — verify against the backend source before relying on this shape. */
export interface AddMemberInput {
  userId: string;
  role?: string;
}

export const organizationsApi = {
  list: (fetcher: ApiFetcher = apiFetch) => fetcher<Organization[]>("/organizations"),

  create: (input: CreateOrganizationInput) =>
    apiFetch<Organization>("/organizations", { method: "POST", body: input }),

  addMember: (id: string, input: AddMemberInput) =>
    apiFetch<void>(`/organizations/${id}/members`, { method: "POST", body: input }),

  removeMember: (id: string, userId: string) =>
    apiFetch<void>(`/organizations/${id}/members/${userId}`, { method: "DELETE" }),
};
