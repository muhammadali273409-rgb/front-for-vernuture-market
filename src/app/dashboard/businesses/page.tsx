"use client";

/* eslint-disable @next/next/no-img-element -- images are short-lived signed URLs from the private bucket */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  EllipsisVertical,
  ExternalLink,
  EyeOff,
  Pencil,
  Plus,
  Rocket,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BusinessStatusBadge } from "@/components/business/business-status-badge";
import { DeleteBusinessDialog } from "@/components/business/delete-business-dialog";
import { useBusinessStatusAction, useMyBusinesses, type ListingStatusAction } from "@/hooks/use-businesses";
import { formatCompactMoney } from "@/lib/utils/format";
import { friendlyErrorMessage } from "@/lib/api/error";
import { useTranslation } from "@/i18n/client";
import { toast } from "sonner";
import type { OwnedBusiness } from "@/types/domain";

const PUBLISHABLE: OwnedBusiness["status"][] = ["DRAFT", "REJECTED", "PENDING_REVIEW", "PAUSED"];
const DELETABLE: OwnedBusiness["status"][] = ["DRAFT", "REJECTED", "PAUSED"];

function ProjectCard({
  business,
  onDelete,
}: {
  business: OwnedBusiness;
  onDelete: (business: OwnedBusiness) => void;
}) {
  const { t } = useTranslation(["business", "errors"]);
  const router = useRouter();
  const statusAction = useBusinessStatusAction();

  const logo = business.images?.find((i) => i.kind === "LOGO");
  const cover = business.images?.find((i) => i.kind === "GALLERY");
  const isLive = business.status === "PUBLISHED";
  const location = [business.city, business.country].filter(Boolean).join(", ");

  function run(action: ListingStatusAction, successKey: string) {
    statusAction.mutate(
      { id: business.id, action },
      {
        onSuccess: () => toast.success(t(successKey)),
        onError: (error) => toast.error(friendlyErrorMessage(error, t, { showValidationDetail: true })),
      },
    );
  }

  return (
    <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link href={`/dashboard/businesses/${business.id}`} className="block">
        <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/15 via-muted to-muted">
          {cover && <img src={cover.url} alt="" className="size-full object-cover" />}
          <div className="absolute left-3 top-3">
            <BusinessStatusBadge status={business.status} />
          </div>
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {logo ? (
              <img src={logo.url} alt="" className="size-full object-cover" />
            ) : (
              <Briefcase className="size-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/dashboard/businesses/${business.id}`}>
              <h3 className="line-clamp-1 font-semibold hover:text-primary">{business.name}</h3>
            </Link>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {[business.category?.name, location].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label={t("project.actions")}>
                <EllipsisVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t("project.actions")}</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => router.push(`/dashboard/businesses/${business.id}`)}>
                <Pencil className="size-4" />
                {t("project.edit")}
              </DropdownMenuItem>
              {isLive && (
                <DropdownMenuItem onSelect={() => window.open(`/marketplace/${business.slug}`, "_blank")}>
                  <ExternalLink className="size-4" />
                  {t("project.viewOnMarketplace")}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {PUBLISHABLE.includes(business.status) && (
                <DropdownMenuItem
                  disabled={statusAction.isPending}
                  onSelect={() => run("publish", "business:project.toastPublished")}
                >
                  <Rocket className="size-4" />
                  {t("project.publish")}
                </DropdownMenuItem>
              )}
              {isLive && (
                <DropdownMenuItem
                  disabled={statusAction.isPending}
                  onSelect={() => run("unpublish", "business:project.toastUnpublished")}
                >
                  <EyeOff className="size-4" />
                  {t("project.unpublish")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                onSelect={() =>
                  DELETABLE.includes(business.status)
                    ? onDelete(business)
                    : toast.error(t("project.unpublishBeforeDelete"))
                }
              >
                <Trash2 className="size-4" />
                {t("project.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {business.listing?.headline || business.description || t("project.noDescription")}
        </p>

        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-[11px] font-medium uppercase text-muted-foreground">{t("askingPrice")}</span>
          <span className="font-mono text-sm font-semibold text-primary">
            {formatCompactMoney(business.listing?.askingPrice, business.listing?.currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyBusinessesPage() {
  const { t } = useTranslation("business");
  const { data: businesses = [], isLoading, isError, error, refetch } = useMyBusinesses();
  const [toDelete, setToDelete] = useState<OwnedBusiness | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("project.myProjectsTitle")}
        description={t("project.myProjectsDescription")}
        action={
          <Button asChild>
            <Link href="/dashboard/businesses/new">
              <Plus className="size-4" />
              {t("project.newProject")}
            </Link>
          </Button>
        }
      />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t("project.emptyTitle")}
          description={t("project.emptyDescription")}
          action={
            <Button asChild size="sm">
              <Link href="/dashboard/businesses/new">{t("project.createFirst")}</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <ProjectCard key={business.id} business={business} onDelete={setToDelete} />
          ))}
        </div>
      )}

      <DeleteBusinessDialog
        business={toDelete ? { id: toDelete.id, name: toDelete.name } : null}
        onOpenChange={(open) => !open && setToDelete(null)}
      />
    </div>
  );
}
