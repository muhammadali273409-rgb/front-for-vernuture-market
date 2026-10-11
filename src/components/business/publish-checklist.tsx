"use client";

import { AlertTriangle, CircleDashed } from "lucide-react";
import { useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";
import { PUBLISH_FIELD_LABEL, describeMissing } from "@/lib/business/publish-fields";
import type { PublishField } from "@/types/domain";

/**
 * What a draft still needs before it can be published, straight from the
 * backend's own completeness check. After a blocked publish attempt it turns
 * into an error naming the fields; each field is a link that jumps to it.
 */
export function PublishChecklist({
  missing,
  blocked,
  onGoToField,
}: {
  missing: PublishField[];
  /** A publish attempt was just refused for these fields. */
  blocked: boolean;
  onGoToField: (field: PublishField) => void;
}) {
  const { t } = useTranslation("business");
  if (missing.length === 0) return null;

  return (
    <div
      role={blocked ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        blocked
          ? "border-destructive/40 bg-destructive/5 text-destructive"
          : "border-amber-500/40 bg-amber-500/5 text-foreground",
      )}
    >
      <p className="flex items-center gap-2 font-medium">
        {blocked ? <AlertTriangle className="size-4" /> : <CircleDashed className="size-4 text-amber-600" />}
        {blocked ? describeMissing(t, missing) : t("publishMissing.title")}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {missing.map((field) => (
          <button
            key={field}
            type="button"
            onClick={() => onGoToField(field)}
            className="rounded-full border border-current/30 bg-background px-2.5 py-0.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
          >
            {t(PUBLISH_FIELD_LABEL[field])} →
          </button>
        ))}
      </div>
    </div>
  );
}
