"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Options = { categories: string[]; departments: string[]; statuses: string[] };
export type Filters = { risk?: string; category?: string; dept?: string; status?: string };

const RISKS = ["High", "Medium", "Low"];

function Chips({ label, name, values, value, onPick }: {
  label: string; name: keyof Filters; values: string[]; value?: string; onPick: (k: keyof Filters, v?: string) => void;
}) {
  const base = "rounded-full border px-3 py-2 text-sm";
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onPick(name, undefined)}
          className={`${base} ${!value ? "bg-foreground text-background" : "bg-background"}`}>All</button>
        {values.map((v) => (
          <button key={v} type="button" onClick={() => onPick(name, v)}
            className={`${base} ${value === v ? "bg-foreground text-background" : "bg-background"}`}>{v}</button>
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

  const pick = (k: keyof Filters, v?: string) => setDraft((d) => ({ ...d, [k]: v }));
  const apply = (f: Filters) => {
    const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();
    router.push(qs ? `/?${qs}` : "/");
    setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => { setDraft(current); setOpen(true); }}
        className="h-10 rounded-full border bg-background px-4 text-sm font-medium">
        Filters{active ? ` (${active})` : ""}
      </button>
      {open && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="max-h-[85dvh] w-full max-w-lg space-y-5 overflow-y-auto rounded-t-2xl bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-1.5 w-10 rounded-full bg-muted-foreground/30" />
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
