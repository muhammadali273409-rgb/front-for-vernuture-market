"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/keys";
import { ApiError } from "@/lib/api/error";
import type { CurrentUser } from "@/types/domain";

export function useCurrentUser() {
  return useQuery<CurrentUser | null>({
    queryKey: queryKeys.me,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (error) {
        // A 401 means the backend has genuinely rejected the session (no
        // cookie, expired, or revoked by logout) — that must render as
        // logged out.
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 60 * 1000,
  });
}

