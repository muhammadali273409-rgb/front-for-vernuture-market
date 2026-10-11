"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationsApi } from "@/lib/api/conversations";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

import { useCurrentUser } from "@/hooks/use-current-user";

/**
 * There's no websocket client in the app, so threads stay fresh by polling;
 * every send/start also invalidates the affected queries right away.
 */
export function useConversations() {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => conversationsApi.list(),
    enabled: Boolean(user),
    refetchInterval: 15000,
  });
}

/** Total unread messages across all of the user's conversations. */
export function useUnreadMessageCount(): number {
  const { data: conversations = [] } = useConversations();
  return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

export function useConversation(id: string) {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.conversation(id),
    queryFn: () => conversationsApi.get(id),
    enabled: Boolean(id && user),
    // A 403/404 won't fix itself by retrying.
    retry: false,
  });
}

export function useMessages(conversationId: string, options: { enabled?: boolean } = {}) {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: async () => {
      const page = await conversationsApi.messages(conversationId);
      // Reading marks the thread read on the server — refresh unread badges.
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations, exact: true });
      return page;
    },
    enabled: Boolean(conversationId && user) && (options.enabled ?? true),
    refetchInterval: 5000,
    retry: false,
    select: (page) => page.data,
  });
}

/** Start (or reopen) the buyer's conversation with a listing's seller. */
export function useStartBusinessConversation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("errors");
  return useMutation({
    mutationFn: ({ businessId, message }: { businessId: string; message?: string }) =>
      conversationsApi.startForBusiness(businessId, message),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(conversation.id) });
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}

/** Only reports success once the backend has stored the message. */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("errors");
  return useMutation({
    mutationFn: (body: string) => conversationsApi.sendMessage(conversationId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}
