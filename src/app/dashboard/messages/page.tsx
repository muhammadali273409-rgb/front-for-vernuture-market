"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useConversations } from "@/hooks/use-conversations";
import { formatRelativeTime, initials } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import { otherParticipant, participantName } from "@/lib/utils/conversations";

export default function MessagesPage() {
  const { t, i18n } = useTranslation("messages");
  const locale = i18n.language as Locale;
  const { data: user } = useCurrentUser();
  const { data: conversations = [], isLoading, isError, error, refetch } = useConversations();

  return (
    <div className="space-y-6">
      <PageHeader title={t("messages")} description={t("pageDescription")} />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t("noConversationsYet")}
          description={t("noConversationsYetDescription")}
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const other = otherParticipant(conversation, user?.id);
            const name = participantName(other, t("conversation"));
            const lastMessage = conversation.lastMessage ?? conversation.messages?.[0];
            const unread = conversation.unreadCount ?? 0;
            const otherRole =
              conversation.sellerId == null
                ? null
                : conversation.sellerId === user?.id
                  ? t("roleBuyer")
                  : t("roleSeller");
            return (
              <Link key={conversation.id} href={`/dashboard/messages/${conversation.id}`}>
                <Card className={cn("transition-shadow hover:shadow-md", unread > 0 && "border-primary/40")}>
                  <CardContent className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(other?.profile?.firstName, other?.profile?.lastName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("truncate", unread > 0 ? "font-semibold" : "font-medium")}>
                          {conversation.business?.name ?? name}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeTime(conversation.updatedAt, locale)}
                        </span>
                      </div>
                      {conversation.business && (
                        <p className="truncate text-xs text-muted-foreground">
                          {otherRole ? `${otherRole}: ${name}` : name}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm text-muted-foreground">
                          {lastMessage?.body ?? t("noMessagesYet")}
                        </p>
                        {unread > 0 && (
                          <span
                            className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground"
                            aria-label={t("unreadCount", { count: unread })}
                          >
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
