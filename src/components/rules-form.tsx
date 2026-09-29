"use client";

import { useState, useTransition } from "react";
import { resetRulesAction, saveRulesAction } from "@/app/actions";
import type { EditableRules } from "@/lib/settings";
import { safe } from "@/lib/safe-action";

const digits = (s: string) => s.replace(/\D/g, "");
const grouped = (n: number | string) => (n === "" ? "" : Number(n).toLocaleString("id-ID"));

function Err({ msg, id }: { msg?: string; id: string }) {
  return msg ? <p id={id} role="alert" className="mt-1 text-sm text-red-700">{msg}</p> : null;
}

export function RulesForm({ initial, customized }: { initial: EditableRules; customized: boolean }) {
  const [limits, setLimits] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(initial.categoryLimits).map(([k, v]) => [k, String(v)]))
  );
  const [pct, setPct] = useState(String(Math.round(initial.nearLimitPct * 100)));
  const [start, setStart] = useState(initial.workingHours.start);
  const [end, setEnd] = useState(initial.workingHours.end);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string>();
  const [busy, go] = useTransition();

  const save = () =>
    go(async () => {
      setMsg(undefined);
      const r: EditableRules = {
        categoryLimits: Object.fromEntries(Object.entries(limits).map(([k, v]) => [k, v === "" ? NaN : Number(v)])),
        nearLimitPct: pct === "" ? NaN : Number(pct) / 100,
        workingHours: { start, end },
      };
      let net: string | undefined;
      const res = await safe(() => saveRulesAction(r), (m) => (net = m));
      if (!res) { setErrors({}); setMsg(net); return; }
      if (res.ok) { setErrors({}); setMsg("Saved. The audit queue now uses these rules."); }
      else { setErrors(res.errors); setMsg("Not saved. Fix the fields marked in red."); }
    });

  const input = "h-12 w-full rounded-xl border bg-background px-3 text-base";
  const bad = (k: string) => (errors[k] ? "border-red-600" : "");

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4" noValidate>
      <fieldset className="space-y-3 rounded-xl border bg-background p-4">
        <legend className="px-1 text-sm font-semibold">Category limits per claim (IDR)</legend>
        {Object.keys(limits).map((cat) => {
          const id = `limit-${cat.replace(/\W/g, "")}`;
          return (
            <div key={cat}>
              <label htmlFor={id} className="mb-1 block text-sm">{cat}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                <input id={id} inputMode="numeric" autoComplete="off" value={grouped(limits[cat])}
                  onChange={(e) => setLimits((l) => ({ ...l, [cat]: digits(e.target.value) }))}
                  aria-invalid={!!errors[`limit.${cat}`]} aria-describedby={`${id}-err`}
                  className={`${input} pl-10 tabular-nums ${bad(`limit.${cat}`)}`} />
              </div>
              <Err id={`${id}-err`} msg={errors[`limit.${cat}`]} />
            </div>
          );
        })}
      </fieldset>

      <fieldset className="space-y-3 rounded-xl border bg-background p-4">
        <legend className="px-1 text-sm font-semibold">Near-limit warning</legend>
        <label htmlFor="pct" className="mb-1 block text-sm">Flag claims at or above this % of the limit</label>
        <div className="relative">
          <input id="pct" inputMode="numeric" value={pct} onChange={(e) => setPct(digits(e.target.value).slice(0, 3))}
            aria-invalid={!!errors.nearLimitPct} aria-describedby="pct-err" className={`${input} pr-10 ${bad("nearLimitPct")}`} />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
        </div>
        <Err id="pct-err" msg={errors.nearLimitPct} />
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-3 rounded-xl border bg-background p-4">
        <legend className="px-1 text-sm font-semibold">Working hours</legend>
        <div>
          <label htmlFor="start" className="mb-1 block text-sm">Start</label>
          <input id="start" type="time" value={start} onChange={(e) => setStart(e.target.value)}
            aria-invalid={!!errors.start} aria-describedby="start-err" className={`${input} ${bad("start")}`} />
          <Err id="start-err" msg={errors.start} />
        </div>
        <div>
          <label htmlFor="end" className="mb-1 block text-sm">End</label>
          <input id="end" type="time" value={end} onChange={(e) => setEnd(e.target.value)}
            aria-invalid={!!errors.end} aria-describedby="end-err" className={`${input} ${bad("end")}`} />
          <Err id="end-err" msg={errors.end} />
        </div>
      </fieldset>

      {msg && <p role="status" className={`text-sm ${msg.startsWith("Saved") ? "text-emerald-800" : "text-red-700"}`}>{msg}</p>}

      <div className="grid grid-cols-2 gap-3">
        <button type="button" disabled={busy || !customized}
          onClick={() => { if (confirm("Reset all rules to the default example values?")) go(async () => { let ok = true; await safe(resetRulesAction, (m) => { ok = false; setMsg(m); }); if (ok) location.reload(); }); }}
          className="h-12 rounded-xl border text-sm font-medium disabled:opacity-40">Reset to defaults</button>
        <button type="submit" disabled={busy}
          className="h-12 rounded-xl bg-foreground text-sm font-medium text-background disabled:opacity-50">
          {busy ? "Saving…" : "Save rules"}
        </button>
      </div>
    </form>
  );
}
