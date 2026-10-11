/* eslint-disable @next/next/no-img-element -- avatars may be external profile URLs */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { listingsApi } from "@/lib/api/listings";
import { publicApiFetch } from "@/lib/api/public";
import { ApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/utils/format";
import { getServerLocale, getT } from "@/i18n/server";
import type { ApiFetcher } from "@/lib/api/fetcher-type";
import type { PublicSeller } from "@/types/domain";
import type { Metadata } from "next";
import { SellerListings } from "./seller-listings";

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getSeller(id: string): Promise<PublicSeller> {
  if (!UUID.test(id)) notFound();
  try {
    return await listingsApi.seller(id, publicApiFetch as unknown as ApiFetcher);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
}

function displayName(seller: PublicSeller, fallback: string): string {
  return seller.name || seller.company || fallback;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const seller = await getSeller(id);
  const t = await getT("business");
  return { title: displayName(seller, t("project.sellerFallback")) };
}

/**
 * Public seller profile: exactly the fields listings already show (name,
 * company, avatar, member since) plus their live listings. No email, phone
 * or documents — buyers reach the seller through a listing's Contact button.
 */
export default async function SellerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const seller = await getSeller(id);
  const t = await getT("marketplace");
  const locale = await getServerLocale();
  const name = displayName(seller, t("business:project.sellerFallback"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/marketplace" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" />
        {t("marketplace")}
      </Link>

      <Card className="flex flex-col gap-4 border border-border/80 bg-card p-6 sm:flex-row sm:items-center">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
          {seller.avatarUrl ? (
            <img src={seller.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <UserRound className="size-7" />
          )}
        </div>
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{name}</h1>
          {seller.company && seller.name && <p className="text-sm text-muted-foreground">{seller.company}</p>}
          <p className="text-xs text-muted-foreground">
            {t("business:project.memberSince", { date: formatDate(seller.memberSince, locale) })}
            {" · "}
            {t("publicListingsCount", { count: seller.publicListings })}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" />
            {t("sellerPrivacyNote")}
          </p>
        </div>
      </Card>

      <h2 className="mt-8 mb-4 text-lg font-semibold text-foreground">{t("sellerListingsTitle")}</h2>
      <SellerListings sellerId={seller.id} />
    </div>
  );
}
