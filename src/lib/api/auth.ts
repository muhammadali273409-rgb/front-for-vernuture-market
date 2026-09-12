import { apiFetch } from "@/lib/api/client";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { CurrentUser } from "@/types/domain";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: "BUYER" | "SELLER";
}

export const authApi = {
  register: (input: RegisterInput) =>
    apiFetch<{ id: string; email: string }>("/auth/register", {
      method: "POST",
      body: input,
      skipAuthRetry: true,
    }),

  login: (input: LoginInput) =>
    apiFetch<{ user: CurrentUser }>("/auth/login", {
      method: "POST",
      body: input,
      skipAuthRetry: true,
    }),

  /**
   * "Continue with Google" — login or register. `credential` is the raw
   * Google Identity Services ID token; the backend cryptographically
   * verifies it and decides everything else:
   * - Existing account for this Google identity → signs in, `role` is
   *   whatever the account already had (never touched by this call).
   * - No existing account and no `role` passed → nothing is created;
   *   the backend replies `needsRole: true` so the UI can ask
   *   Buyer/Seller, then call this again with the same `credential` plus
   *   the chosen `role` to finish registration.
   * - No existing account and a `role` passed → creates the account with
   *   that role and signs in.
   * `role` is only ever "BUYER" or "SELLER" — the backend independently
   * rejects anything else (e.g. "ADMIN"), so nothing here can request or
   * influence a privileged role.
   */
  googleLogin: (credential: string, role?: "BUYER" | "SELLER") =>
    apiFetch<
      | { user: CurrentUser; isNewUser: boolean; needsRole: false }
      | { user: null; isNewUser: true; needsRole: true }
    >("/auth/google", {
      method: "POST",
      body: role ? { credential, role } : { credential },
      skipAuthRetry: true,
    }),

  logout: () =>
    apiFetch<{ success: boolean }>("/auth/logout", { method: "POST", skipAuthRetry: true }),

  verifyEmail: (token: string) =>
    apiFetch<{ success: boolean }>("/auth/verify-email", {
      method: "POST",
      body: { token },
      skipAuthRetry: true,
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
      skipAuthRetry: true,
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiFetch<{ success: boolean }>("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword },
      skipAuthRetry: true,
    }),

  me: (fetcher: ApiFetcher = apiFetch) => fetcher<CurrentUser>("/auth/me"),
};
