"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  HandCoins,
  Heart,
  MessageSquare,
  Handshake,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useMyBusinesses } from "@/hooks/use-businesses";
import { useMyOffers } from "@/hooks/use-offers";
import { useDeals } from "@/hooks/use-deals";
import { useConversations } from "@/hooks/use-conversations";
import { useWatchlist } from "@/hooks/use-watchlist";
import { offerStatusKey, offerStatusVariant, dealStatusKey } from "@/lib/utils/labels";
import { formatCompactMoney, formatRelativeTime } from "@/lib/utils/format";
import { useTranslation } from "@/i18n/client";

export default function DashboardPage() {
  const { t } = useTranslation(["dashboard", "offers", "common", "messages", "deals"] as const);
  const { data: user } = useCurrentUser();
  const { data: businesses = [], isLoading: businessesLoading } = useMyBusinesses();
  const { data: offers = [], isLoading: offersLoading } = useMyOffers();
  const { data: deals = [] } = useDeals();
  const { data: conversations = [] } = useConversations();
  const { data: watchlist = [] } = useWatchlist();
  const isSeller = user?.role === "SELLER";

  const name = user?.profile?.firstName || user?.email?.split("@")[0] || t("common:guest");
  const pendingOffers = offers.filter((o) => ["SUBMITTED", "COUNTERED", "VIEWED"].includes(o.status));
  const activeDeals = deals.filter((d) => !["COMPLETED", "CANCELLED"].includes(d.status));
  const spotlightDeal = activeDeals[0];
  const spotlightTasks = spotlightDeal?.tasks ?? [];
  const spotlightTasksDone = spotlightTasks.filter((task) => task.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      {/* Header with quick actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-semibold uppercase text-muted-foreground">
              {user?.role === "SELLER"
                ? t("dashboard:workspaceLabelSeller")
                : user?.role === "ADMIN"
                  ? t("dashboard:workspaceLabelAdmin")
                  : t("dashboard:workspaceLabelBuyer")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("dashboard:welcomeBack", { name })}
          </h1>
          <p className="text-xs text-muted-foreground">{t("dashboard:subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          {isSeller ? (
            <Button asChild size="sm" className="h-9 gap-1.5 font-semibold text-xs">
              <Link href="/dashboard/businesses/new">
                <Plus className="size-3.5" />
                <span>{t("dashboard:createNewBusiness")}</span>
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="h-9 gap-1.5 font-semibold text-xs">
              <Link href="/marketplace">
                <span>{t("dashboard:browseMarketplace")}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Pipeline Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={isSeller ? t("dashboard:myBusinessesStat") : t("dashboard:activeDealRoomsStat")}
          value={businessesLoading ? "—" : isSeller ? businesses.length : activeDeals.length}
          icon={isSeller ? Briefcase : Handshake}
        />
        <StatCard
          label={t("dashboard:pendingOffersStat")}
          value={offersLoading ? "—" : pendingOffers.length}
          icon={HandCoins}
        />
        <StatCard
          label={t("dashboard:negotiationMessagesStat")}
          value={conversations.length}
          icon={MessageSquare}
        />
        <StatCard
          label={t("dashboard:watchlistAssetsStat")}
          value={watchlist.length}
          icon={Heart}
        />
      </div>

      {/* Active Deal Room Spotlight */}
      {spotlightDeal && (
        <Card className="border border-border/80 bg-card overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/10 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Handshake className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">
                  {t("dashboard:activeDealRoomTitle", { name: spotlightDeal.business?.name ?? t("dashboard:directNegotiation") })}
                </CardTitle>
                <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-[10px] font-semibold">
                  {t(`deals:roomStatus.${dealStatusKey[spotlightDeal.status] ?? spotlightDeal.status}`)}
                </Badge>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs font-semibold text-primary">
                <Link href={`/dashboard/deals/${spotlightDeal.id}`}>
                  <span>{t("dashboard:enterWorkspace")}</span>
                  <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          {spotlightTasks.length > 0 && (
            <CardContent className="p-4">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{t("dashboard:closingTasks")}</span>
                <p className="font-mono text-base font-bold text-foreground mt-0.5">
                  {t("dashboard:itemsApproved", { approved: spotlightTasksDone, total: spotlightTasks.length })}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Grid: Offers Needing Attention & Recent Messages */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Offers Needing Action */}
        <Card className="border border-border/80 bg-card">
          <CardHeader className="border-b border-border/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HandCoins className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">{t("dashboard:offersNegotiationHistory")}</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-semibold">
                <Link href="/dashboard/offers">
                  {t("common:viewAll")} <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {pendingOffers.length === 0 ? (
              <EmptyState title={t("dashboard:noPendingOffers")} description={t("dashboard:noPendingOffersDescription")} />
            ) : (
              pendingOffers.slice(0, 4).map((offer) => (
                <Link
                  key={offer.id}
                  href={`/dashboard/offers/${offer.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/10 p-3 text-xs transition-colors hover:bg-muted/30"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{offer.business?.name ?? t("offers:offer")}</p>
                    <p className="font-mono text-muted-foreground">{formatCompactMoney(offer.amount, offer.currency)}</p>
                  </div>
                  <Badge variant={offerStatusVariant[offer.status]} className="text-[10px] font-semibold">
                    {t(`offers:status.${offerStatusKey[offer.status]}`)}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="border border-border/80 bg-card">
          <CardHeader className="border-b border-border/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">{t("dashboard:negotiationMessagesStat")}</CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs font-semibold">
                <Link href="/dashboard/messages">
                  {t("common:viewAll")} <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {conversations.length === 0 ? (
              <EmptyState title={t("messages:noConversationsYet")} description={t("messages:noConversationsYetDescription")} />
            ) : (
              conversations.slice(0, 4).map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/dashboard/messages/${conversation.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/10 p-3 text-xs hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {conversation.business?.name ?? t("dashboard:directNegotiation")}
                    </p>
                    <p className="truncate text-muted-foreground text-[11px]">
                      {conversation.messages?.[0]?.body ?? t("dashboard:activeDiscussion")}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground ml-2">
                    {formatRelativeTime(conversation.updatedAt)}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
