/**
 * Module A: rules and audit engine. Pure functions, no DB or I/O.
 * Input: one claim + the full claim set (for duplicate matching) + config. Output: rule hits + score + risk.
 * Flags mean "review", never "reject" (master-plan A-03).
 */

export type RulesConfig = {
  categoryLimits: Record<string, number>;
  nearLimitPct: number;
  workingHours: { start: string; end: string };
  weekendDays: number[];
  scoreWeights: Record<RuleId, number>;
  riskBands: { mediumMin: number; highMin: number };
};

export type RuleId = "over_limit" | "near_limit" | "duplicate" | "weekend" | "off_hours" | "missing_receipt";
export type RiskLevel = "Low" | "Medium" | "High";

export type EngineClaim = {
  id: number;
  category: string;
  merchant: string;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  transaction_time: string | null; // HH:MM
  receipt_path: string | null;
  receipt_hash?: string | null; // only for uploaded files; seed placeholders have none
};

/** Values behind a reason, so the UI can say the same thing in another language (lib/i18n/reasons.ts). */
export type HitParams = {
  amount?: number; limit?: number; category?: string; pct?: number;
  dataIds?: number[]; hashIds?: number[]; dow?: number; date?: string; time?: string; start?: string; end?: string;
};
export type RuleHit = { rule: RuleId; points: number; reason: string; params?: HitParams };
export type AuditResult = { claimId: number; hits: RuleHit[]; score: number; risk: RiskLevel };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const idr = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Lowercase, strip everything except letters and digits: "Blue Bird  Taxi" == "BLUEBIRD TAXI." */
export const normalizeMerchant = (m: string) => m.toLowerCase().replace(/[^a-z0-9]/g, "");

const dupKey = (c: EngineClaim) => `${c.amount}|${c.transaction_date}|${normalizeMerchant(c.merchant)}`;

export function riskFromScore(score: number, cfg: RulesConfig): RiskLevel {
  if (score >= cfg.riskBands.highMin) return "High";
  if (score >= cfg.riskBands.mediumMin) return "Medium";
  return "Low";
}

/** Precompute duplicate groups once for the whole set: O(n) instead of O(n^2). */
export function buildDuplicateIndex(all: EngineClaim[]) {
  const byData = new Map<string, number[]>();
  const byHash = new Map<string, number[]>();
  for (const c of all) {
    const k = dupKey(c);
    byData.set(k, [...(byData.get(k) ?? []), c.id]);
    if (c.receipt_hash) byHash.set(c.receipt_hash, [...(byHash.get(c.receipt_hash) ?? []), c.id]);
  }
  return { byData, byHash };
}
export type DuplicateIndex = ReturnType<typeof buildDuplicateIndex>;

export function auditClaim(c: EngineClaim, dupIndex: DuplicateIndex, cfg: RulesConfig): AuditResult {
  const hits: RuleHit[] = [];
  const add = (rule: RuleId, reason: string, params?: HitParams) => hits.push({ rule, points: cfg.scoreWeights[rule], reason, params });

  const limit = cfg.categoryLimits[c.category];
  if (limit !== undefined) {
    if (c.amount > limit) {
      add("over_limit", `${idr(c.amount)} is over the ${c.category} limit of ${idr(limit)} (by ${idr(c.amount - limit)}).`, { amount: c.amount, limit, category: c.category });
    } else if (c.amount >= limit * cfg.nearLimitPct) {
      const pct = Math.round((c.amount / limit) * 100);
      add("near_limit", `${idr(c.amount)} is ${pct}% of the ${c.category} limit of ${idr(limit)}.`, { amount: c.amount, limit, category: c.category, pct });
    }
  }

  const dataMatches = (dupIndex.byData.get(dupKey(c)) ?? []).filter((id) => id !== c.id);
  const hashMatches = c.receipt_hash ? (dupIndex.byHash.get(c.receipt_hash) ?? []).filter((id) => id !== c.id) : [];
  if (dataMatches.length || hashMatches.length) {
    const parts: string[] = [];
    if (dataMatches.length)
      parts.push(`same amount, date and merchant as claim ${dataMatches.map((i) => `#${i}`).join(", ")}`);
    if (hashMatches.length) parts.push(`identical receipt file as claim ${hashMatches.map((i) => `#${i}`).join(", ")}`);
    add("duplicate", `Possible duplicate: ${parts.join("; ")}.`, { dataIds: dataMatches, hashIds: hashMatches });
  }

  const dow = new Date(`${c.transaction_date}T00:00:00Z`).getUTCDay();
  if (cfg.weekendDays.includes(dow)) add("weekend", `Transaction on a ${DAYS[dow]} (${c.transaction_date}).`, { dow, date: c.transaction_date });

  if (c.transaction_time) {
    const t = toMin(c.transaction_time);
    if (t < toMin(cfg.workingHours.start) || t >= toMin(cfg.workingHours.end))
      add("off_hours", `Transaction at ${c.transaction_time}, outside working hours ${cfg.workingHours.start} to ${cfg.workingHours.end}.`, {
        time: c.transaction_time, start: cfg.workingHours.start, end: cfg.workingHours.end,
      });
  }

  if (!c.receipt_path) add("missing_receipt", "No receipt attached.");

  const score = hits.reduce((s, h) => s + h.points, 0);
  return { claimId: c.id, hits, score, risk: riskFromScore(score, cfg) };
}

export function auditAll(all: EngineClaim[], cfg: RulesConfig): AuditResult[] {
  const idx = buildDuplicateIndex(all);
  return all.map((c) => auditClaim(c, idx, cfg));
}
