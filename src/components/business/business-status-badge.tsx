"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/client";
import { businessStatusKey, businessStatusVariant } from "@/lib/utils/labels";
import type { BusinessStatus } from "@/types/domain";

export function BusinessStatusBadge({ status }: { status: BusinessStatus }) {
  const { t } = useTranslation("business");
  return (
    <Badge variant={businessStatusVariant[status]}>{t(`status.${businessStatusKey[status]}`)}</Badge>
  );
}
