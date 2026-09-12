"use client";

import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessStatusBadge } from "@/components/business/business-status-badge";
import { useMyBusinesses } from "@/hooks/use-businesses";
import { formatCompactMoney } from "@/lib/utils/format";

export default function MyBusinessesPage() {
  const { data: businesses = [], isLoading, isError, error, refetch } = useMyBusinesses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My businesses"
        description="Manage the businesses you're selling on VentureMarket."
        action={
          <Button asChild>
            <Link href="/dashboard/businesses/new">
              <Plus className="size-4" />
              New business
            </Link>
          </Button>
        }
      />

      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No businesses yet"
          description="Create your first business to start building a listing."
          action={
            <Button asChild size="sm">
              <Link href="/dashboard/businesses/new">Create a business</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Link key={business.id} href={`/dashboard/businesses/${business.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-semibold">{business.name}</h3>
                    <BusinessStatusBadge status={business.status} />
                  </div>
                  <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {business.description || "No description yet."}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {formatCompactMoney(business.listing?.askingPrice, business.listing?.currency)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
