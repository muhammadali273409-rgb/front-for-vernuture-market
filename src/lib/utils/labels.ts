/**
 * These maps translate backend enum values into i18n key suffixes (never
 * display text directly) so callers can localize with
 * `t(`<namespace>:status.${offerStatusKey[status]}`)`. Keeping the enum→key
 * mapping here (instead of literal strings) means adding a locale never
 * requires touching call sites.
 */
export const offerStatusKey: Record<string, string> = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  VIEWED: "viewed",
  COUNTERED: "countered",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
  EXPIRED: "expired",
};

export const offerStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  SUBMITTED: "secondary",
  VIEWED: "secondary",
  COUNTERED: "default",
  ACCEPTED: "default",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
  EXPIRED: "outline",
};

/** Deal room status (`deals:roomStatus.*`). */
export const dealStatusKey: Record<string, string> = {
  INITIATED: "initiated",
  NDA: "nda",
  DUE_DILIGENCE: "dueDiligence",
  AGREEMENT: "agreement",
  TRANSACTION: "transaction",
  TRANSFER: "transfer",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
};

/** Verification request status (`verification:status.*`). */
export const verificationStatusKey: Record<string, string> = {
  PENDING: "pending",
  IN_REVIEW: "inReview",
  VERIFIED: "verified",
  REJECTED: "rejected",
  EXPIRED: "expired",
};

/** Due-diligence checklist item status (`deals:status.*`). */
export const dueDiligenceStatusKey: Record<string, string> = {
  REQUESTED: "requested",
  UPLOADED: "uploaded",
  UNDER_REVIEW: "underReview",
  APPROVED: "approved",
  NEEDS_CLARIFICATION: "needsClarification",
  REJECTED: "rejected",
  COMPLETED: "completed",
};

/** Notification type (`notifications:types.*`). */
export const notificationTypeKey: Record<string, string> = {
  NEW_MESSAGE: "newMessage",
  NEW_OFFER: "newOffer",
  COUNTER_OFFER: "counterOffer",
  OFFER_ACCEPTED: "offerAccepted",
  OFFER_REJECTED: "offerRejected",
  DOCUMENT_UPLOADED: "documentUploaded",
  DUE_DILIGENCE_REQUEST: "dueDiligenceRequest",
  VERIFICATION_UPDATE: "verificationUpdate",
  DEAL_UPDATE: "dealUpdate",
  SYSTEM: "system",
};

/** Business listing status (`business:status.*`). */
export const businessStatusKey: Record<string, string> = {
  DRAFT: "draft",
  PENDING_REVIEW: "pendingReview",
  PUBLISHED: "published",
  PAUSED: "paused",
  SOLD: "sold",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
  ARCHIVED: "archived",
};

export const businessStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  PENDING_REVIEW: "secondary",
  PUBLISHED: "default",
  PAUSED: "secondary",
  SOLD: "default",
  REJECTED: "destructive",
  SUSPENDED: "destructive",
  ARCHIVED: "outline",
};

/** Deal closing task status (`deals:taskStatus.*`). */
export const dealTaskStatusKey: Record<string, string> = {
  TODO: "todo",
  IN_PROGRESS: "inProgress",
  BLOCKED: "blocked",
  COMPLETED: "completed",
};

/** Document visibility (`documents:visibility.*`). */
export const documentVisibilityKey: Record<string, string> = {
  NDA_REQUIRED: "ndaRequired",
  DEAL_ROOM_ONLY: "dealRoomOnly",
  PUBLIC: "public",
};

/** Document category, as used on the dashboard documents page (`documents:category.*`). */
export const documentCategoryKey: Record<string, string> = {
  Financial: "financial",
  Technical: "technical",
  Legal: "legal",
  Teaser: "teaser",
};

/** Due-diligence checklist category, dashboard due-diligence page (`deals:categories.*`). */
export const dueDiligenceCategoryKey: Record<string, string> = {
  Financials: "financials",
  Technology: "technology",
  Legal: "legal",
  Operations: "operations",
};

/** Financial-metric verification status (`business:metric.verificationStatus.*`). */
export const metricVerificationStatusKey: Record<string, string> = {
  VERIFIED: "verified",
  UNVERIFIED: "unverified",
  PARTIALLY_VERIFIED: "partiallyVerified",
};

/** Verification badge type (`verification:types.*`). */
export const verificationTypeKey: Record<string, string> = {
  IDENTITY: "identity",
  BUSINESS: "business",
  OWNERSHIP: "ownership",
  REVENUE: "revenue",
  TRAFFIC: "traffic",
  FINANCIAL: "financial",
  DOMAIN: "domain",
};
