"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/use-notifications";
import { notificationTypeKey } from "@/lib/utils/labels";
import { formatRelativeTime } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";
import type { Locale } from "@/i18n/settings";
import { cn } from "@/lib/utils";

export function NotificationsDropdown() {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const { t, i18n } = useTranslation("notifications");
  const locale = i18n.language as Locale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("notifications")}>
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t("notifications")}</span>
          {unreadCount > 0 && (
            <button
              className="text-xs font-normal text-primary hover:underline"
              onClick={() => markAllRead.mutate()}
            >
              {t("markAllRead")}
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">{t("noNotificationsDescription")}</p>
        ) : (
          <ScrollArea className="max-h-80">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn("flex flex-col items-start gap-0.5 whitespace-normal", !notification.readAt && "bg-accent/60")}
                onSelect={() => !notification.readAt && markRead.mutate(notification.id)}
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {t(`types.${notificationTypeKey[notification.type] ?? notification.type}`)}
                </span>
                <span className="text-sm font-medium">{notification.title}</span>
                {notification.body && (
                  <span className="text-xs text-muted-foreground">{notification.body}</span>
                )}
                <span className="text-[11px] text-muted-foreground">
                  {formatRelativeTime(notification.createdAt, locale)}
                </span>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/notifications" className="justify-center text-sm font-medium">
            {t("viewAll")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
