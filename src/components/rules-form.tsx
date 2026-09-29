"use client";

import { useState, useTransition } from "react";
import { resetRulesAction, saveRulesAction } from "@/app/actions";
import type { EditableRules } from "@/lib/settings";
import { safe } from "@/lib/safe-action";
import { catLabel } from "@/lib/i18n/dict";
import { IconAlertCircle } from "@/components/icons";
import { useT } from "@/components/i18n-provider";

const digits = (s: string) => s.replace(/\D/g, "");
const grouped = (n: number | string) => (n === "" ? "" : Number(n).toLocaleString("id-ID"));

function Err({ msg, id }: { msg?: string; id: string }) {
  return msg ? <p id={id} role="alert" className="field-error"><IconAlertCircle size={16} className="mt-0.5 shrink-0" />{msg}</p> : null;
}

export function RulesForm({ initial, customized }: { initial: EditableRules; customized: boolean }) {
  const t = useT();
  const [limits, setLimits] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(initial.categoryLimits).map(([k, v]) => [k, String(v)]))
  );
  const [pct, setPct] = useState(String(Math.round(initial.nearLimitPct * 100)));
  const [start, setStart] = useState(initial.workingHours.start);
  const [end, setEnd] = useState(initial.workingHours.end);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();
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
      if (!res) { setErrors({}); setMsg({ ok: false, text: net! }); return; }
      if (res.ok) { setErrors({}); setMsg({ ok: true, text: t.rules.saved }); }
      else { setErrors(res.errors); setMsg({ ok: false, text: t.rules.notSaved }); }
    });

  const legend = "float-left mb-3 w-full text-lg font-extrabold";

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4" noValidate>
      <fieldset className="card p-4 md:p-5">
        <legend className={legend}>{t.rules.limits}</legend>
        <div className="clear-both space-y-3">
          {Object.keys(limits).map((cat) => {
            const id = `limit-${cat.replace(/\W/g, "")}`;
            return (
              <div key={cat} className="grid gap-x-3 sm:grid-cols-[1fr_200px] sm:items-center">
                <label htmlFor={id} className="field-label sm:mb-0">{catLabel(t, cat)}</label>
                <div className="input-prefix">
                  <span>Rp</span>
                  <input id={id} inputMode="numeric" autoComplete="off" value={grouped(limits[cat])}
                    onChange={(e) => setLimits((l) => ({ ...l, [cat]: digits(e.target.value) }))}
                    aria-invalid={!!errors[`limit.${cat}`]} aria-describedby={`${id}-err`}
                    className="input num text-right font-semibold" />
                </div>
                <div className="sm:col-span-2"><Err id={`${id}-err`} msg={errors[`limit.${cat}`]} /></div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="card p-4 md:p-5">
        <legend className={legend}>{t.rules.near}</legend>
        <div className="clear-both">
          <label htmlFor="pct" className="field-label">{t.rules.nearLabel}</label>
          <div className="input-suffix max-w-[200px]">
            <input id="pct" inputMode="numeric" value={pct} onChange={(e) => setPct(digits(e.target.value).slice(0, 3))}
              aria-invalid={!!errors.nearLimitPct} aria-describedby="pct-err pct-hint" className="input num pr-10 font-semibold" />
            <span>%</span>
          </div>
          {!errors.nearLimitPct && <p id="pct-hint" className="hint">{t.rules.nearHint}</p>}
          <Err id="pct-err" msg={errors.nearLimitPct} />
        </div>
      </fieldset>

      <fieldset className="card p-4 md:p-5">
        <legend className={legend}>{t.rules.hours}</legend>
        <div className="clear-both grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="start" className="field-label">{t.rules.start}</label>
            <input id="start" type="time" value={start} onChange={(e) => setStart(e.target.value)}
              aria-invalid={!!errors.start} aria-describedby="start-err" className="input num font-semibold" />
            <Err id="start-err" msg={errors.start} />
          </div>
          <div>
            <label htmlFor="end" className="field-label">{t.rules.end}</label>
            <input id="end" type="time" value={end} onChange={(e) => setEnd(e.target.value)}
              aria-invalid={!!errors.end} aria-describedby="end-err" className="input num font-semibold" />
            <Err id="end-err" msg={errors.end} />
          </div>
        </div>
        <p className="hint">{t.rules.hoursHint}</p>
      </fieldset>

      {msg && <p role="status" className={`banner ${msg.ok ? "banner-ok" : "banner-error"}`}>{msg.text}</p>}

      <div className="grid gap-2.5 sm:grid-cols-2">
        <button type="submit" disabled={busy} className="btn btn-primary sm:order-2">{busy ? t.rules.saving : t.rules.save}</button>
        <button type="button" disabled={busy || !customized}
          onClick={() => { if (confirm(t.rules.confirmReset)) go(async () => { let ok = true; await safe(resetRulesAction, (m) => { ok = false; setMsg({ ok: false, text: m }); }); if (ok) location.reload(); }); }}
          className="btn btn-secondary sm:order-1">{t.rules.reset}</button>
      </div>
    </form>
  );
}
