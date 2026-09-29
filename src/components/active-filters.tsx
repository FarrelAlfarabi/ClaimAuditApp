import Link from "next/link";
import { FLAG_LABELS, SORTS, type Filters } from "@/lib/claim-filters";
import { filterHref } from "@/lib/filter-url";
import { idr } from "@/lib/format";
import type { RuleId } from "@/lib/rules/engine";

const STATUS: Record<string, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

/** Removable chips for every active filter, plus "Clear all". Plain links: works without JavaScript. */
export function ActiveFilters({ basePath, f }: { basePath: string; f: Filters }) {
  const chips: [keyof Filters | "amount" | "date", string][] = [];
  if (f.q) chips.push(["q", `“${f.q}”`]);
  if (f.risk) chips.push(["risk", `Risk: ${f.risk}`]);
  if (f.flag) chips.push(["flag", `Flag: ${FLAG_LABELS[f.flag as RuleId] ?? f.flag}`]);
  if (f.category) chips.push(["category", f.category]);
  if (f.dept) chips.push(["dept", f.dept]);
  if (f.status) chips.push(["status", STATUS[f.status] ?? f.status]);
  if (f.emp) chips.push(["emp", `By ${f.emp}`]);
  if (f.mgr) chips.push(["mgr", `Manager: ${f.mgr}`]);
  if (f.by) chips.push(["by", f.by === "none" ? "Decided without login" : `Decided by ${f.by}`]);
  if (f.hits) chips.push(["hits", f.hits === "0" ? "No flags" : f.hits === "1" ? "One flag" : "2+ flags"]);
  if (f.day) chips.push(["day", f.day === "weekend" ? "Weekend" : "Weekday"]);
  if (f.time) chips.push(["time", f.time === "with" ? "Time entered" : "No time"]);
  if (f.src) chips.push(["src", f.src === "demo" ? "Submitted in demo" : "Sample data"]);
  if (f.receipt) chips.push(["receipt", f.receipt === "with" ? "Has receipt" : "No receipt"]);
  if (f.from || f.to) chips.push(["date", `${f.from ?? "…"} to ${f.to ?? "…"}`]);
  if (f.min || f.max) chips.push(["amount", `${f.min ? idr(Number(f.min)) : "Rp 0"} to ${f.max ? idr(Number(f.max)) : "any"}`]);
  if (f.sort && f.sort in SORTS) chips.push(["sort", `Sort: ${SORTS[f.sort as keyof typeof SORTS]}`]);
  if (!chips.length) return null;

  const without = (k: (typeof chips)[number][0]) =>
    filterHref(basePath, f, k === "date" ? { from: undefined, to: undefined } : k === "amount" ? { min: undefined, max: undefined } : { [k]: undefined });

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map(([k, label]) => (
        <Link key={k} href={without(k)} scroll={false} aria-label={`Remove filter ${label}`}
          className="inline-flex min-h-11 items-center gap-1 rounded-full border bg-background px-3 text-sm">
          {label} <span aria-hidden className="text-muted-foreground">✕</span>
        </Link>
      ))}
      {chips.length > 1 && <Link href={basePath} scroll={false} className="min-h-11 px-2 py-2 text-sm underline">Clear all</Link>}
    </div>
  );
}
