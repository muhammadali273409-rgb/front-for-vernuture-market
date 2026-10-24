import { test } from "node:test";
import assert from "node:assert/strict";
import { dueDiligenceProgress, nextStep } from "../src/lib/deals/flow.ts";

const BUYER = "buyer-1";
const SELLER = "seller-1";

function deal(status, overrides = {}) {
  return {
    status,
    sellerTransferConfirmedAt: null,
    participants: [
      { userId: BUYER, role: "BUYER", ndaStatus: "PENDING" },
      { userId: SELLER, role: "SELLER", ndaStatus: "PENDING" },
    ],
    ...overrides,
  };
}

function step(status, viewerId, extra = {}) {
  return nextStep({
    deal: extra.deal ?? deal(status),
    viewerId,
    diligenceItems: extra.items ?? [],
    agreements: extra.agreements ?? [],
    transaction: extra.transaction ?? null,
    paymentProvider: extra.provider ?? "manual",
  });
}

test("due diligence progress comes from real items, never a fixed figure", () => {
  assert.equal(dueDiligenceProgress([]).percent, 0);
  const p = dueDiligenceProgress([
    { status: "APPROVED" },
    { status: "COMPLETED" },
    { status: "REQUESTED" },
    { status: "UPLOADED" },
    { status: "REJECTED" },
  ]);
  assert.deepEqual(
    { total: p.total, closed: p.closed, open: p.open, percent: p.percent, sellerTurn: p.sellerTurn, buyerTurn: p.buyerTurn },
    { total: 5, closed: 3, open: 2, percent: 60, sellerTurn: 1, buyerTurn: 1 },
  );
});

test("NDA: an unsigned party signs, the signed party waits", () => {
  const d = deal("NDA", {
    participants: [
      { userId: BUYER, role: "BUYER", ndaStatus: "SIGNED" },
      { userId: SELLER, role: "SELLER", ndaStatus: "PENDING" },
    ],
  });
  assert.equal(step("NDA", SELLER, { deal: d }).action, "signNda");
  const buyer = step("NDA", BUYER, { deal: d });
  assert.equal(buyer.action, null);
  assert.equal(buyer.waiting, true);
  assert.equal(buyer.actor, "SELLER");
});

test("due diligence: buyer adds requests, seller answers, buyer reviews and closes", () => {
  assert.equal(step("DUE_DILIGENCE", BUYER).action, "addDueDiligenceRequest");
  assert.equal(step("DUE_DILIGENCE", SELLER).waiting, true);

  const requested = { items: [{ status: "REQUESTED" }] };
  assert.equal(step("DUE_DILIGENCE", SELLER, requested).action, "answerDueDiligence");
  assert.equal(step("DUE_DILIGENCE", BUYER, requested).waiting, true);

  const answered = { items: [{ status: "UPLOADED" }] };
  assert.equal(step("DUE_DILIGENCE", BUYER, answered).action, "reviewDueDiligence");
  assert.equal(step("DUE_DILIGENCE", SELLER, answered).waiting, true);

  const done = { items: [{ status: "APPROVED" }, { status: "COMPLETED" }] };
  assert.equal(step("DUE_DILIGENCE", BUYER, done).action, "closeDueDiligence");
  assert.equal(step("DUE_DILIGENCE", SELLER, done).action, null);
});

test("agreement: either party drafts, then both sign the latest version", () => {
  assert.equal(step("AGREEMENT", SELLER).action, "createAgreement");
  assert.equal(step("AGREEMENT", BUYER).action, "createAgreement");

  const noVersion = [{ id: "a", status: "DRAFT", versions: [] }];
  assert.equal(step("AGREEMENT", BUYER, { agreements: noVersion }).action, "addAgreementVersion");

  const halfSigned = [
    {
      id: "a",
      status: "PARTIALLY_SIGNED",
      versions: [
        { id: "v2", version: 2, signatures: [{ userId: BUYER }] },
        { id: "v1", version: 1, signatures: [{ userId: BUYER }, { userId: SELLER }] },
      ],
    },
  ];
  assert.equal(step("AGREEMENT", SELLER, { agreements: halfSigned }).action, "signAgreement");
  const buyer = step("AGREEMENT", BUYER, { agreements: halfSigned });
  assert.equal(buyer.action, null);
  assert.equal(buyer.actor, "SELLER");
});

test("manual payment: buyer marks paid, then only the admin can move it", () => {
  assert.equal(step("TRANSACTION", BUYER).action, "markPaid");
  assert.equal(step("TRANSACTION", SELLER).waiting, true);
  const processing = { transaction: { status: "PROCESSING" } };
  const buyer = step("TRANSACTION", BUYER, processing);
  assert.equal(buyer.actor, "ADMIN");
  assert.equal(buyer.action, null);
  assert.equal(buyer.waitingFor, "adminConfirms");
});

test("card payment shows the pay-by-card action to the buyer", () => {
  assert.equal(step("TRANSACTION", BUYER, { provider: "stripe" }).action, "payByCard");
});

test("a deal moved to TRANSACTION without a transaction record still has a next step", () => {
  // Muhammadshop: signed agreement without contentUrl, no transaction yet.
  const s = step("TRANSACTION", BUYER, {
    agreements: [{ id: "a", status: "SIGNED", versions: [{ id: "v1", version: 1, contentUrl: null, signatures: [] }] }],
    transaction: null,
  });
  assert.equal(s.action, "markPaid");
});

test("transfer: seller hands over first, then the buyer confirms receipt", () => {
  assert.equal(step("TRANSFER", SELLER).action, "confirmTransfer");
  assert.equal(step("TRANSFER", BUYER).waiting, true);
  const handed = { deal: deal("TRANSFER", { sellerTransferConfirmedAt: "2026-10-24T00:00:00Z" }) };
  assert.equal(step("TRANSFER", BUYER, handed).action, "confirmReceipt");
  assert.equal(step("TRANSFER", SELLER, handed).waiting, true);
});

test("non-principals never get an action", () => {
  const s = step("TRANSFER", "lawyer-1");
  assert.equal(s.action, null);
  assert.equal(s.waiting, false);
});

test("completed deals have no action and nobody waits", () => {
  const s = step("COMPLETED", BUYER);
  assert.equal(s.action, null);
  assert.equal(s.waiting, false);
});
