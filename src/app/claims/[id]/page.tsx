import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuditedClaims } from "@/lib/audit";
import { rejectionReasons } from "@/lib/rules/config";
import { DecisionPanel } from "@/components/decision-panel";
import { requirePageRole } from "@/lib/role";
import { idr, fmtDate } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";
import { catLabel } from "@/lib/i18n/dict";
import { reasonText } from "@/lib/i18n/reasons";
import { RiskBadge } from "@/components/risk-badge";
import { StatusChip } from "@/components/status-chip";
import { ReceiptViewer } from "@/components/receipt-viewer";
import { IconChevronLeft } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ClaimDetail({ params }: { params: Promise<{ id: string }> }) {
  await requirePageRole("finance");
  const t = await getDict();
  const id = Number((await params).id);
  const all = await getAuditedClaims();
  const c = all.find((x) => x.id === id);
  if (!c) notFound();
  const nextId = all.find((x) => x.id !== id && x.audit_status === "pending")?.id ?? null;

  const fields: [string, string][] = [
    [t.detail.f.employee, c.employee_name],
    [t.detail.f.dept, c.department_name],
    [t.detail.f.category, catLabel(t, c.category)],
    [t.detail.f.merchant, c.merchant],
    [t.detail.f.date, fmtDate(c.transaction_date, t)],
    [t.detail.f.time, c.transaction_time ? `${c.transaction_time} WIB` : t.detail.timeNone],
    [t.detail.f.description, c.description],
    [t.detail.f.manager, t.status[c.manager_status as keyof typeof t.status] ?? c.manager_status],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="-ml-1 inline-flex min-h-11 items-center gap-1 px-1 text-[15px] font-bold text-primary-ink no-underline">
          <IconChevronLeft />{t.detail.back}
        </Link>
        <span className="num text-sm font-bold text-muted-foreground">{t.detail.claim(c.id)}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start">
        <div className="space-y-4 md:order-2">
          <section className="card space-y-2.5 p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-2"><RiskBadge risk={c.risk} full /><StatusChip status={c.audit_status} /></div>
            <h1 className="amount text-[38px] leading-tight md:text-[40px]"><span className="sr-only">{t.detail.claim(c.id)}, </span>{idr(c.amount)}</h1>
            <div className="text-[15px] font-bold text-ink-2">{c.employee_name} · {catLabel(t, c.category)}</div>
            <div className="text-sm text-muted-foreground">{c.merchant} · {fmtDate(c.transaction_date, t)}{c.transaction_time ? ` · ${c.transaction_time}` : ""}</div>
            <div className="pt-1.5">
              <DecisionPanel id={c.id} status={c.audit_status} reason={c.audit_reason} note={c.audit_note} by={c.audited_by} at={c.audited_at}
                reasons={rejectionReasons} nextId={nextId} />
            </div>
          </section>

          <section className="card space-y-3 p-4 md:p-5">
            <h2 className="text-lg font-extrabold">{t.detail.why(c.score)}</h2>
            {c.hits.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.detail.noHits}</p>
            ) : (
              <ul className="space-y-2.5">
                {c.hits.map((h) => (
                  <li key={h.rule} className="flex items-start gap-3">
                    <span className={`points ${h.points >= 3 ? "points-strong" : ""}`}>+{h.points}</span>
                    <span className="pt-1 text-[15px] leading-snug">{reasonText(h, t)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[13px] text-muted-foreground">{t.detail.flagNote}</p>
          </section>

          <dl className="card px-4 py-1">
            {fields.map(([k, v], i) => (
              <div key={k} className={`grid grid-cols-[minmax(110px,40%)_1fr] gap-3 py-3 text-[15px] ${i ? "border-t" : ""}`}>
                <dt className="font-semibold text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="md:sticky md:top-24 md:order-1">
          <ReceiptViewer src={c.receipt_path} />
        </div>
      </div>
    </div>
  );
}
