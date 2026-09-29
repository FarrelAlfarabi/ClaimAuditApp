import Link from "next/link";
import { getAuditedClaims } from "@/lib/audit";
import { getEffectiveConfig } from "@/lib/settings";
import { requirePageRole } from "@/lib/role";
import { applyFilters, readFilters } from "@/lib/claim-filters";
import { idr, fmtDate } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";
import { catLabel } from "@/lib/i18n/dict";
import { SearchBar } from "@/components/search-bar";
import { FilterSheet } from "@/components/filter-sheet";
import { ActiveFilters } from "@/components/active-filters";
import { RiskBadge } from "@/components/risk-badge";
import { StatusChip } from "@/components/status-chip";
import { ClaimCard, EmptyState } from "@/components/claim-card";
import { IconChevronRight } from "@/components/icons";

export const dynamic = "force-dynamic";

const uniq = (a: string[]) => [...new Set(a)].sort();

/** Every claim, for spot checks and search: cards on phone, a table on laptop. Same filters as the queue; default order is claim number. */
export default async function AllClaims({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePageRole("finance");
  const t = await getDict();
  const f = readFilters(await searchParams);
  const all = getAuditedClaims().sort((a, b) => a.id - b.id);
  const claims = applyFilters(all, f);
  const config = getEffectiveConfig();
  const options = {
    categories: uniq(all.map((c) => c.category)),
    departments: uniq(all.map((c) => c.department_name)),
    statuses: ["pending", "approved", "rejected"],
    risk: true, flags: true, receipt: true, dates: true, amounts: true, sort: true,
    employees: uniq(all.map((c) => c.employee_name)),
    managers: uniq(all.map((c) => c.manager_name)),
    auditors: [...uniq(all.flatMap((c) => (c.audited_by ? [c.audited_by] : []))), ...(all.some((c) => c.audit_status !== "pending" && !c.audited_by) ? ["none"] : [])],
    time: true, source: true, day: true, hitCount: true,
  };
  const th = "px-3 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight md:text-3xl">{t.all.title}</h1>
        <p className="text-sm text-muted-foreground">{t.all.sub}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        <span className="mock-tag">{t.all.mockLimits}</span>
        {Object.entries(config.categoryLimits).map(([c, l]) => <span key={c} className="num">{catLabel(t, c)}: {idr(l)}</span>)}
        <span className="num">{t.all.hours(config.workingHours.start, config.workingHours.end)}</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <div className="flex w-full min-w-0 md:w-auto md:flex-1"><SearchBar placeholder="finance" /></div>
        <FilterSheet basePath="/claims" options={options} current={f} />
      </div>
      <ActiveFilters basePath="/claims" f={f} t={t} />
      <div className="num text-[13px] font-bold text-muted-foreground" role="status">{t.queue.count(claims.length, all.length)}</div>

      {/* Phone: cards */}
      <ul className="grid gap-3 md:hidden">
        {claims.map((c) => <li key={c.id}><ClaimCard c={c} t={t} /></li>)}
      </ul>

      {/* Laptop: compact table; the whole row opens the claim */}
      {claims.length > 0 && (
        <div className="card hidden overflow-x-auto md:block">
          <table className="w-full text-[15px]">
            <thead className="bg-card-2">
              <tr>
                <th className={th}>{t.all.col.claim}</th><th className={th}>{t.all.col.risk}</th><th className={th}>{t.all.col.employee}</th>
                <th className={th}>{t.all.col.merchant}</th><th className={th}>{t.all.col.date}</th>
                <th className={`${th} text-right`}>{t.all.col.amount}</th><th className={th}>{t.all.col.flags}</th><th className={th}>{t.all.col.status}</th>
                <th className={th}><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id} className="relative border-t hover:bg-card-2">
                  <td className="px-3 py-2.5">
                    {/* Stretched link: the whole row is the tap target, one link per row for screen readers. */}
                    <Link href={`/claims/${c.id}`} className="num font-bold text-muted-foreground no-underline after:absolute after:inset-0">#{c.id}</Link>
                  </td>
                  <td className="px-3 py-2.5"><RiskBadge risk={c.risk} /></td>
                  <td className="px-3 py-2.5"><div className="font-bold">{c.employee_name}</div><div className="text-[13px] text-muted-foreground">{catLabel(t, c.category)}</div></td>
                  <td className="px-3 py-2.5">{c.merchant}</td>
                  <td className="num px-3 py-2.5 whitespace-nowrap">{fmtDate(c.transaction_date, t)}{c.transaction_time && <div className="text-[13px] text-muted-foreground">{c.transaction_time}</div>}</td>
                  <td className="amount px-3 py-2.5 text-right whitespace-nowrap">{idr(c.amount)}</td>
                  <td className="px-3 py-2.5 text-[13px] text-ink-2">{c.hits.length ? c.hits.map((h) => t.flag[h.rule]).join(", ") : "-"}</td>
                  <td className="px-3 py-2.5"><StatusChip status={c.audit_status} /></td>
                  <td className="px-3 py-2.5 text-muted-foreground"><IconChevronRight /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {claims.length === 0 && <EmptyState t={t} title={t.queue.empty} hint={t.queue.emptyHint} clearHref="/claims" />}
    </div>
  );
}
