"use client";

import {
  CheckCheck,
  HandCoins,
  MessageSquare,
  ShieldCheck,
  FolderLock,
  Handshake,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import type { NotificationType } from "@/types/domain";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "COUNTER_OFFER":
    case "NEW_OFFER":
      return <HandCoins className="size-4 text-primary" />;
    case "DUE_DILIGENCE_REQUEST":
    case "DOCUMENT_UPLOADED":
      return <FolderLock className="size-4 text-purple-500" />;
    case "VERIFICATION_UPDATE":
      return <ShieldCheck className="size-4 text-emerald-500" />;
    case "DEAL_UPDATE":
      return <Handshake className="size-4 text-blue-500" />;
    default:
      return <MessageSquare className="size-4 text-primary" />;
  }
}

export default function NotificationsPage() {
  const { t, i18n } = useTranslation("notifications");
  const locale = i18n.language as Locale;
  const { data: notifications = [] } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pageTitle")}
        description={t("pageDescription")}
        action={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="size-3.5" />
            <span>{t("markAllRead")}</span>
          </Button>
        }
      />

      <div className="space-y-3">
        {notifications.map((notif) => {
          const isUnread = !notif.readAt;

          return (
            <Card
              key={notif.id}
              onClick={() => isUnread && markRead.mutate(notif.id)}
              className={`border border-border/80 transition-all cursor-pointer ${
                isUnread ? "bg-primary/5 border-primary/30" : "bg-card hover:bg-muted/10"
              }`}
            >
              <CardContent className="flex items-start gap-3.5 p-4 text-xs">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-foreground">{notif.title}</h4>
                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                      {formatRelativeTime(notif.createdAt, locale)}
                    </span>
                  </div>
                  {notif.body && <p className="text-muted-foreground leading-relaxed">{notif.body}</p>}
                </div>

                {isUnread && (
                  <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
