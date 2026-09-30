import { useSyncExternalStore } from "react";

/**
 * The Buyer/Seller choice a visitor makes *before* they have an account
 * (landing page → register/login). It only survives until sign-up: the
 * backend stores the real role on the user record, and after that the
 * authenticated user's role is the only source of truth — this value is
 * never read for signed-in users and never grants anything by itself.
 */
export type PublicRole = "BUYER" | "SELLER";

const STORAGE_KEY = "vm.intendedRole";
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function parsePublicRole(value: string | null | undefined): PublicRole | null {
  return value === "BUYER" || value === "SELLER" ? value : null;
}

export function readIntendedRole(): PublicRole | null {
  try {
    return parsePublicRole(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function rememberIntendedRole(role: PublicRole): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, role);
  } catch {
    // Storage blocked (private mode etc.) — the ?role= URL param still carries it.
  }
  notify();
}

export function clearIntendedRole(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The remembered pre-auth choice; always null during server rendering. */
export function useIntendedRole(): PublicRole | null {
  return useSyncExternalStore(subscribe, readIntendedRole, () => null);
}
