"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginInput, type RegisterInput } from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/keys";
import { ApiError } from "@/lib/api/error";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useGoogleLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ credential, role }: { credential: string; role?: "BUYER" | "SELLER" }) =>
      authApi.googleLogin(credential, role),
    onSuccess: (result) => {
      // needsRole means no session was created yet (the backend is waiting
      // on a Buyer/Seller choice) — nothing to refetch "me" for.
      if (result.needsRole) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
    // No onError handling here: the backend distinguishes "invalid Google
    // credential" from "valid Google account, no VentureMarket account" via
    // ApiError.code, and the caller (the auth form) needs that distinction
    // to decide what to show — so the raw error is left to propagate.
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        return await authApi.logout();
      } catch (error) {
        // A 401 here means the session was already invalid server-side
        // (expired, or revoked by a previous logout) — the desired end state
        // (logged out) is already true, so this resolves like a normal
        // success instead of surfacing a scary "logout failed" error for a
        // goal that's already met.
        if (error instanceof ApiError && error.status === 401) {
          return { success: true as const };
        }
        // Any other failure (network unreachable, 5xx) is a real failure —
        // rethrow so callers don't claim success while a valid session
        // cookie may still be sitting there.
        throw error;
      }
    },
    onSuccess: () => {
      // Drop every cached query, not just "me" — protects against another
      // user logging in on the same browser and seeing this session's
      // leftover cached (potentially private) data.
      queryClient.clear();
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
  });
}
