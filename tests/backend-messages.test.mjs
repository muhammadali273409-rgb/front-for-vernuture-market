import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { backendMessageKey } from "../src/lib/api/backend-messages.ts";

const locale = (l) => JSON.parse(fs.readFileSync(new URL(`../src/i18n/locales/${l}/errors.json`, import.meta.url), "utf8"));

test("deal-flow backend messages map to translation keys", () => {
  assert.equal(backendMessageKey("Only the buyer can close due diligence"), "buyerClosesDd");
  assert.equal(backendMessageKey("Cannot transition deal from NDA to TRANSFER"), "invalidTransition");
  assert.equal(backendMessageKey("2 due diligence item(s) are still open"), "ddItemsOpen");
  assert.equal(backendMessageKey("Something nobody translated"), undefined);
});

test("every mapped key is translated in Tajik, Russian and English", () => {
  const src = fs.readFileSync(new URL("../src/lib/api/backend-messages.ts", import.meta.url), "utf8");
  const keys = new Set([...src.matchAll(/"(\w+)"(?:,|\])/g)].map((m) => m[1]));
  for (const l of ["tj", "ru", "en"]) {
    const backend = locale(l).backend;
    for (const key of keys) assert.ok(backend[key], `${l}: errors.backend.${key} is missing`);
  }
});

test("new deal error codes are translated", () => {
  for (const l of ["tj", "ru", "en"]) {
    const errors = locale(l);
    for (const code of ["DUE_DILIGENCE_NO_ITEMS", "PAYMENT_PROVIDER_NOT_CONFIGURED", "PAYMENT_NOT_MANUAL"]) {
      assert.ok(errors[code], `${l}: ${code}`);
    }
  }
});
