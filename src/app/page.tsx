import Link from "next/link";
import { getAuditedClaims } from "@/lib/audit";
import { idr, dayName } from "@/lib/format";
import { RiskBadge } from "@/components/risk-badge";
import { FilterSheet, type Filters } from "@/components/filter-sheet";
import type { RiskLevel } from "@/lib/rules/engine";
import { StatusChip } from "@/components/status-chip";
import { BatchApprove } from "@/components/batch-approve";

export const dynamic = "force-dynamic";

const uniq = (a: string[]) => [...new Set(a)].sort();

export default async function Queue({ searchParams }: { searchParams: Promise<Filters> }) {
  const f = await searchParams;
  const all = getAuditedClaims();
  const claims = all.filter(
    (c) =>
      (!f.risk || c.risk === f.risk) &&
      (!f.category || c.category === f.category) &&
      (!f.dept || c.department_name === f.dept) &&
      (!f.status || c.audit_status === f.status)
  );
  const counts = (["High", "Medium", "Low"] as RiskLevel[]).map((r) => ({ r, n: all.filter((c) => c.risk === r).length }));
  const approved = all.filter((c) => c.audit_status === "approved").length;
  const options = {
    categories: uniq(all.map((c) => c.category)),
    departments: uniq(all.map((c) => c.department_name)),
    statuses: ["pending", "approved", "rejected"],
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Audit queue</h1>
        <p className="text-sm text-muted-foreground">Riskiest first. Flags mean review, not reject.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {counts.map(({ r, n }) => (
          <Link key={r} href={f.risk === r ? "/" : `/?risk=${r}`}
            className={`rounded-xl border bg-background p-3 text-center ${f.risk === r ? "ring-2 ring-foreground" : ""}`}>
            <div className="text-2xl font-bold tabular-nums">{n}</div>
            <div className="text-xs text-muted-foreground">{r}</div>
          </Link>
        ))}
      </div>

      <BatchApprove count={all.filter((c) => c.risk === "Low" && c.audit_status === "pending").length} />

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{claims.length} of {all.length} claims</span>
        <div className="flex gap-2">
          <a href="/api/export" className="flex h-11 items-center rounded-full border bg-background px-4 text-sm font-medium" download>
            Export CSV ({approved})
          </a>
          <FilterSheet options={options} current={f} />
        </div>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {claims.map((c) => (
          <li key={c.id}>
            <Link href={`/claims/${c.id}`}
              className="block rounded-xl border bg-background p-4 active:bg-muted md:hover:bg-muted/50">
              <div className="flex items-start justify-between gap-3">
                <RiskBadge risk={c.risk} />
                <div className="flex flex-col items-end gap-1 text-right">
                  <div className="text-lg font-semibold tabular-nums">{idr(c.amount)}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {c.audit_status !== "pending" && <StatusChip status={c.audit_status} />}#{c.id}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="font-medium">{c.employee_name}</span>
                <span className="text-muted-foreground"> · {c.category}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {c.merchant} · {dayName(c.transaction_date)} {c.transaction_date}
                {c.transaction_time ? ` ${c.transaction_time}` : ""}
              </div>
              {c.hits.length > 0 && (
                <p className="mt-2 text-sm">
                  {c.hits[0].reason}
                  {c.hits.length > 1 && <span className="text-muted-foreground"> +{c.hits.length - 1} more</span>}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {claims.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No claims match these filters.</p>}
    </div>
  );
}
