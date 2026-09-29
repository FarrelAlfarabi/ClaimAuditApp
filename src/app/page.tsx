import Link from "next/link";
import { getAuditedClaims } from "@/lib/audit";
import { FilterSheet } from "@/components/filter-sheet";
import { SearchBar } from "@/components/search-bar";
import { ActiveFilters } from "@/components/active-filters";
import { ClaimCard, EmptyState } from "@/components/claim-card";
import { IconDownload, RiskBars } from "@/components/icons";
import { applyFilters, readFilters } from "@/lib/claim-filters";
import { filterHref } from "@/lib/filter-url";
import type { RiskLevel } from "@/lib/rules/engine";
import { BatchApprove } from "@/components/batch-approve";
import { requirePageRole } from "@/lib/role";
import { getDict } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const uniq = (a: string[]) => [...new Set(a)].sort();
const TILE: Record<RiskLevel, string> = {
  High: "border-[var(--risk-high-bd)] text-[var(--risk-high)] aria-[current=true]:bg-[var(--risk-high-bg)] aria-[current=true]:border-[var(--risk-high)]",
  Medium: "border-[var(--risk-med-bd)] text-[var(--risk-med)] aria-[current=true]:bg-[var(--risk-med-bg)] aria-[current=true]:border-[var(--risk-med)]",
  Low: "border-[var(--risk-low-bd)] text-[var(--risk-low)] aria-[current=true]:bg-[var(--risk-low-bg)] aria-[current=true]:border-[var(--risk-low)]",
};

export default async function Queue({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePageRole("finance");
  const t = await getDict();
  const f = readFilters(await searchParams);
  const all = getAuditedClaims();
  const claims = applyFilters(all, f);
  const counts = (["High", "Medium", "Low"] as RiskLevel[]).map((r) => ({ r, n: all.filter((c) => c.risk === r).length }));
  const approved = all.filter((c) => c.audit_status === "approved").length;
  const pending = all.filter((c) => c.audit_status === "pending").length;
  const options = {
    categories: uniq(all.map((c) => c.category)),
    departments: uniq(all.map((c) => c.department_name)),
    statuses: ["pending", "approved", "rejected"],
    risk: true, flags: true, receipt: true, dates: true, amounts: true, sort: true,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-[26px] font-extrabold tracking-tight md:text-3xl">{t.queue.title}</h1>
            <span className="num text-sm text-muted-foreground md:hidden">{t.queue.pending(pending)}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t.queue.sub}</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2.5 md:w-auto md:grid-cols-[repeat(3,140px)]">
          {counts.map(({ r, n }) => {
            const on = f.risk === r;
            return (
              <Link key={r} href={filterHref("/", f, { risk: on ? undefined : r })} scroll={false} aria-current={on ? "true" : undefined}
                aria-label={t.queue.tileAria(t.risk[r], n, on)}
                className={cn("flex min-h-[76px] flex-col gap-0.5 rounded-2xl border-[1.5px] bg-card px-3.5 py-3 no-underline aria-[current=true]:border-2", TILE[r])}>
                <span className="flex items-center gap-1.5 text-[13px] font-extrabold"><RiskBars risk={r} />{t.risk[r]}</span>
                <span className="amount text-[28px] leading-tight text-ink">{n}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <BatchApprove count={all.filter((c) => c.risk === "Low" && c.audit_status === "pending").length} />

      <div className="flex flex-wrap gap-2.5">
        <div className="flex w-full min-w-0 md:w-auto md:flex-1"><SearchBar placeholder="finance" /></div>
        <div className="grid w-full grid-cols-2 gap-2.5 md:flex md:w-auto">
          <FilterSheet basePath="/" options={options} current={f} />
          <a href="/api/export" className="btn btn-secondary btn-sm whitespace-nowrap" download aria-label={t.queue.exportAria(approved)}>
            <IconDownload />{t.queue.export}<span className="num hidden text-muted-foreground sm:inline">({approved})</span>
          </a>
        </div>
      </div>
      <ActiveFilters basePath="/" f={f} t={t} />
      <div className="num text-[13px] font-bold text-muted-foreground" role="status">{t.queue.count(claims.length, all.length)}</div>

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {claims.map((c) => <li key={c.id}><ClaimCard c={c} t={t} /></li>)}
      </ul>
      {claims.length === 0 && <EmptyState t={t} title={t.queue.empty} hint={t.queue.emptyHint} clearHref="/" />}
    </div>
  );
}
