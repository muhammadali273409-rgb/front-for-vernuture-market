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
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";

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
        <EmptyState icon={MessageSquare} title={t("noConversationsYet")} description={t("noConversationsYetDescription")} />
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => {
            const other = conversation.participants.find((p) => p.userId !== user?.id)?.user;
            const name =
              [other?.profile?.firstName, other?.profile?.lastName].filter(Boolean).join(" ") ||
              other?.email ||
              t("conversation");
            return (
              <Link key={conversation.id} href={`/dashboard/messages/${conversation.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(other?.profile?.firstName, other?.profile?.lastName, other?.email)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-medium">
                          {conversation.business?.name ?? name}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeTime(conversation.updatedAt, locale)}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {conversation.messages?.[0]?.body ?? t("noMessagesYet")}
                      </p>
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
