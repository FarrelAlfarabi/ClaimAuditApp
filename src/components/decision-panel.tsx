"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { approveClaim, rejectClaim, undoDecision } from "@/app/actions";
import type { AuditStatus } from "@/lib/db";
import { safe } from "@/lib/safe-action";
import { fmtStamp } from "@/lib/format";
import { reasonLabel } from "@/lib/i18n/dict";
import { ErrorNote } from "@/components/error-note";
import { IconCheck, IconChevronRight, IconUndo, IconX } from "@/components/icons";
import { useT } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

type Props = {
  id: number;
  status: AuditStatus;
  reason: string | null;
  note: string | null;
  by: string | null;
  at: string | null;
  reasons: string[];
  nextId: number | null;
};

export function DecisionPanel({ id, status, reason, note, by, at, reasons, nextId }: Props) {
  const t = useT();
  const [mode, setMode] = useState<"idle" | "reject">("idle");
  const [picked, setPicked] = useState<string>();
  const [text, setText] = useState("");
  const [busy, go] = useTransition();
  const [err, setErr] = useState<string>();
  const router = useRouter();
  const start = (fn: () => Promise<unknown>) => {
    setErr(undefined);
    go(async () => {
      const r = (await safe(fn, setErr)) as { ok?: boolean; message?: string } | undefined;
      if (r && r.ok === false) { setErr(r.message); setMode("idle"); router.refresh(); }
    });
  };

  const next = nextId && (
    <Link href={`/claims/${nextId}`} className="btn btn-primary">{t.decision.next}<IconChevronRight size={18} /></Link>
  );

  if (status !== "pending") {
    const ok = status === "approved";
    return (
      <section role="status" className={cn("space-y-3.5 rounded-2xl border-[1.5px] p-4",
        ok ? "border-[var(--st-approved-bd)] bg-[var(--st-approved-bg)]" : "border-[var(--st-rejected-bd)] bg-[var(--st-rejected-bg)]")}>
        <ErrorNote msg={err} />
        <div className="flex items-center gap-3">
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white", ok ? "bg-[#0b6b50]" : "bg-[#a3261b]")}>
            {ok ? <IconCheck size={26} strokeWidth={2.8} /> : <IconX size={24} strokeWidth={2.8} />}
          </span>
          <span className={cn("text-[22px] font-extrabold", ok ? "text-[var(--st-approved)]" : "text-[var(--st-rejected)]")}>
            {ok ? t.decision.approved : t.decision.rejected}
          </span>
        </div>
        {(reason || note) && (
          <dl className="space-y-1.5 text-[15px] leading-snug">
            {reason && <div><dt className="inline font-extrabold">{t.decision.reason}: </dt><dd className="inline font-semibold">{reasonLabel(t, reason)}</dd></div>}
            {note && <div><dt className="inline font-extrabold">{t.decision.note}: </dt><dd className="inline text-ink-2">{note}</dd></div>}
          </dl>
        )}
        {(by || at) && (
          <div className="text-sm leading-relaxed text-ink-2">
            {by ? t.decision.by(by) : t.decision.decided}{at && <><br /><span className="num">{fmtStamp(at, t)}</span></>}
          </div>
        )}
        {ok && (
          <div className="banner banner-mock"><span className="mock-tag bg-card">{t.app.mock}</span><span>{t.decision.payout}</span></div>
        )}
        <div className={cn("grid gap-2.5", next ? "grid-cols-[1fr_1.6fr]" : "grid-cols-1")}>
          <button type="button" disabled={busy} onClick={() => start(() => undoDecision(id))} className="btn btn-secondary">
            <IconUndo size={18} />{t.decision.undo}
          </button>
          {next}
        </div>
      </section>
    );
  }

  if (mode === "reject")
    return (
      <section className="space-y-3 rounded-2xl border-[1.5px] border-border-strong bg-card p-4">
        <ErrorNote msg={err} />
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[19px] font-extrabold">{t.decision.rejectTitle}</h2>
          <span className="mock-tag">{t.decision.mockList}</span>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">{t.decision.legend}</legend>
          {reasons.map((r) => (
            <label key={r} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 text-base font-semibold",
              picked === r ? "border-2 border-danger bg-danger-soft font-bold text-danger-ink" : "border-border-strong bg-card")}>
              <input type="radio" name={`reject-${id}`} value={r} checked={picked === r} onChange={() => setPicked(r)}
                className="h-[22px] w-[22px] shrink-0 accent-[var(--danger)]" />
              {reasonLabel(t, r)}
            </label>
          ))}
        </fieldset>
        <div>
          <label htmlFor={`note-${id}`} className="field-label">{t.decision.noteLabel} <span className="opt">{t.decision.optional}</span></label>
          <textarea id={`note-${id}`} value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={300} className="input resize-none" />
          <div className="hint num text-right">{text.length} / 300</div>
        </div>
        {/* Stacked on narrow phones so the longer Indonesian label never wraps inside the button. */}
        <div className="grid gap-2.5 sm:grid-cols-[1fr_1.4fr]">
          <button type="button" onClick={() => setMode("idle")} className="btn btn-secondary order-2 sm:order-1">{t.decision.cancel}</button>
          <button type="button" disabled={!picked || busy}
            onClick={() => start(async () => { const r = await rejectClaim(id, picked!, text); if (r.ok) setMode("idle"); return r; })}
            className="btn btn-danger order-1 sm:order-2"><IconX size={18} strokeWidth={2.6} />{t.decision.confirmReject}</button>
        </div>
      </section>
    );

  return (
    <section className="grid grid-cols-2 gap-2.5">
      {err && <div className="col-span-2"><ErrorNote msg={err} /></div>}
      <button type="button" disabled={busy} onClick={() => setMode("reject")} className="btn btn-danger-outline">
        <IconX size={18} strokeWidth={2.6} />{t.decision.reject}
      </button>
      <button type="button" disabled={busy} onClick={() => start(() => approveClaim(id))} className="btn btn-primary">
        <IconCheck size={18} strokeWidth={2.6} />{busy ? t.decision.saving : t.decision.approve}
      </button>
    </section>
  );
}
