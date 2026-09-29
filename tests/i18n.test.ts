import { test } from "node:test";
import assert from "node:assert/strict";
import { auditClaim, buildDuplicateIndex, type EngineClaim, type RuleHit } from "../src/lib/rules/engine";
import { rulesConfig as cfg, rejectionReasons } from "../src/lib/rules/config";
import { DICTS, dictFor } from "../src/lib/i18n/dict";
import { reasonText } from "../src/lib/i18n/reasons";

// One claim that trips every rule (duplicate needs a twin with the same amount, date and merchant).
const base: EngineClaim = {
  id: 1, category: "Meals", merchant: "Kopi Contoh", amount: 350000, transaction_date: "2026-09-26",
  transaction_time: "22:14", receipt_path: null, receipt_hash: "abc",
};
const twin: EngineClaim = { ...base, id: 2 };
const near: EngineClaim = { ...base, id: 3, amount: 270000, transaction_date: "2026-09-24", merchant: "Other" };
const all = [base, twin, near];
const idx = buildDuplicateIndex(all);
const hits: RuleHit[] = [...auditClaim(base, idx, cfg).hits, ...auditClaim(near, idx, cfg).hits];

test("fixture covers every rule", () => {
  assert.deepEqual([...new Set(hits.map((h) => h.rule))].sort(),
    ["duplicate", "missing_receipt", "near_limit", "off_hours", "over_limit", "weekend"]);
});

test("English text rebuilt from params is exactly the engine's reason (they cannot drift apart)", () => {
  for (const h of hits) assert.equal(reasonText(h, dictFor("en")), h.reason, h.rule);
});

test("Indonesian reasons are translated and keep the numbers", () => {
  const id = dictFor("id");
  for (const h of hits) {
    const s = reasonText(h, id);
    assert.notEqual(s, h.reason, h.rule);
    for (const n of h.reason.match(/Rp [\d.]+|\d{2}:\d{2}|#\d+|\d{4}-\d{2}-\d{2}/g) ?? []) assert.ok(s.includes(n), `${h.rule}: ${n} missing in "${s}"`);
  }
  assert.match(reasonText(hits.find((h) => h.rule === "weekend")!, id), /Sabtu/);
  assert.match(reasonText(hits.find((h) => h.rule === "over_limit")!, id), /batas Makan/);
});

test("hits without params fall back to the English reason", () => {
  assert.equal(reasonText({ rule: "weekend", points: 1, reason: "legacy text" }, dictFor("id")), "legacy text");
});

test("every category and rejection reason in the config has an Indonesian label", () => {
  for (const c of Object.keys(cfg.categoryLimits)) assert.ok(DICTS.id.category[c], c);
  assert.equal(rejectionReasons.length, 6);
  for (const r of rejectionReasons) assert.ok(DICTS.id.rejectReason[r], r);
});
