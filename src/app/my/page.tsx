import Link from "next/link";
import { getAuditedClaims } from "@/lib/audit";
import { requirePageRole } from "@/lib/role";
import { applyFilters, readFilters } from "@/lib/claim-filters";
import { getEffectiveConfig } from "@/lib/settings";
import { getDict } from "@/lib/i18n/server";
import { SearchBar } from "@/components/search-bar";
import { FilterSheet } from "@/components/filter-sheet";
import { ActiveFilters } from "@/components/active-filters";
import { ClaimCard, EmptyState } from "@/components/claim-card";

export const dynamic = "force-dynamic";

/** Claims submitted through the demo form (seed claims excluded). No login, so this is everyone's demo submissions. */
export default async function MyClaims({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await requirePageRole("employee");
  const t = await getDict();
  // Signed in: only this employee's claims. Without login: every demo submission.
  const mine = getAuditedClaims().filter((c) => c.source === "demo" && (!me.employeeId || c.employee_id === me.employeeId)).sort((a, b) => b.id - a.id);
  const f = readFilters(await searchParams);
  const shown = applyFilters(mine, f);
  const options = {
    statuses: ["pending", "approved", "rejected"],
    categories: Object.keys(getEffectiveConfig().categoryLimits).sort(),
    risk: true, flags: true, receipt: true, dates: true, amounts: true, sort: true, time: true, day: true, hitCount: true,
  };
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">{t.my.title}</h1>
        <p className="text-sm text-muted-foreground">{t.my.sub}</p>
      </div>
      {/* Search and filters stay visible even when empty, so the screen looks the same before and after the first claim. */}
      <div className="flex gap-2.5">
        <SearchBar placeholder="mine" />
        <FilterSheet basePath="/my" options={options} current={f} />
      </div>
      <ActiveFilters basePath="/my" f={f} t={t} />
      <div className="num text-[13px] font-bold text-muted-foreground" role="status">{t.queue.count(shown.length, mine.length)}</div>
      {mine.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-5 py-8 text-center">
          <p className="text-[17px] font-extrabold">{t.my.nothing}</p>
          <Link href="/submit" className="btn btn-primary btn-sm">{t.submit.title}</Link>
        </div>
      ) : (
        shown.length === 0 && <EmptyState t={t} title={t.queue.empty} hint={t.queue.emptyHint} clearHref="/my" />
      )}
      <ul className="grid gap-3 md:grid-cols-2">
        {shown.map((c) => <li key={c.id}><ClaimCard c={c} t={t} mine /></li>)}
      </ul>
    </div>
  );
}
