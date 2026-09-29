"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SORTS, activeCount, type Filters } from "@/lib/claim-filters";
import { filterHref } from "@/lib/filter-url";
import { catLabel } from "@/lib/i18n/dict";
import { IconCheck, IconChevronDown, IconFilter, IconX } from "@/components/icons";
import { useT } from "@/components/i18n-provider";

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

/** Long lists (people) use a native select instead of chips. */
function Select({ label, name, values, value, onPick, all, noneLabel }: {
  label: string; name: keyof Filters; values: string[]; value?: string; onPick: (k: keyof Filters, v?: string) => void; all: string; noneLabel: string;
}) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-2.5 block text-[15px] font-extrabold">{label}</label>
      <div className="relative">
        <select id={id} value={value ?? ""} onChange={(e) => onPick(name, e.target.value || undefined)} className="input appearance-none pr-11 font-semibold">
          <option value="">{all}</option>
          {values.map((v) => <option key={v} value={v}>{v === "none" ? noneLabel : v}</option>)}
        </select>
        <IconChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-2" />
      </div>
    </div>
  );
}

function Chips({ label, name, values, value, onPick, labels, allLabel }: {
  label: string; name: keyof Filters; values: string[]; value?: string; onPick: (k: keyof Filters, v?: string) => void;
  labels?: Record<string, string>; allLabel: string;
}) {
  const chip = (v: string | undefined, text: string) => {
    const on = value === v;
    return (
      <button key={v ?? "_all"} type="button" onClick={() => onPick(name, v)} aria-pressed={on} className="chip">
        {on && <IconCheck size={16} strokeWidth={2.6} />}{text}
      </button>
    );
  };
  return (
    <fieldset className="space-y-2.5">
      <legend className="mb-2.5 text-[15px] font-extrabold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {chip(undefined, allLabel)}
        {values.map((v) => chip(v, labels?.[v] ?? v))}
      </div>
    </fieldset>
  );
}

/**
 * Filter button + bottom sheet. Filters live in the URL so the server does the filtering.
 * Each screen turns on only the sections that make sense for it (options).
 */
export function FilterSheet({ basePath = "/", options, current }: { basePath?: string; options: Options; current: Filters }) {
  const t = useT();
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
    if (min !== undefined && max !== undefined && min > max) return setErr(t.filters.errMinMax);
    if (f.from && f.to && f.from > f.to) return setErr(t.filters.errDates);
    setErr(undefined);
    router.push(filterHref(basePath, { q: current.q, ...f }), { scroll: false });
    setOpen(false);
  };
  const digits = (s: string) => s.replace(/\D/g, "").slice(0, 10);
  const small = "mb-1.5 block text-[13px] font-bold text-ink-2";

  return (
    <>
      <button ref={opener} type="button" aria-haspopup="dialog" aria-expanded={open} aria-label={t.filters.buttonAria(active)}
        onClick={() => { setDraft(current); setErr(undefined); setOpen(true); }} className="btn btn-secondary btn-sm">
        <IconFilter />{t.filters.button}
        {active > 0 && <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-extrabold text-primary-foreground">{active}</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-[var(--scrim)] md:items-center" onClick={() => setOpen(false)}>
          <div ref={sheet} role="dialog" aria-modal="true" aria-labelledby="filter-title"
            className="flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-3xl bg-card shadow-[var(--shadow-sheet)] md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="border-b px-4 pt-2.5 pb-2">
              <div className="mx-auto mb-1.5 h-[5px] w-11 rounded-full bg-border-strong" aria-hidden />
              <div className="flex items-center justify-between">
                <h2 id="filter-title" className="text-[22px] font-extrabold tracking-tight">{t.filters.title}</h2>
                <button type="button" onClick={() => setOpen(false)} aria-label={t.menu.close} className="icon-btn border-0 bg-card-2"><IconX /></button>
              </div>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
              {options.sort && <Chips label={t.filters.sortBy} name="sort" values={Object.keys(SORTS)} labels={t.sort} value={draft.sort} onPick={pick} allLabel={t.filters.all} />}
              {options.risk && <Chips label={t.filters.risk} name="risk" values={["High", "Medium", "Low"]} labels={t.risk} value={draft.risk} onPick={pick} allLabel={t.filters.all} />}
              {options.flags && <Chips label={t.filters.flag} name="flag" values={Object.keys(t.flag)} labels={t.flag} value={draft.flag} onPick={pick} allLabel={t.filters.all} />}
              {options.statuses && <Chips label={t.filters.status} name="status" values={options.statuses} labels={t.status} value={draft.status} onPick={pick} allLabel={t.filters.all} />}
              {options.categories && <Chips label={t.filters.category} name="category" values={options.categories}
                labels={Object.fromEntries(options.categories.map((c) => [c, catLabel(t, c)]))} value={draft.category} onPick={pick} allLabel={t.filters.all} />}
              {options.departments && <Chips label={t.filters.dept} name="dept" values={options.departments} value={draft.dept} onPick={pick} allLabel={t.filters.all} />}
              {options.employees && <Select label={t.filters.emp} name="emp" values={options.employees} value={draft.emp} onPick={pick} all={t.filters.everyone} noneLabel={t.filters.noLogin} />}
              {options.managers && <Select label={t.filters.mgr} name="mgr" values={options.managers} value={draft.mgr} onPick={pick} all={t.filters.anyMgr} noneLabel={t.filters.noLogin} />}
              {options.auditors && <Select label={t.filters.by} name="by" values={options.auditors} value={draft.by} onPick={pick} all={t.filters.anyone} noneLabel={t.filters.noLogin} />}
              {options.hitCount && <Chips label={t.filters.hits} name="hits" values={["0", "1", "2+"]} labels={t.filters.hitsL} value={draft.hits} onPick={pick} allLabel={t.filters.all} />}
              {options.day && <Chips label={t.filters.day} name="day" values={["weekday", "weekend"]} labels={t.filters.dayL} value={draft.day} onPick={pick} allLabel={t.filters.all} />}
              {options.time && <Chips label={t.filters.time} name="time" values={["with", "without"]} labels={t.filters.timeL} value={draft.time} onPick={pick} allLabel={t.filters.all} />}
              {options.source && <Chips label={t.filters.src} name="src" values={["seed", "demo"]} labels={t.filters.srcL} value={draft.src} onPick={pick} allLabel={t.filters.all} />}
              {options.receipt && <Chips label={t.filters.receipt} name="receipt" values={["with", "without"]} labels={{ with: t.filters.hasReceipt, without: t.filters.noReceipt }} value={draft.receipt} onPick={pick} allLabel={t.filters.all} />}
              {options.dates && (
                <fieldset>
                  <legend className="mb-2.5 text-[15px] font-extrabold">{t.filters.date}</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={small}>{t.filters.from}<input type="date" value={draft.from ?? ""} onChange={(e) => pick("from", e.target.value || undefined)} className="input num mt-1.5" /></label>
                    <label className={small}>{t.filters.to}<input type="date" value={draft.to ?? ""} onChange={(e) => pick("to", e.target.value || undefined)} className="input num mt-1.5" /></label>
                  </div>
                </fieldset>
              )}
              {options.amounts && (
                <fieldset>
                  <legend className="mb-2.5 text-[15px] font-extrabold">{t.filters.amount}</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={small}>{t.filters.min}
                      <span className="input-prefix mt-1.5 block"><span>Rp</span><input inputMode="numeric" value={draft.min ? Number(draft.min).toLocaleString("id-ID") : ""} onChange={(e) => pick("min", digits(e.target.value) || undefined)} className="input num" /></span>
                    </label>
                    <label className={small}>{t.filters.max}
                      <span className="input-prefix mt-1.5 block"><span>Rp</span><input inputMode="numeric" value={draft.max ? Number(draft.max).toLocaleString("id-ID") : ""} onChange={(e) => pick("max", digits(e.target.value) || undefined)} className="input num" /></span>
                    </label>
                  </div>
                </fieldset>
              )}
              {err && <p role="alert" className="field-error">{err}</p>}
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2.5 border-t bg-card px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button type="button" onClick={() => apply({})} className="btn btn-secondary">{t.filters.clear}</button>
              <button type="button" onClick={() => apply(draft)} className="btn btn-primary">{t.filters.show}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
