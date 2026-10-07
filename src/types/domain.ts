export type UserRole = "BUYER" | "SELLER" | "BUYER_SELLER" | "ADMIN" | "MODERATOR";

export type PlanCode = "FREE" | "BUYER_PRO" | "SELLER_PRO" | "BUSINESS";

export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING";

export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED" | "PENDING_VERIFICATION";

export type BusinessStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "PAUSED"
  | "SOLD"
  | "REJECTED"
  | "SUSPENDED"
  | "ARCHIVED";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "UNPUBLISHED"
  | "SOLD"
  | "EXPIRED"
  | "SUSPENDED";

export type ListingVisibility = "PUBLIC" | "UNLISTED" | "PRIVATE";

export type MetricType =
  | "MRR"
  | "ARR"
  | "REVENUE"
  | "EXPENSES"
  | "PROFIT"
  | "CUSTOMERS"
  | "CHURN"
  | "GROWTH"
  | "TRAFFIC";

export type VerificationType =
  | "IDENTITY"
  | "BUSINESS"
  | "OWNERSHIP"
  | "REVENUE"
  | "TRAFFIC"
  | "FINANCIAL"
  | "DOMAIN";

export type VerificationStatus = "PENDING" | "IN_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED";

export type OfferStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "VIEWED"
  | "COUNTERED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN"
  | "EXPIRED";

export type NegotiationStatus = "OPEN" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "EXPIRED";

export type DealStatus =
  | "INITIATED"
  | "NDA"
  | "DUE_DILIGENCE"
  | "AGREEMENT"
  | "TRANSACTION"
  | "TRANSFER"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED";

export type DealTaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";

export type DueDiligenceStatus =
  | "REQUESTED"
  | "UPLOADED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "NEEDS_CLARIFICATION"
  | "REJECTED"
  | "COMPLETED";

export type NotificationType =
  | "NEW_MESSAGE"
  | "NEW_OFFER"
  | "COUNTER_OFFER"
  | "OFFER_ACCEPTED"
  | "OFFER_REJECTED"
  | "DOCUMENT_UPLOADED"
  | "DUE_DILIGENCE_REQUEST"
  | "VERIFICATION_UPDATE"
  | "DEAL_UPDATE"
  | "SYSTEM";

export interface Profile {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  country?: string | null;
  company?: string | null;
  website?: string | null;
  timezone?: string | null;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  emailVerifiedAt: string | null;
  createdAt: string;
  profile?: Profile | null;
}

export interface BusinessCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ListingVerificationBadge {
  type: VerificationType;
  status: VerificationStatus;
}

/** Public seller identity shown on listings — never email or account data. */
export interface ListingSeller {
  id: string;
  name: string | null;
  company: string | null;
  avatarUrl: string | null;
  memberSince: string;
}

export type BusinessImageKind = "LOGO" | "GALLERY";

/** Listing media; `url` is a short-lived signed URL from the backend. */
export interface BusinessImage {
  id: string;
  kind: BusinessImageKind;
  url: string;
  position: number;
}

export interface ListingSummary {
  id: string;
  slug: string;
  name: string;
  headline: string | null;
  category: string | null;
  categoryId?: string | null;
  country: string | null;
  city?: string | null;
  businessModel?: string | null;
  askingPrice: number | null;
  currency: string;
  publishedAt: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  /** The seller who published this listing. */
  seller?: ListingSeller;
  /** Verified financial metrics disclosed by the seller, if any — never a client-side estimate. */
  metrics?: BusinessMetric[];
}

export interface ListingDetail extends ListingSummary {
  ownerId: string;
  description: string | null;
  businessModel: string | null;
  foundedAt: string | null;
  website: string | null;
  images?: BusinessImage[];
  verifications: ListingVerificationBadge[];
}

export interface BusinessMetric {
  id: string;
  businessId: string;
  metricType: MetricType;
  value: number;
  currency: string;
  period: string;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | "PARTIALLY_VERIFIED";
}

export interface OwnedBusiness {
  id: string;
  ownerId: string;
  organizationId: string | null;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  businessModel: string | null;
  foundedAt: string | null;
  country: string | null;
  city: string | null;
  website: string | null;
  status: BusinessStatus;
  createdAt: string;
  updatedAt: string;
  listing?: OwnedListing | null;
  category?: BusinessCategory | null;
  metrics?: BusinessMetric[];
  images?: BusinessImage[];
}

export interface OwnedListing {
  id: string;
  businessId: string;
  status: ListingStatus;
  visibility: ListingVisibility;
  askingPrice: number | null;
  currency: string;
  headline: string | null;
  completenessScore: number;
  publishedAt: string | null;
  expiresAt: string | null;
}

export interface OfferParty {
  id: string;
  email: string;
  profile?: Profile | null;
}

export interface OfferRevision {
  id: string;
  offerId: string;
  amount: number;
  currency: string;
  terms: string | null;
  status: OfferStatus;
  submittedById: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  negotiationId: string;
  businessId: string;
  buyerId: string;
  sellerId: string;
  buyer?: OfferParty;
  seller?: OfferParty;
  business?: { id: string; name: string; slug: string };
  parentOfferId: string | null;
  amount: number;
  currency: string;
  terms: string | null;
  status: OfferStatus;
  createdById: string;
  submittedAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  revisions?: OfferRevision[];
}

export interface ConversationParticipant {
  userId: string;
  user?: OfferParty;
  lastReadAt: string | null;
}

export interface Conversation {
  id: string;
  businessId: string | null;
  business?: { id: string; name: string; slug: string } | null;
  participants: ConversationParticipant[];
  /** The service includes only the single most recent message per conversation in list views. */
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: OfferParty;
  body: string;
  createdAt: string;
  editedAt: string | null;
}

export interface DealParticipant {
  userId: string;
  user?: OfferParty;
  role: string;
  ndaStatus: string;
}

export interface DealTask {
  id: string;
  dealId: string;
  title: string;
  description: string | null;
  status: DealTaskStatus;
  ownerId: string | null;
  dueAt: string | null;
}

export interface DealTimelineEvent {
  id: string;
  dealId: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  businessId: string;
  business?: { id: string; name: string; slug: string };
  negotiationId: string;
  acceptedOfferId: string;
  buyerId: string;
  sellerId: string;
  status: DealStatus;
  /** Set when the seller confirms the business was handed over (TRANSFER stage). */
  sellerTransferConfirmedAt?: string | null;
  buyerReceiptConfirmedAt?: string | null;
  participants: DealParticipant[];
  tasks?: DealTask[];
  timelineEvents?: DealTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface DueDiligenceItem {
  id: string;
  requestId: string;
  category: string;
  title: string;
  status: DueDiligenceStatus;
  notes: string | null;
}

export interface DueDiligenceRequest {
  id: string;
  dealId: string;
  title: string;
  items: DueDiligenceItem[];
  createdAt: string;
}

export interface BusinessDocument {
  id: string;
  businessId: string;
  dealId: string | null;
  category: string;
  visibility: string;
  fileName: string;
  uploadedById: string;
  uploadedBy?: OfferParty;
  version: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  businessId: string;
  business?: ListingSummary;
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  alertsEnabled: boolean;
  createdAt: string;
}

export interface Subscription {
  planCode: PlanCode;
  status: SubscriptionStatus;
  /** ISO date the current billing period (or cancellation) ends; null for Free. */
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: string;
  user?: OfferParty;
}

export type AgreementStatus = "DRAFT" | "PENDING_SIGNATURES" | "SIGNED" | "VOID";

export interface AgreementVersion {
  id: string;
  agreementId: string;
  version: number;
  content: string;
  createdById: string;
  createdAt: string;
  signatures?: { userId: string; signedAt: string }[];
}

export interface Agreement {
  id: string;
  dealId: string;
  title: string;
  type: string;
  status: AgreementStatus;
  versions?: AgreementVersion[];
  createdAt: string;
}

export type TransactionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface Transaction {
  id: string;
  dealId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface BillingPlan {
  code: PlanCode;
  name: string;
  price: number;
  currency: string;
  interval: "MONTH" | "YEAR";
  features: string[];
}

export type ReportTargetType = "BUSINESS" | "USER" | "MESSAGE" | "LISTING";
export type ReportStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  businessId: string | null;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface VerificationSubmission {
  id: string;
  businessId: string;
  type: VerificationType;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  expiresAt: string | null;
}

export interface AIAnalysis {
  id: string;
  businessId: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  summary: string | null;
  valuationEstimate: number | null;
  riskFactors: string[] | null;
  createdAt: string;
  completedAt: string | null;
}
