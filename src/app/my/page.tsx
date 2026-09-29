import { getAuditedClaims } from "@/lib/audit";
import { idr, dayName } from "@/lib/format";
import { RiskBadge } from "@/components/risk-badge";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";

/** Claims submitted through the demo form (seed claims excluded). No login, so this is everyone's demo submissions. */
export default function MyClaims() {
  const mine = getAuditedClaims().filter((c) => c.source === "demo").sort((a, b) => b.id - a.id);
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
          </li>
        ))}
      </ul>
    </div>
  );
}
