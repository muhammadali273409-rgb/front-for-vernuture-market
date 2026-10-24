import type {
  Agreement,
  AgreementVersion,
  Deal,
  DealParticipantRole,
  DueDiligenceItem,
  DueDiligenceStatus,
  PaymentProvider,
  Transaction,
} from "@/types/domain";

/**
 * Pure deal-room logic: progress figures and "who has to act now". Kept free
 * of React/i18n so it can be unit-tested and so every part of the deal room
 * (stage strip, next-step panel, tabs) reads the same answer.
 */

/** Mirrors OPEN_DUE_DILIGENCE_STATUSES in the backend's deals.service.ts. */
export const OPEN_DUE_DILIGENCE_STATUSES: DueDiligenceStatus[] = [
  "REQUESTED",
  "UPLOADED",
  "UNDER_REVIEW",
  "NEEDS_CLARIFICATION",
];
/** Waiting for the seller to answer. */
export const SELLER_TURN_STATUSES: DueDiligenceStatus[] = ["REQUESTED", "NEEDS_CLARIFICATION"];
/** Answered — waiting for the buyer to review. */
export const BUYER_TURN_STATUSES: DueDiligenceStatus[] = ["UPLOADED", "UNDER_REVIEW"];

export const DEAL_STAGES = ["INITIATED", "NDA", "DUE_DILIGENCE", "AGREEMENT", "TRANSACTION", "TRANSFER"] as const;

export interface DueDiligenceProgress {
  total: number;
  closed: number;
  open: number;
  /** 0–100, computed from real items; 0 when there are none. */
  percent: number;
  sellerTurn: number;
  buyerTurn: number;
}

export function dueDiligenceProgress(items: Pick<DueDiligenceItem, "status">[]): DueDiligenceProgress {
  const total = items.length;
  const open = items.filter((i) => OPEN_DUE_DILIGENCE_STATUSES.includes(i.status)).length;
  const closed = total - open;
  return {
    total,
    closed,
    open,
    percent: total === 0 ? 0 : Math.round((closed / total) * 100),
    sellerTurn: items.filter((i) => SELLER_TURN_STATUSES.includes(i.status)).length,
    buyerTurn: items.filter((i) => BUYER_TURN_STATUSES.includes(i.status)).length,
  };
}

/** The agreement the parties are working on: the newest one that isn't void. */
export function currentAgreement(agreements: Agreement[]): Agreement | undefined {
  return agreements.find((a) => a.status !== "VOID");
}

export function latestVersion(agreement: Agreement | undefined): AgreementVersion | undefined {
  if (!agreement?.versions?.length) return undefined;
  return agreement.versions.reduce((a, b) => (b.version > a.version ? b : a));
}

export type DealSide = "BUYER" | "SELLER";

/** Who is expected to act next. `BOTH` = either principal may; `ADMIN` = platform. */
export type DealActor = DealSide | "BOTH" | "ADMIN" | "NONE";

export type DealAction =
  | "startNda"
  | "signNda"
  | "addDueDiligenceRequest"
  | "answerDueDiligence"
  | "reviewDueDiligence"
  | "closeDueDiligence"
  | "createAgreement"
  | "addAgreementVersion"
  | "signAgreement"
  | "markPaid"
  | "payByCard"
  | "confirmTransfer"
  | "confirmReceipt";

export interface NextStep {
  /** i18n key under `deals:flow.stage.*` describing what is happening. */
  stage: string;
  actor: DealActor;
  /** The single action the *viewer* should take now, if any. */
  action: DealAction | null;
  /** True when the viewer is a principal but it's someone else's turn. */
  waiting: boolean;
  /** i18n key under `deals:flow.waiting.*` explaining what we wait for. */
  waitingFor?: string;
}

export interface NextStepInput {
  deal: Pick<Deal, "status" | "participants" | "sellerTransferConfirmedAt">;
  viewerId: string | undefined;
  diligenceItems: Pick<DueDiligenceItem, "status">[];
  agreements: Agreement[];
  transaction: Pick<Transaction, "status"> | null | undefined;
  paymentProvider: PaymentProvider | undefined;
}

export function viewerSide(
  deal: Pick<Deal, "participants">,
  viewerId: string | undefined,
): DealSide | null {
  const role: DealParticipantRole | undefined = deal.participants.find((p) => p.userId === viewerId)?.role;
  return role === "BUYER" || role === "SELLER" ? role : null;
}

export function nextStep({
  deal,
  viewerId,
  diligenceItems,
  agreements,
  transaction,
  paymentProvider,
}: NextStepInput): NextStep {
  const side = viewerSide(deal, viewerId);
  const step = (stage: string, actor: DealActor, mine: DealAction | null, waitingFor?: string): NextStep => {
    const viewerActs = side !== null && (actor === "BOTH" || actor === side) && mine !== null;
    return {
      stage,
      actor,
      action: viewerActs ? mine : null,
      waiting: side !== null && !viewerActs && actor !== "NONE",
      waitingFor: viewerActs ? undefined : waitingFor,
    };
  };

  switch (deal.status) {
    case "INITIATED":
      return step("initiated", "BOTH", "startNda");

    case "NDA": {
      const principals = deal.participants.filter((p) => p.role === "BUYER" || p.role === "SELLER");
      const unsigned = principals.filter((p) => p.ndaStatus !== "SIGNED");
      const meUnsigned = unsigned.some((p) => p.userId === viewerId);
      if (meUnsigned) return step("nda", side ?? "BOTH", "signNda");
      const other = unsigned[0]?.role === "SELLER" ? "SELLER" : "BUYER";
      return step("nda", unsigned.length ? other : "NONE", null, "otherNda");
    }

    case "DUE_DILIGENCE": {
      const dd = dueDiligenceProgress(diligenceItems);
      if (dd.total === 0) return step("dueDiligenceEmpty", "BUYER", "addDueDiligenceRequest", "buyerRequests");
      if (dd.buyerTurn > 0) {
        // The buyer has answers to review; the seller may still owe others.
        if (side === "SELLER" && dd.sellerTurn > 0) return step("dueDiligence", "SELLER", "answerDueDiligence");
        return step("dueDiligence", "BUYER", "reviewDueDiligence", "buyerReview");
      }
      if (dd.sellerTurn > 0) return step("dueDiligence", "SELLER", "answerDueDiligence", "sellerAnswers");
      return step("dueDiligenceDone", "BUYER", "closeDueDiligence", "buyerCloses");
    }

    case "AGREEMENT": {
      const agreement = currentAgreement(agreements);
      if (!agreement) return step("agreementNone", "BOTH", "createAgreement");
      const version = latestVersion(agreement);
      if (!version) return step("agreementNoVersion", "BOTH", "addAgreementVersion");
      const signers = new Set(version.signatures.map((s) => s.userId));
      const unsigned = deal.participants.filter(
        (p) => (p.role === "BUYER" || p.role === "SELLER") && !signers.has(p.userId),
      );
      if (viewerId && unsigned.some((p) => p.userId === viewerId)) {
        return step("agreementSign", side ?? "BOTH", "signAgreement");
      }
      const other = unsigned[0]?.role === "SELLER" ? "SELLER" : "BUYER";
      return step("agreementSign", unsigned.length ? other : "NONE", null, "otherSignature");
    }

    case "TRANSACTION": {
      if (transaction?.status === "COMPLETED") return step("paymentConfirmed", "NONE", null);
      if (paymentProvider === "stripe") return step("paymentCard", "BUYER", "payByCard", "buyerPays");
      if (transaction?.status === "PROCESSING") return step("paymentReview", "ADMIN", null, "adminConfirms");
      return step("paymentManual", "BUYER", "markPaid", "buyerPays");
    }

    case "TRANSFER":
      if (!deal.sellerTransferConfirmedAt) return step("transfer", "SELLER", "confirmTransfer", "sellerTransfers");
      return step("transferReceipt", "BUYER", "confirmReceipt", "buyerReceives");

    case "COMPLETED":
      return step("completed", "NONE", null);
    case "CANCELLED":
      return step("cancelled", "NONE", null);
    case "DISPUTED":
      return step("disputed", "ADMIN", null, "adminResolves");
    default:
      return step("unknown", "NONE", null);
  }
}
