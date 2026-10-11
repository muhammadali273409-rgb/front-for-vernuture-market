import { ApiError } from "@/lib/api/error";
import type { PublishField } from "@/types/domain";

/** In the backend's order; also the order fields appear on the edit page. */
export const PUBLISH_FIELDS: PublishField[] = ["name", "description", "categoryId", "businessModel", "askingPrice"];

/** Which tab of the project page holds each field. */
export const PUBLISH_FIELD_TAB: Record<PublishField, "overview" | "listing"> = {
  name: "overview",
  description: "overview",
  categoryId: "overview",
  businessModel: "overview",
  askingPrice: "listing",
};

/** business-namespace label key for each field. */
export const PUBLISH_FIELD_LABEL: Record<PublishField, string> = {
  name: "business:businessName",
  description: "business:description",
  categoryId: "business:category",
  businessModel: "business:businessModel",
  askingPrice: "business:askingPrice",
};

/** DOM id of the form item for a field, used to scroll to and focus it. */
export const publishFieldDomId = (field: PublishField) => `field-${field}`;

export function isPublishField(value: unknown): value is PublishField {
  return typeof value === "string" && (PUBLISH_FIELDS as string[]).includes(value);
}

/** The missing fields from a LISTING_INCOMPLETE publish error, or null for any other error. */
export function missingFieldsFromError(error: unknown): PublishField[] | null {
  if (!(error instanceof ApiError) || error.code !== "LISTING_INCOMPLETE") return null;
  const missing = (error.details as { missing?: unknown } | undefined)?.missing;
  return Array.isArray(missing) ? missing.filter(isPublishField) : [];
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** «Категория ва Нархи пешниҳодшуда пур карда нашудаанд.» in the active language. */
export function describeMissing(t: Translate, missing: PublishField[]): string {
  const labels = missing.map((field) => t(PUBLISH_FIELD_LABEL[field]));
  const and = t("business:publishMissing.and");
  const fields =
    labels.length <= 1 ? (labels[0] ?? "") : `${labels.slice(0, -1).join(", ")} ${and} ${labels[labels.length - 1]}`;
  return t("business:publishMissing.sentence", { count: labels.length, fields });
}

/** Scroll to a field's form item and focus its control. */
export function focusPublishField(field: PublishField): void {
  const element = document.getElementById(publishFieldDomId(field));
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
}
