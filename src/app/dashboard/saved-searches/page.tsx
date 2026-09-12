"use client";

import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/client";

export default function SavedSearchesPage() {
  const { t } = useTranslation("dashboard");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("savedSearches.pageTitle")}
        description={t("savedSearches.pageDescription")}
      />

      <EmptyState
        icon={Bookmark}
        title={t("savedSearches.notAvailableTitle")}
        description={t("savedSearches.notAvailableDescription")}
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/marketplace">
              {t("savedSearches.runSearch")}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        }
      />
    </div>
  );
}
