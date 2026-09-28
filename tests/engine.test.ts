import { test } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import Database from "better-sqlite3";
import { auditAll, auditClaim, buildDuplicateIndex, normalizeMerchant, type EngineClaim } from "../src/lib/rules/engine";
import { rulesConfig as cfg } from "../src/lib/rules/config";
import { DB_PATH } from "../src/lib/db";
import expected from "./fixtures/seed-expected.json";

execSync("npx tsx scripts/seed.ts", { stdio: "ignore" });
const claims = new Database(DB_PATH, { readonly: true }).prepare("SELECT * FROM claims").all() as EngineClaim[];
const results = auditAll(claims, cfg);
const byId = new Map(results.map((r) => [r.claimId, r]));
const idsWith = (rule: string) => results.filter((r) => r.hits.some((h) => h.rule === rule)).map((r) => r.claimId).sort((a, b) => a - b);
const sorted = (a: number[]) => [...a].sort((x, y) => x - y);
const exp = expected as Record<string, number[]>;

test("seed has 80 claims", () => assert.equal(claims.length, 80));

test("every over-limit claim is caught, nothing else", () => assert.deepEqual(idsWith("over_limit"), sorted(exp.over_limit)));
test("every weekend claim is caught, nothing else", () => assert.deepEqual(idsWith("weekend"), sorted(exp.weekend)));
test("every off-hours claim is caught, nothing else", () => assert.deepEqual(idsWith("off_hours"), sorted(exp.off_hours)));
test("every missing receipt is caught, nothing else", () =>
  assert.deepEqual(idsWith("missing_receipt"), sorted(exp.missing_receipt)));
test("no near-limit hits in seed", () => assert.deepEqual(idsWith("near_limit"), []));

test("all 3 duplicate pairs caught, each pointing at its partner", () => {
  const pairs = Object.keys(exp).filter((k) => k.startsWith("dup_pair_"));
  assert.equal(pairs.length, 3);
  assert.deepEqual(idsWith("duplicate"), sorted(pairs.flatMap((k) => exp[k])));
  for (const k of pairs) {
    const [a, b] = exp[k];
    assert.match(byId.get(a)!.hits.find((h) => h.rule === "duplicate")!.reason, new RegExp(`#${b}\\b`));
    assert.match(byId.get(b)!.hits.find((h) => h.rule === "duplicate")!.reason, new RegExp(`#${a}\\b`));
  }
});

test("clean claims stay Low with no hits", () => {
  for (const id of exp.clean) {
    const r = byId.get(id)!;
    assert.equal(r.risk, "Low", `claim ${id}: ${JSON.stringify(r.hits)}`);
    assert.equal(r.hits.length, 0);
  }
});

test("risk levels follow the scoring table", () => {
  const risk = (k: string) => exp[k].map((id) => byId.get(id)!.risk);
  assert.ok(risk("over_limit").every((r) => r === "High"));
  assert.ok(Object.keys(exp).filter((k) => k.startsWith("dup_pair_")).flatMap(risk).every((r) => r === "High"));
  assert.ok(risk("missing_receipt").every((r) => r === "Medium"));
  assert.ok(risk("weekend").every((r) => r === "Medium"));
  assert.ok(risk("off_hours").every((r) => r === "Medium"));
});

test("every hit has a plain-language reason", () => {
  for (const r of results) for (const h of r.hits) assert.ok(h.reason.length > 10);
});

// Unit cases independent of seed data
const base: EngineClaim = {
  id: 1, category: "Meals", merchant: "Solaria", amount: 100000,
  transaction_date: "2026-09-02", transaction_time: "12:00", receipt_path: "/r.svg",
};
const one = (c: EngineClaim, all: EngineClaim[] = [c], config = cfg) => auditClaim(c, buildDuplicateIndex(all), config);

test("near limit boundary: 80% flags, just under does not", () => {
  assert.deepEqual(one({ ...base, amount: 240000 }).hits.map((h) => h.rule), ["near_limit"]);
  assert.deepEqual(one({ ...base, amount: 239999 }).hits, []);
  assert.deepEqual(one({ ...base, amount: 300000 }).hits.map((h) => h.rule), ["near_limit"]); // at limit = not over
  assert.deepEqual(one({ ...base, amount: 300001 }).hits.map((h) => h.rule), ["over_limit"]);
});

test("off-hours boundaries and missing time", () => {
  assert.deepEqual(one({ ...base, transaction_time: "07:00" }).hits, []);
  assert.deepEqual(one({ ...base, transaction_time: "06:59" }).hits.map((h) => h.rule), ["off_hours"]);
  assert.deepEqual(one({ ...base, transaction_time: "21:00" }).hits.map((h) => h.rule), ["off_hours"]);
  assert.deepEqual(one({ ...base, transaction_time: null }).hits, []);
});

test("weekend + over limit = High with 2 reasons (S5 demo scenario)", () => {
  const r = one({ ...base, amount: 400000, transaction_date: "2026-09-26" });
  assert.equal(r.risk, "High");
  assert.deepEqual(r.hits.map((h) => h.rule).sort(), ["over_limit", "weekend"]);
});

test("duplicate by file hash even when data differs", () => {
  const a = { ...base, id: 1, receipt_hash: "abc" };
  const b = { ...base, id: 2, amount: 55000, merchant: "Other", receipt_hash: "abc" };
  assert.match(one(a, [a, b]).hits[0].reason, /identical receipt file as claim #2/);
});

test("merchant normalization", () => assert.equal(normalizeMerchant("Blue Bird  Taxi."), normalizeMerchant("BLUEBIRD taxi")));

test("config drives results: raising the limit clears over-limit", () => {
  const c = { ...base, amount: 400000 };
  assert.equal(one(c).risk, "High");
  const loose = { ...cfg, categoryLimits: { ...cfg.categoryLimits, Meals: 1000000 } };
  assert.equal(one(c, [c], loose).risk, "Low");
});
