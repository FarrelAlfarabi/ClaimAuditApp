import Link from "next/link";
import { getAuditedClaims } from "@/lib/audit";
import { requirePageRole } from "@/lib/role";
import { applyFilters, readFilters } from "@/lib/claim-filters";
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
    categories: [...new Set(mine.map((c) => c.category))].sort(),
    receipt: true, dates: true, amounts: true, sort: true,
  };
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[26px] font-extrabold tracking-tight">{t.my.title}</h1>
          {mine.length > 0 && <span className="num text-sm text-muted-foreground">{t.queue.count(shown.length, mine.length)}</span>}
        </div>
        <p className="text-sm text-muted-foreground">{t.my.sub}</p>
      </div>
      {mine.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-5 py-8 text-center">
          <p className="text-[17px] font-extrabold">{t.my.nothing}</p>
          <Link href="/submit" className="btn btn-primary btn-sm">{t.submit.title}</Link>
        </div>
      ) : (
        <>
          <div className="flex gap-2.5">
            <SearchBar placeholder="mine" />
            <FilterSheet basePath="/my" options={options} current={f} />
          </div>
          <ActiveFilters basePath="/my" f={f} t={t} />
          {shown.length === 0 && <EmptyState t={t} title={t.queue.empty} hint={t.queue.emptyHint} clearHref="/my" />}
        </>
      )}
      <ul className="grid gap-3 md:grid-cols-2">
        {shown.map((c) => <li key={c.id}><ClaimCard c={c} t={t} mine /></li>)}
      </ul>
    </div>
  );
}
