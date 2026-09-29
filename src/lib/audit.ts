import { listClaims, type ClaimRow } from "./db";
import { auditAll, type AuditResult, type RiskLevel } from "./rules/engine";
import { rulesConfig } from "./rules/config";

export type AuditedClaim = ClaimRow & AuditResult;

export const RISK_ORDER: Record<RiskLevel, number> = { High: 0, Medium: 1, Low: 2 };

/** All claims with engine results, riskiest first (score desc, then oldest id). */
export function getAuditedClaims(): AuditedClaim[] {
  const rows = listClaims();
  const results = auditAll(rows, rulesConfig);
  return rows
    .map((r, i) => ({ ...r, ...results[i] }))
    .sort((a, b) => b.score - a.score || a.id - b.id);
}

export function getAuditedClaim(id: number): AuditedClaim | undefined {
  return getAuditedClaims().find((c) => c.id === id);
}
