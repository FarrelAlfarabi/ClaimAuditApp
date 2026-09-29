import { listClaims, type ClaimRow } from "./db";
import { auditAll, type AuditResult, type RiskLevel } from "./rules/engine";
import { getEffectiveConfig } from "./settings";

export type AuditedClaim = ClaimRow & AuditResult;

export const RISK_ORDER: Record<RiskLevel, number> = { High: 0, Medium: 1, Low: 2 };

/** All claims with engine results: undecided first, then riskiest (score desc), then oldest id. */
export function getAuditedClaims(): AuditedClaim[] {
  const rows = listClaims();
  const results = auditAll(rows, getEffectiveConfig());
  return rows
    .map((r, i) => ({ ...r, ...results[i] }))
    .sort(
      (a, b) =>
        Number(a.audit_status !== "pending") - Number(b.audit_status !== "pending") || b.score - a.score || a.id - b.id
    );
}
