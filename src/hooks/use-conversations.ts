"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationsApi } from "@/lib/api/conversations";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "sonner";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";

import { useCurrentUser } from "@/hooks/use-current-user";

export function useConversations() {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => conversationsApi.list(),
    enabled: Boolean(user),
    refetchInterval: 15000,
  });
}

/** There's no single-conversation endpoint — find it in the already-fetched list instead. */
export function useConversation(id: string) {
  const { data: conversations, ...rest } = useConversations();
  return { ...rest, data: conversations?.find((c) => c.id === id) };
}

export function useMessages(conversationId: string) {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => conversationsApi.messages(conversationId),
    enabled: Boolean(conversationId && user),
    refetchInterval: 5000,
    select: (page) => page.data,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("errors");
  return useMutation({
    mutationFn: (input: { businessId?: string; participantIds: string[]; initialMessage: string }) =>
      conversationsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
    onError: (error) => toast.error(friendlyErrorMessage(error, t)),
  });
}

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
