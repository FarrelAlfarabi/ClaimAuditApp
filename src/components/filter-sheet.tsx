"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Options = { categories: string[]; departments: string[]; statuses: string[] };
export type Filters = { risk?: string; category?: string; dept?: string; status?: string };

const RISKS = ["High", "Medium", "Low"];

function Chips({ label, name, values, value, onPick }: {
  label: string; name: keyof Filters; values: string[]; value?: string; onPick: (k: keyof Filters, v?: string) => void;
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
            aria-pressed={value === v} className={`${base} ${value === v ? "bg-foreground text-background" : "bg-background"}`}>{v}</button>
        ))}
      </div>
    </fieldset>
  );
}

/** Filter button + bottom sheet. Filters live in the URL so the server does the filtering. */
export function FilterSheet({ options, current }: { options: Options; current: Filters }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(current);
  const router = useRouter();
  const active = Object.values(current).filter(Boolean).length;

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
      const f = [...el.querySelectorAll<HTMLElement>("button")];
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
    const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();
    router.push(qs ? `/?${qs}` : "/");
    setOpen(false);
  };

  return (
    <>
      <button ref={opener} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => { setDraft(current); setOpen(true); }}
        className="h-11 rounded-full border bg-background px-4 text-sm font-medium">
        Filters{active ? ` (${active})` : ""}
      </button>
      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div ref={sheet} role="dialog" aria-modal="true" aria-labelledby="filter-title" className="max-h-[85dvh] w-full max-w-lg space-y-5 overflow-y-auto rounded-t-2xl bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/30" aria-hidden />
            <h2 id="filter-title" className="text-base font-semibold">Filter claims</h2>
            <Chips label="Risk" name="risk" values={RISKS} value={draft.risk} onPick={pick} />
            <Chips label="Category" name="category" values={options.categories} value={draft.category} onPick={pick} />
            <Chips label="Department (MOCK)" name="dept" values={options.departments} value={draft.dept} onPick={pick} />
            <Chips label="Audit status" name="status" values={options.statuses} value={draft.status} onPick={pick} />
            <div className="grid grid-cols-2 gap-3">
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
