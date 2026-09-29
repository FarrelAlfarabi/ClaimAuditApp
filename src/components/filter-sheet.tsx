"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FLAG_LABELS, SORTS, activeCount, type Filters } from "@/lib/claim-filters";
import { filterHref } from "@/lib/filter-url";

export type { Filters };

type Options = {
  categories?: string[];
  departments?: string[];
  statuses?: string[];
  risk?: boolean;
  flags?: boolean;
  receipt?: boolean;
  dates?: boolean;
  amounts?: boolean;
  sort?: boolean;
  employees?: string[];
  managers?: string[];
  auditors?: string[];   // emails; "none" is added for decisions made without login
  time?: boolean;
  source?: boolean;
  day?: boolean;
  hitCount?: boolean;
};

function Select({ label, name, values, value, onPick, all }: {
  label: string; name: keyof Filters; values: string[]; value?: string; onPick: (k: keyof Filters, v?: string) => void; all: string;
}) {
  const id = `f-${name}`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <select id={id} value={value ?? ""} onChange={(e) => onPick(name, e.target.value || undefined)}
        className="h-12 w-full rounded-xl border bg-background px-3 text-base">
        <option value="">{all}</option>
        {values.map((v) => <option key={v} value={v}>{v === "none" ? "No login (demo mode)" : v}</option>)}
      </select>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

function Chips({ label, name, values, value, onPick, labels }: {
  label: string; name: keyof Filters; values: string[]; value?: string; onPick: (k: keyof Filters, v?: string) => void;
  labels?: Record<string, string>;
}) {
  const base = "min-h-11 rounded-full border px-4 py-2 text-sm";
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onPick(name, undefined)}
          aria-pressed={!value} className={`${base} ${!value ? "bg-foreground text-background" : "bg-background"}`}>All</button>
        {values.map((v) => (
          <button key={v} type="button" onClick={() => onPick(name, v)}
            aria-pressed={value === v} className={`${base} ${value === v ? "bg-foreground text-background" : "bg-background"}`}>{labels?.[v] ?? v}</button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Filter button + bottom sheet. Filters live in the URL so the server does the filtering.
 * Each screen turns on only the sections that make sense for it (options).
 */
export function FilterSheet({ basePath = "/", options, current }: { basePath?: string; options: Options; current: Filters }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(current);
  const [err, setErr] = useState<string>();
  const router = useRouter();
  const active = activeCount(current);

  const sheet = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  // Dialog behaviour: focus moves into the sheet, Escape closes, Tab stays inside, focus returns to the Filters button.
  useEffect(() => {
    if (!open) return;
    const el = sheet.current!;
    el.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab") return;
      const f = [...el.querySelectorAll<HTMLElement>("button, input, select")];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const btn = opener.current;
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; btn?.focus(); };
  }, [open]);

  const pick = (k: keyof Filters, v?: string) => setDraft((d) => ({ ...d, [k]: v }));
  const apply = (f: Filters) => {
    const min = f.min ? Number(f.min) : undefined, max = f.max ? Number(f.max) : undefined;
    if (min !== undefined && max !== undefined && min > max) return setErr("Minimum amount is higher than maximum.");
    if (f.from && f.to && f.from > f.to) return setErr("Start date is after end date.");
    setErr(undefined);
    router.push(filterHref(basePath, { q: current.q, ...f }), { scroll: false });
    setOpen(false);
  };
  const input = "h-12 w-full rounded-xl border bg-background px-3 text-base";
  const digits = (s: string) => s.replace(/\D/g, "").slice(0, 10);

  return (
    <>
      <button ref={opener} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => { setDraft(current); setErr(undefined); setOpen(true); }}
        className="h-11 shrink-0 rounded-full border bg-background px-4 text-sm font-medium">
        Filters{active ? ` (${active})` : ""}
      </button>
      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div ref={sheet} role="dialog" aria-modal="true" aria-labelledby="filter-title" className="max-h-[85dvh] w-full max-w-lg space-y-5 overflow-y-auto rounded-t-2xl bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/30" aria-hidden />
            <h2 id="filter-title" className="text-base font-semibold">Filter and sort</h2>
            {options.sort && <Chips label="Sort by" name="sort" values={Object.keys(SORTS)} labels={SORTS} value={draft.sort} onPick={pick} />}
            {options.risk && <Chips label="Risk" name="risk" values={["High", "Medium", "Low"]} value={draft.risk} onPick={pick} />}
            {options.flags && <Chips label="Flag" name="flag" values={Object.keys(FLAG_LABELS)} labels={FLAG_LABELS} value={draft.flag} onPick={pick} />}
            {options.statuses && <Chips label="Audit status" name="status" values={options.statuses} labels={STATUS_LABEL} value={draft.status} onPick={pick} />}
            {options.categories && <Chips label="Category" name="category" values={options.categories} value={draft.category} onPick={pick} />}
            {options.departments && <Chips label="Department (MOCK)" name="dept" values={options.departments} value={draft.dept} onPick={pick} />}
            {options.employees && <Select label="Submitted by (MOCK employee)" name="emp" values={options.employees} value={draft.emp} onPick={pick} all="Everyone" />}
            {options.managers && <Select label="Manager (MOCK)" name="mgr" values={options.managers} value={draft.mgr} onPick={pick} all="Any manager" />}
            {options.auditors && <Select label="Decided by (Finance user)" name="by" values={options.auditors} value={draft.by} onPick={pick} all="Anyone" />}
            {options.hitCount && <Chips label="Number of flags" name="hits" values={["0", "1", "2+"]} labels={{ "0": "None", "1": "One", "2+": "Two or more" }} value={draft.hits} onPick={pick} />}
            {options.day && <Chips label="Day" name="day" values={["weekday", "weekend"]} labels={{ weekday: "Weekday", weekend: "Weekend" }} value={draft.day} onPick={pick} />}
            {options.time && <Chips label="Transaction time" name="time" values={["with", "without"]} labels={{ with: "Time entered", without: "No time" }} value={draft.time} onPick={pick} />}
            {options.source && <Chips label="Source" name="src" values={["seed", "demo"]} labels={{ seed: "Sample data", demo: "Submitted in demo" }} value={draft.src} onPick={pick} />}
            {options.receipt && <Chips label="Receipt" name="receipt" values={["with", "without"]} labels={{ with: "Has receipt", without: "No receipt" }} value={draft.receipt} onPick={pick} />}
            {options.dates && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Transaction date</legend>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-muted-foreground">From<input type="date" value={draft.from ?? ""} onChange={(e) => pick("from", e.target.value || undefined)} className={input} /></label>
                  <label className="text-xs text-muted-foreground">To<input type="date" value={draft.to ?? ""} onChange={(e) => pick("to", e.target.value || undefined)} className={input} /></label>
                </div>
              </fieldset>
            )}
            {options.amounts && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Amount (Rp)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-muted-foreground">Min<input inputMode="numeric" value={draft.min ? Number(draft.min).toLocaleString("id-ID") : ""} onChange={(e) => pick("min", digits(e.target.value) || undefined)} className={input} /></label>
                  <label className="text-xs text-muted-foreground">Max<input inputMode="numeric" value={draft.max ? Number(draft.max).toLocaleString("id-ID") : ""} onChange={(e) => pick("max", digits(e.target.value) || undefined)} className={input} /></label>
                </div>
              </fieldset>
            )}
            {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
            <div className="sticky bottom-0 grid grid-cols-2 gap-3 bg-background pt-2">
              <button type="button" onClick={() => apply({})} className="h-12 rounded-xl border text-sm font-medium">Clear</button>
              <button type="button" onClick={() => apply(draft)}
                className="h-12 rounded-xl bg-foreground text-sm font-medium text-background">Show results</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
