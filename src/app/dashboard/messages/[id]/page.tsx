"use client";

import * as React from "react";
import { use } from "react";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useConversation, useMessages, useSendMessage } from "@/hooks/use-conversations";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, i18n } = useTranslation("messages");
  const locale = i18n.language as Locale;
  const { id } = use(params);
  const { data: user } = useCurrentUser();
  const { data: conversation } = useConversation(id);
  const { data: messages = [], isLoading, isError, error, refetch } = useMessages(id);
  const sendMessage = useSendMessage(id);
  const [body, setBody] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const other = conversation?.participants.find((p) => p.userId !== user?.id)?.user;
  const title =
    conversation?.business?.name ??
    [other?.profile?.firstName, other?.profile?.lastName].filter(Boolean).join(" ") ??
    t("conversation");

  function handleSend() {
    const trimmed = body.trim();
    if (!trimmed) return;
    sendMessage.mutate(trimmed, { onSuccess: () => setBody("") });
  }

  return (
    <div className="mx-auto flex h-[calc(100svh-8rem)] max-w-2xl flex-col space-y-4">
      <PageHeader title={title} />

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <ScrollArea className="flex-1 p-4">
            {isError ? (
              <ErrorState error={error} onRetry={() => refetch()} />
            ) : isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="ml-auto h-12 w-2/3" />
              </div>
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
                          <p className="whitespace-pre-line">{message.body}</p>
                          <p className={cn("mt-1 text-[11px] opacity-70")}>{formatDateTime(message.createdAt, locale)}</p>
                        </div>
                      </div>
                    );
                  })}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          <div className="flex items-end gap-2 border-t p-3">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t("writeMessagePlaceholder")}
              rows={2}
              className="flex-1 resize-none"
            />
            <Button size="icon" onClick={handleSend} disabled={sendMessage.isPending || !body.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
