import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { CurrentUser, Profile } from "@/types/domain";

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  country?: string;
  company?: string;
  website?: string;
  timezone?: string;
}

export const usersApi = {
  updateProfile: (input: UpdateProfileInput) =>
    apiFetch<Profile>("/users/me/profile", { method: "PATCH", body: input }),

  getPublicProfile: (id: string, fetcher: ApiFetcher = apiFetch) =>
    fetcher<{ id: string; profile: Profile | null }>(`/users/${id}`),
};

export type { CurrentUser };
