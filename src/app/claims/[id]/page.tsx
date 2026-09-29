import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuditedClaims } from "@/lib/audit";
import { rejectionReasons } from "@/lib/rules/config";
import { DecisionPanel } from "@/components/decision-panel";
import { idr, dayName } from "@/lib/format";
import { RiskBadge } from "@/components/risk-badge";
import { ReceiptViewer } from "@/components/receipt-viewer";

export const dynamic = "force-dynamic";

export default async function ClaimDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const all = getAuditedClaims();
  const c = all.find((x) => x.id === id);
  if (!c) notFound();
  const nextId = all.find((x) => x.id !== id && x.audit_status === "pending")?.id ?? null;

  const fields: [string, string][] = [
    ["Employee (MOCK)", c.employee_name],
    ["Department (MOCK)", c.department_name],
    ["Category", c.category],
    ["Merchant", c.merchant],
    ["Date", `${dayName(c.transaction_date)} ${c.transaction_date}`],
    ["Time", c.transaction_time ?? "not entered"],
    ["Description", c.description],
    ["Manager status (MOCK)", c.manager_status],
  ];

  return (
    <div className="space-y-4">
      <Link href="/" className="-ml-2 inline-flex h-11 items-center px-2 text-sm text-muted-foreground">← Back to queue</Link>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Claim #{c.id}</div>
          <h1 className="text-2xl font-bold tabular-nums"><span className="sr-only">Claim {c.id}, </span>{idr(c.amount)}</h1>
        </div>
        <RiskBadge risk={c.risk} className="px-4 py-1.5 text-base" />
      </div>

      <DecisionPanel id={c.id} status={c.audit_status} reason={c.audit_reason} note={c.audit_note}
        reasons={rejectionReasons} nextId={nextId} />


      <div className="grid gap-4 md:grid-cols-2">
        <ReceiptViewer src={c.receipt_path} />
        <div className="space-y-4">
          <section className="rounded-xl border bg-background p-4">
            <h2 className="mb-2 text-sm font-semibold">Why it was flagged (score {c.score})</h2>
            {c.hits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rule hits. Low risk.</p>
            ) : (
              <ul className="space-y-2">
                {c.hits.map((h) => (
                  <li key={h.rule} className="flex gap-3 text-sm">
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums">+{h.points}</span>
                    <span>{h.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <dl className="divide-y rounded-xl border bg-background">
            {fields.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
