import Link from "next/link";
import type { AuditedClaim } from "@/lib/audit";
import { idr, fmtDate } from "@/lib/format";
import { catLabel, reasonLabel, type Dict } from "@/lib/i18n/dict";
import { reasonText } from "@/lib/i18n/reasons";
import { RiskBadge } from "@/components/risk-badge";
import { StatusChip } from "@/components/status-chip";
import { IconChevronRight } from "@/components/icons";

/**
 * One claim in a list. Finance: links to the claim, shows the first flag reason.
 * Employee (`mine`): not a link; shows the decision outcome instead.
 */
export function ClaimCard({ c, t, mine }: { c: AuditedClaim; t: Dict; mine?: boolean }) {
  const top = (
    <div className="flex items-center gap-2">
      <RiskBadge risk={c.risk} />
      {(mine || c.audit_status !== "pending") && <StatusChip status={c.audit_status} />}
      <span className="num ml-auto text-sm font-bold text-muted-foreground">#{c.id}</span>
    </div>
  );
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="amount text-2xl">{idr(c.amount)}</span>
        {!mine && <IconChevronRight className="shrink-0 text-muted-foreground" />}
      </div>
      <div className="text-sm font-bold text-ink-2">
        {mine ? catLabel(t, c.category) : <>{c.employee_name} · {catLabel(t, c.category)}</>}
      </div>
      <div className="text-sm text-muted-foreground">
        {c.merchant} · {fmtDate(c.transaction_date, t)}{c.transaction_time ? ` · ${c.transaction_time}` : ""}
      </div>
    </>
  );

  if (mine) {
    const outcome =
      c.audit_status === "rejected" ? (
        <div className="rounded-[10px] bg-[var(--st-rejected-bg)] px-2.5 py-2 text-sm font-semibold text-[var(--st-rejected)]">
          {t.my.rejected(reasonLabel(t, c.audit_reason ?? ""))}
          {c.audit_note && <div className="font-medium">{t.my.note(c.audit_note)}</div>}
        </div>
      ) : c.audit_status === "approved" ? (
        <div className="rounded-[10px] bg-[var(--st-approved-bg)] px-2.5 py-2 text-sm font-semibold text-[var(--st-approved)]">{t.my.payout}</div>
      ) : (
        <div className="well px-2.5 py-2 text-sm font-semibold text-ink-2">{t.my.waiting}</div>
      );
    return <div className="card flex flex-col gap-1.5 p-4">{top}{body}<div className="mt-1">{outcome}</div></div>;
  }

  return (
    <Link href={`/claims/${c.id}`} className="card flex flex-col gap-1.5 p-4 text-inherit no-underline hover:border-border-strong active:bg-card-2">
      {top}
      {body}
      {c.hits.length > 0 && (
        <p className="well mt-1 px-2.5 py-2 text-sm leading-snug text-ink-2">
          {reasonText(c.hits[0], t)}
          {c.hits.length > 1 && <b className="whitespace-nowrap text-primary-ink"> {t.queue.more(c.hits.length - 1)}</b>}
        </p>
      )}
    </Link>
  );
}

/** Empty list: say why, offer the way out. */
export function EmptyState({ t, clearHref, title, hint }: { t: Dict; clearHref?: string; title: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-5 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent-soft text-primary-ink">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M8.5 11h5" /></svg>
      </div>
      <div className="text-[17px] font-extrabold">{title}</div>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {clearHref && <Link href={clearHref} className="btn btn-secondary btn-sm">{t.queue.clear}</Link>}
    </div>
  );
}
