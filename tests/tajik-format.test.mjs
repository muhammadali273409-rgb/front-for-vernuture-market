import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTajikCurrency } from "../src/i18n/tajik-number.ts";

// Non-breaking spaces keep "$1 000" on one line; compare with plain spaces.
const nb = (s) => s.replace(/ /g, " ");

test("formats Tajik money with symbol first and space-grouped thousands", () => {
  assert.equal(nb(formatTajikCurrency(1000, "USD")), "$1 000");
  assert.equal(nb(formatTajikCurrency(5000, "USD")), "$5 000");
  assert.equal(nb(formatTajikCurrency(1234567, "EUR")), "€1 234 567");
  assert.equal(nb(formatTajikCurrency(999, "USD")), "$999");
  assert.equal(nb(formatTajikCurrency(12.5, "USD", { maximumFractionDigits: 2 })), "$12,5");
});

test("uses Tajik compact units, never Russian ones", () => {
  const compact = (v) => nb(formatTajikCurrency(v, "USD", { notation: "compact", maximumFractionDigits: 1 }));
  assert.equal(compact(1000), "$1 ҳаз.");
  assert.equal(compact(1500), "$1,5 ҳаз.");
  assert.equal(compact(120000), "$120 ҳаз.");
  assert.equal(compact(2_400_000), "$2,4 млн");
  assert.equal(compact(3e9), "$3 млрд");
  assert.equal(compact(450), "$450");
});
