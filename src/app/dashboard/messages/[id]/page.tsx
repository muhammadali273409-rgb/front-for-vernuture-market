"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useConversation, useMessages, useSendMessage } from "@/hooks/use-conversations";
import { useTypingIndicator } from "@/hooks/use-realtime";
import { formatDateTime } from "@/lib/utils/format";
import { otherParticipant, participantName } from "@/lib/utils/conversations";
import { MESSAGE_MAX_LENGTH } from "@/lib/validations/offer";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, i18n } = useTranslation("messages");
  const locale = i18n.language as Locale;
  const { id } = use(params);
  const { data: user } = useCurrentUser();
  const conversationQuery = useConversation(id);
  const conversation = conversationQuery.data;
  // Only poll messages once we know the user may read this thread.
  const messagesQuery = useMessages(id, { enabled: conversationQuery.isSuccess });
  const messages = messagesQuery.data ?? [];
  const sendMessage = useSendMessage(id);
  const { isOtherTyping, notifyTyping } = useTypingIndicator(id, user?.id);
  const [body, setBody] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const other = conversation ? otherParticipant(conversation, user?.id) : undefined;
  const otherName = participantName(other, t("conversation"));
  const otherRole =
    conversation?.sellerId == null ? null : conversation.sellerId === user?.id ? t("roleBuyer") : t("roleSeller");

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || sendMessage.isPending) return;
    // The text is cleared only after the backend confirms it stored the message.
    sendMessage.mutate(trimmed, { onSuccess: () => setBody("") });
  }

  if (conversationQuery.isError) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/messages">
            <ArrowLeft className="size-4" />
            {t("backToMessages")}
          </Link>
        </Button>
        <ErrorState
          title={t("conversationUnavailable")}
          error={conversationQuery.error}
          onRetry={() => conversationQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100svh-8rem)] max-w-2xl flex-col space-y-4">
      <div className="space-y-1">
        <Button variant="ghost" size="sm" className="-ml-2 h-7 text-xs" asChild>
          <Link href="/dashboard/messages">
            <ArrowLeft className="size-3.5" />
            {t("backToMessages")}
          </Link>
        </Button>
        {conversationQuery.isLoading ? (
          <Skeleton className="h-8 w-56" />
        ) : (
          <PageHeader
            title={conversation?.business?.name ?? otherName}
            description={otherRole ? `${otherRole}: ${otherName}` : conversation?.business ? otherName : undefined}
          />
        )}
        {conversation?.business && (
          <Link
            href={`/marketplace/${conversation.business.slug}`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Store className="size-3.5" />
            {t("viewListing")}
          </Link>
        )}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <ScrollArea className="flex-1 p-4">
            {messagesQuery.isError ? (
              <ErrorState error={messagesQuery.error} onRetry={() => messagesQuery.refetch()} />
            ) : conversationQuery.isLoading || messagesQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="ml-auto h-12 w-2/3" />
              </div>
            ) : messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("noMessagesYet")}</p>
            ) : (
              <div className="space-y-3">
                {messages
                  .slice()
                  .reverse()
                  .map((message) => {
                    const isMine = message.senderId === user?.id;
                    return (
                      <div key={message.id} className={cn("flex", isMine && "justify-end")}>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                            isMine ? "bg-primary text-primary-foreground" : "bg-muted",
                          )}
                        >
                          {!isMine && <p className="mb-0.5 text-[11px] font-semibold opacity-80">{otherName}</p>}
                          <p className="whitespace-pre-line break-words">{message.body}</p>
                          <time dateTime={message.createdAt} className="mt-1 block text-[11px] opacity-70">
                            {formatDateTime(message.createdAt, locale)}
                          </time>
                        </div>
                      </div>
                    );
                  })}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          <p aria-live="polite" className="h-5 px-4 text-xs italic text-muted-foreground">
            {isOtherTyping ? t("typing", { name: otherName }) : null}
          </p>

          <div className="flex items-end gap-2 border-t p-3">
            <Textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (e.target.value.trim()) notifyTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t("writeMessagePlaceholder")}
              aria-label={t("writeMessagePlaceholder")}
              maxLength={MESSAGE_MAX_LENGTH}
              rows={2}
              disabled={!conversationQuery.isSuccess}
              className="flex-1 resize-none"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!conversationQuery.isSuccess || sendMessage.isPending || !body.trim()}
              aria-label={t("send")}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
