import { listClaims, dupKeys, type ClaimRow } from "./store";
import { auditAll, type AuditResult, type EngineClaim, type RiskLevel } from "./rules/engine";
import { getEffectiveConfig } from "./settings";

export type AuditedClaim = ClaimRow & AuditResult;

export const RISK_ORDER: Record<RiskLevel, number> = { High: 0, Medium: 1, Low: 2 };

/**
 * All claims this user may see, with engine results: undecided first, then riskiest (score desc), then oldest id.
 * Employees can only read their own rows, but a duplicate must be found against everyone's claims: the database
 * hands back the few fields the duplicate check needs (never names or notes) and they join the check as stubs.
 */
export async function getAuditedClaims(): Promise<AuditedClaim[]> {
  const [rows, cfg, keys] = await Promise.all([listClaims(), getEffectiveConfig(), dupKeys()]);
  const own = new Set(rows.map((r) => r.id));
  const stubs: EngineClaim[] = keys
    .filter((k) => !own.has(k.id))
    .map((k) => ({ id: k.id, category: "", merchant: k.merchant, amount: k.amount, transaction_date: k.transaction_date,
      transaction_time: null, receipt_path: null, receipt_hash: k.receipt_hash }));
  const results = auditAll([...rows, ...stubs], cfg).slice(0, rows.length); // stubs only feed the duplicate index
  return rows
    .map((r, i) => ({ ...r, ...results[i] }))
    .sort(
      (a, b) =>
        Number(a.audit_status !== "pending") - Number(b.audit_status !== "pending") || b.score - a.score || a.id - b.id
    );
}
