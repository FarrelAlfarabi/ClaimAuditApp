import Link from "next/link";
import { getAuditedClaims } from "@/lib/audit";
import { getEffectiveConfig } from "@/lib/settings";
import { requirePageRole } from "@/lib/role";
import { applyFilters, readFilters } from "@/lib/claim-filters";
import { idr, dayName } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchBar } from "@/components/search-bar";
import { FilterSheet } from "@/components/filter-sheet";
import { ActiveFilters } from "@/components/active-filters";
import { RiskBadge } from "@/components/risk-badge";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";

const uniq = (a: string[]) => [...new Set(a)].sort();

/** Every claim in one table, for spot checks and search. Same filters as the queue; default order is claim number. */
export default async function AllClaims({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requirePageRole("finance");
  const f = readFilters(await searchParams);
  const all = (await getAuditedClaims()).sort((a, b) => a.id - b.id);
  const claims = applyFilters(all, f);
  const config = await getEffectiveConfig();
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">All claims</h1>
        <p className="text-sm text-muted-foreground">Every claim with its engine result. Tap a claim number to open it.</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <Badge variant="mock">MOCK limits</Badge>
        {Object.entries(config.categoryLimits).map(([c, l]) => <span key={c}>{c}: {idr(l)}</span>)}
        <span>Working hours: {config.workingHours.start} to {config.workingHours.end}</span>
      </div>

      <SearchBar placeholder="Search claim #, employee, merchant, reason…" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground" role="status">{claims.length} of {all.length} claims</span>
        <FilterSheet basePath="/claims" options={options} current={f} />
      </div>
      <ActiveFilters basePath="/claims" f={f} />

      <div className="rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Employee (MOCK)</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((c) => (
              <TableRow key={c.id}>
                <TableCell><Link href={`/claims/${c.id}`} className="-m-2 inline-block p-3 font-medium underline">{c.id}</Link></TableCell>
                <TableCell><RiskBadge risk={c.risk} className="px-2 py-0.5 text-xs" /></TableCell>
                <TableCell className="text-right tabular-nums">{idr(c.amount)}</TableCell>
                <TableCell>{c.employee_name}</TableCell>
                <TableCell>{c.category}</TableCell>
                <TableCell>{c.merchant}</TableCell>
                <TableCell className="tabular-nums">{dayName(c.transaction_date)} {c.transaction_date}</TableCell>
                <TableCell className="tabular-nums">{c.transaction_time ?? "-"}</TableCell>
                <TableCell className="text-xs">{c.hits.length ? c.hits.map((h) => h.rule.replace("_", " ")).join(", ") : "-"}</TableCell>
                <TableCell><StatusChip status={c.audit_status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {claims.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No claims match. <Link href="/claims" className="inline-flex min-h-11 items-center underline">Clear search and filters</Link>
          </p>
        )}
      </div>
    </div>
  );
}
