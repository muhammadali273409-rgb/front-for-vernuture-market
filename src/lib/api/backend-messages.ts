/**
 * The backend's messages are English. For codes that are too broad to say
 * anything on their own (CONFLICT, DEAL_ACCESS_DENIED, …) the message *is*
 * the explanation, so we translate the deal-flow ones here (keys under
 * `errors:backend.*`). Anything unmatched is shown as the backend sent it —
 * a real reason in English beats a generic "something went wrong".
 */
const EXACT: Record<string, string> = {
  "You are not part of this deal": "notParticipant",
  "Deal not found": "dealNotFound",
  "Only the buyer and seller sign the deal NDA": "ndaPrincipalsOnly",
  "The deal is not waiting for NDA signatures": "notNdaStage",
  "You have already signed the NDA": "ndaAlreadySigned",
  "Only the seller confirms the business transfer": "sellerConfirmsTransfer",
  "The deal is not in the transfer stage": "notTransferStage",
  "Transfer was already confirmed": "transferAlreadyConfirmed",
  "Only the buyer confirms receipt of the business": "buyerConfirmsReceipt",
  "The seller has not confirmed the transfer yet": "sellerNotTransferred",
  "The deal status changed in the meantime — reload and try again": "dealChanged",
  "Only the buyer or seller can change the deal status": "principalsOnly",
  "Only an administrator can resolve a disputed deal": "disputeAdminOnly",
  "Due diligence starts automatically once both parties sign the NDA": "ddStartsAfterNda",
  "Only the buyer can close due diligence": "buyerClosesDd",
  "Payment starts automatically once both parties sign the agreement": "paymentStartsAfterAgreement",
  "Transfer starts automatically once the payment provider confirms payment": "transferStartsAfterPayment",
  "Use confirm-transfer (seller) and confirm-receipt (buyer) to complete": "useTransferButtons",
  "Once payment has started only an administrator can cancel the deal": "cancelAdminOnly",
  "Only the buyer side can request due diligence documents": "buyerRequestsDd",
  "Due diligence requests can only be made during the DUE_DILIGENCE stage": "notDdStage",
  "Due diligence items can only be updated during the DUE_DILIGENCE stage": "notDdStage",
  "Only the seller side attaches documents to due diligence items": "sellerAttachesDd",
  "Only the seller side answers due diligence items": "sellerAnswersDd",
  "Write an answer or attach a document": "ddAnswerEmpty",
  "Due diligence item not found": "ddItemNotFound",
  "Document not found for this business": "documentNotInBusiness",
  "Only the buyer, seller or a lawyer can draft agreements": "agreementAuthors",
  "Only the buyer, seller or a lawyer can add agreement versions": "agreementAuthors",
  "Agreements can only be drafted in the AGREEMENT stage": "notAgreementStage",
  "Agreements can only be changed in the AGREEMENT stage": "notAgreementStage",
  "Agreements can only be signed in the AGREEMENT stage": "notAgreementStage",
  "Attach the agreement file or a link to it": "agreementFileMissing",
  "Document not found in this deal": "documentNotInDeal",
  "Only the latest version of this agreement can be signed": "signLatestOnly",
  "Only the buyer and seller sign the agreement": "agreementPrincipalsOnly",
  "Agreement not found": "agreementNotFound",
  "A signed agreement cannot be changed": "agreementLocked",
  "A void agreement cannot be changed": "agreementLocked",
  "This agreement is already signed": "agreementAlreadySigned",
  "This agreement is already void": "agreementLocked",
  "Only the buyer starts the payment": "buyerPays",
  "Deal must be in the TRANSACTION stage to create a payment transaction": "notPaymentStage",
  "This deal is paid by card — use the payment page instead": "paidByCard",
  "You have already marked this payment as sent — an administrator is checking it": "alreadyMarkedPaid",
  "This payment was already confirmed": "paymentAlreadyConfirmed",
  "The buyer has not marked this payment as sent yet": "paymentNotMarked",
  "The deal is not waiting for payment": "notPaymentStage",
  "Only a payment marked as sent can be rejected": "paymentNotMarked",
  "Documents cannot be added to a closed deal": "dealClosed",
  "This deal is not about this business": "documentNotInBusiness",
  "File type not permitted": "fileType",
  "File exceeds the 25MB limit": "fileTooLarge",
};

const PATTERNS: [RegExp, string][] = [
  [/^Cannot transition deal from \w+ to \w+$/, "invalidTransition"],
  [/^You can only set: /, "ddStatusNotAllowed"],
  [/^\d+ due diligence item\(s\) are still open$/, "ddItemsOpen"],
];

/** The `errors:backend.*` key for a backend message, if we have a translation. */
export function backendMessageKey(message: string): string | undefined {
  const exact = EXACT[message.trim()];
  if (exact) return exact;
  return PATTERNS.find(([pattern]) => pattern.test(message.trim()))?.[1];
}
