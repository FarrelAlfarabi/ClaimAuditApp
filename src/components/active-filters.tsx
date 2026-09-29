import Link from "next/link";
import { SORTS, type Filters } from "@/lib/claim-filters";
import { filterHref } from "@/lib/filter-url";
import { idr } from "@/lib/format";
import { catLabel, type Dict } from "@/lib/i18n/dict";
import type { RiskLevel, RuleId } from "@/lib/rules/engine";
import { IconX } from "@/components/icons";

/** Removable chips for every active filter, plus "Clear all". Plain links: works without JavaScript. */
export function ActiveFilters({ basePath, f, t }: { basePath: string; f: Filters; t: Dict }) {
  const chips: [keyof Filters | "amount" | "date", string][] = [];
  if (f.q) chips.push(["q", `“${f.q}”`]);
  if (f.risk) chips.push(["risk", t.filters.riskChip(t.risk[f.risk as RiskLevel] ?? f.risk)]);
  if (f.flag) chips.push(["flag", t.filters.flagChip(t.flag[f.flag as RuleId] ?? f.flag)]);
  if (f.category) chips.push(["category", catLabel(t, f.category)]);
  if (f.dept) chips.push(["dept", f.dept]);
  if (f.status) chips.push(["status", t.status[f.status as keyof Dict["status"]] ?? f.status]);
  if (f.receipt) chips.push(["receipt", f.receipt === "with" ? t.filters.hasReceipt : t.filters.noReceipt]);
  if (f.from || f.to) chips.push(["date", t.filters.range(f.from ?? "…", f.to ?? "…")]);
  if (f.min || f.max) chips.push(["amount", t.filters.range(f.min ? idr(Number(f.min)) : "Rp 0", f.max ? idr(Number(f.max)) : t.filters.any)]);
  if (f.sort && f.sort in SORTS) chips.push(["sort", t.filters.sortChip(t.sort[f.sort as keyof typeof SORTS])]);
  if (!chips.length) return null;

  const without = (k: (typeof chips)[number][0]) =>
    filterHref(basePath, f, k === "date" ? { from: undefined, to: undefined } : k === "amount" ? { min: undefined, max: undefined } : { [k]: undefined });

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={t.filters.active}>
      {chips.map(([k, label]) => (
        <Link key={k} href={without(k)} scroll={false} aria-label={t.filters.remove(label)} className="filter-chip">
          {label} <IconX size={16} strokeWidth={2.6} />
        </Link>
      ))}
      {chips.length > 1 && <Link href={basePath} scroll={false} className="btn btn-ghost btn-sm">{t.filters.clearAll}</Link>}
    </div>
  );
}
