"use client";

import { io, type Socket } from "socket.io-client";
import { create } from "zustand";
import { apiFetch } from "@/lib/api/client";
import type { Message } from "@/types/domain";

/** Server → client events on the backend's `/realtime` namespace. */
export interface RealtimeEvents {
  "message.new": (payload: { conversationId: string; message: Message }) => void;
  "conversation.typing": (payload: { conversationId: string; userId: string }) => void;
  "notification.new": (payload: unknown) => void;
}

interface RealtimeEmits {
  "conversation.typing": (payload: { conversationId: string }) => void;
}

export type RealtimeSocket = Socket<RealtimeEvents, RealtimeEmits>;

/** Retry after the server itself dropped us (e.g. the token fetch failed). */
const SERVER_DISCONNECT_RETRY_MS = 15_000;

export const useRealtimeStatus = create<{ connected: boolean }>(() => ({ connected: false }));

/**
 * The WebSocket goes straight to the backend (a Next.js route can't proxy
 * one), so it needs the backend's public origin. Without it the app simply
 * stays on polling.
 */
function realtimeUrl(): string | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    return `${new URL(apiUrl).origin}/realtime`;
  } catch {
    return null;
  }
}

let socket: RealtimeSocket | null = null;
let refCount = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

function createSocket(url: string): RealtimeSocket {
  const s: RealtimeSocket = io(url, {
    transports: ["websocket"],
    reconnectionDelayMax: 30_000,
    // Called on every (re)connect, so each handshake gets a fresh short-lived
    // token — fetched through the same-origin proxy with the session cookie.
    auth: (cb) => {
      apiFetch<{ token: string }>("/auth/socket-token").then(
        ({ token }) => cb({ token }),
        (error) => {
          console.error("[realtime] Could not get a socket token", error);
          cb({});
        },
      );
    },
  });

  s.on("connect", () => useRealtimeStatus.setState({ connected: true }));
  s.on("disconnect", (reason) => {
    useRealtimeStatus.setState({ connected: false });
    // socket.io doesn't auto-reconnect after a server-side disconnect.
    if (reason === "io server disconnect") {
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => s.connect(), SERVER_DISCONNECT_RETRY_MS);
    }
  });
  s.on("connect_error", (error) => console.warn("[realtime] Connection failed", error.message));
  return s;
}

/** Shared connection; call releaseSocket() once per successful acquire. */
export function acquireSocket(): RealtimeSocket | null {
  const url = realtimeUrl();
  if (!url) return null;
  socket ??= createSocket(url);
  refCount++;
  return socket;
}

export function releaseSocket(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && socket) {
    clearTimeout(retryTimer);
    socket.disconnect();
    socket = null;
    useRealtimeStatus.setState({ connected: false });
  }
}
