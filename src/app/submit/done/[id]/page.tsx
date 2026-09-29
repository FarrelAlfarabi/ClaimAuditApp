import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuditedClaims } from "@/lib/audit";
import { idr, fmtDate } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";
import { reasonText } from "@/lib/i18n/reasons";
import { RiskBadge } from "@/components/risk-badge";
import { IconCheck } from "@/components/icons";
import { requirePageRole } from "@/lib/role";

export const dynamic = "force-dynamic";

/** Shown right after a submit: what the engine decided, live. */
export default async function Done({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePageRole("employee");
  const t = await getDict();
  const id = Number((await params).id);
  const c = (await getAuditedClaims()).find((x) => x.id === id);
  if (!c || c.source !== "demo" || (me.employeeId && c.employee_id !== me.employeeId)) notFound();
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <section className="card relative flex flex-col items-center gap-3 overflow-hidden px-5 py-6 text-center">
        <div className="absolute -top-8 -left-8 h-28 w-28 rounded-full bg-accent-soft" aria-hidden />
        <div className="relative flex h-[60px] w-[60px] items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-[0_4px_0_var(--accent)]">
          <IconCheck size={30} strokeWidth={2.6} />
        </div>
        <h1 className="relative text-2xl font-extrabold tracking-tight">{t.done.submitted(c.id)}</h1>
        <div className="text-sm text-muted-foreground">{c.merchant} · <span className="num">{idr(c.amount)}</span> · {fmtDate(c.transaction_date, t, false)}</div>
        <div className="eyebrow mt-1">{t.done.engine}</div>
        <RiskBadge risk={c.risk} size="lg" />
        {c.hits.length > 0 && <p className="text-[13px] text-muted-foreground">{t.done.flagNote}</p>}
      </section>
      <section className="card space-y-3 p-4">
        <h2 className="text-lg font-extrabold">{c.hits.length ? t.done.reasons(c.hits.length) : t.done.noFlags}</h2>
        {c.hits.length > 0 && (
          <ul className="space-y-2.5">
            {c.hits.map((h) => (
              <li key={h.rule} className="flex items-start gap-3">
                <span className="points">+{h.points}</span>
                <span className="pt-1 text-[15px] leading-snug">{reasonText(h, t)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="grid grid-cols-2 gap-2.5">
        <Link href="/submit" className="btn btn-primary">{t.done.another}</Link>
        <Link href="/my" className="btn btn-secondary">{t.nav.myClaims}</Link>
      </div>
    </div>
  );
}
