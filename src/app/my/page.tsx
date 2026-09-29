import { getAuditedClaims } from "@/lib/audit";
import { idr, dayName } from "@/lib/format";
import { RiskBadge } from "@/components/risk-badge";
import { StatusChip } from "@/components/status-chip";
import { requirePageRole } from "@/lib/role";

export const dynamic = "force-dynamic";

/** Claims submitted through the demo form (seed claims excluded). No login, so this is everyone's demo submissions. */
export default async function MyClaims() {
  const me = await requirePageRole("employee");
  // Signed in: only this employee's claims. Without login: every demo submission.
  const mine = getAuditedClaims().filter((c) => c.source === "demo" && (!me.employeeId || c.employee_id === me.employeeId)).sort((a, b) => b.id - a.id);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Submitted in this demo</h1>
        <p className="text-sm text-muted-foreground">Status updates when Finance approves or rejects.</p>
      </div>
      {mine.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nothing submitted yet.</p>}
      <ul className="space-y-3">
        {mine.map((c) => (
          <li key={c.id} className="rounded-xl border bg-background p-4">
            <div className="flex items-center justify-between">
              <RiskBadge risk={c.risk} />
              <StatusChip status={c.audit_status} />
            </div>
            <div className="mt-2 font-semibold tabular-nums">{idr(c.amount)} · {c.category}</div>
            <div className="text-sm text-muted-foreground">{c.merchant} · {dayName(c.transaction_date)} {c.transaction_date} · #{c.id}</div>
            {c.audit_reason && <div className="mt-1 text-sm text-red-800">Rejected: {c.audit_reason}</div>}
            {c.audit_note && <div className="text-sm text-muted-foreground">Finance note: {c.audit_note}</div>}
            {c.audit_status === "approved" && (
              <div className="mt-1 text-sm text-emerald-800">Approved · payout queued (Dicairkan, MOCK)</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
