"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { acquireSocket, releaseSocket, type RealtimeEvents } from "@/lib/realtime/socket";
import { queryKeys } from "@/lib/query/keys";
import type { ApiPaginated } from "@/types/api";
import type { Message } from "@/types/domain";

/** How long "typing…" stays visible after the last typing event. */
const TYPING_VISIBLE_MS = 4000;
/** Minimum gap between our own typing events (the server also drops faster ones). */
const TYPING_SEND_INTERVAL_MS = 2500;

/**
 * Keeps chat and notification caches live while the dashboard is open.
 * A new message is shown immediately, then the thread is refetched (which
 * also marks it read on the server when it's the one being viewed).
 */
export function useRealtimeSync(): void {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const socket = acquireSocket();
    if (!socket) return;

    const onMessage: RealtimeEvents["message.new"] = ({ conversationId, message }) => {
      // Newest first, matching GET /conversations/:id/messages.
      queryClient.setQueryData<ApiPaginated<Message>>(queryKeys.messages(conversationId), (page) =>
        !page || page.data.some((m) => m.id === message.id)
          ? page
          : { ...page, data: [message, ...page.data] },
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations, exact: true });
    };
    const onNotification = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    };
    // Catch up on anything sent while we were disconnected.
    const onConnect = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    };

    socket.on("message.new", onMessage);
    socket.on("notification.new", onNotification);
    socket.on("connect", onConnect);
    return () => {
      socket.off("message.new", onMessage);
      socket.off("notification.new", onNotification);
      socket.off("connect", onConnect);
      releaseSocket();
    };
  }, [queryClient]);
}

/** "X is typing…" for one conversation, plus a throttled sender for our own typing. */
export function useTypingIndicator(conversationId: string, currentUserId: string | undefined) {
  const [isOtherTyping, setIsOtherTyping] = React.useState(false);
  const socketRef = React.useRef<ReturnType<typeof acquireSocket>>(null);
  const lastSentRef = React.useRef(0);

  React.useEffect(() => {
    const socket = acquireSocket();
    socketRef.current = socket;
    if (!socket) return;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const onTyping: RealtimeEvents["conversation.typing"] = (event) => {
      if (event.conversationId !== conversationId || event.userId === currentUserId) return;
      setIsOtherTyping(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setIsOtherTyping(false), TYPING_VISIBLE_MS);
    };
    // Their message arrived — they're done typing.
    const onMessage: RealtimeEvents["message.new"] = ({ conversationId: id, message }) => {
      if (id !== conversationId || message.senderId === currentUserId) return;
      clearTimeout(hideTimer);
      setIsOtherTyping(false);
    };

    socket.on("conversation.typing", onTyping);
    socket.on("message.new", onMessage);
    return () => {
      clearTimeout(hideTimer);
      socket.off("conversation.typing", onTyping);
      socket.off("message.new", onMessage);
      socketRef.current = null;
      releaseSocket();
    };
  }, [conversationId, currentUserId]);

  const notifyTyping = React.useCallback(() => {
    const socket = socketRef.current;
    const now = Date.now();
    if (!socket?.connected || now - lastSentRef.current < TYPING_SEND_INTERVAL_MS) return;
    lastSentRef.current = now;
    socket.emit("conversation.typing", { conversationId });
  }, [conversationId]);

  return { isOtherTyping, notifyTyping };
}
