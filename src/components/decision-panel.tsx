"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { approveClaim, rejectClaim, undoDecision } from "@/app/actions";
import type { AuditStatus } from "@/lib/db";
import { safe } from "@/lib/safe-action";
import { ErrorNote } from "@/components/error-note";

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
    <Link href={`/claims/${nextId}`} className="flex h-12 items-center justify-center rounded-xl border text-sm font-medium">
      Next pending claim →
    </Link>
  );

  if (status !== "pending")
    return (
      <section className={`space-y-3 rounded-xl border p-4 ${status === "approved" ? "bg-emerald-50" : "bg-red-50"}`}>
        <ErrorNote msg={err} />
        <div className="text-sm font-semibold">{status === "approved" ? "Approved" : "Rejected"}</div>
        {reason && <div className="text-sm">Reason: {reason}</div>}
        {note && <div className="text-sm text-muted-foreground">Note: {note}</div>}
        {(by || at) && (
          <div className="text-xs text-muted-foreground">
            {by ? `By ${by}` : "Decided"}{at ? ` · ${new Date(at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" })} WIB` : ""}
          </div>
        )}
        {status === "approved" && (
          <div className="text-xs text-muted-foreground">Payout: queued for disbursement (Dicairkan) · MOCK, no money moves in this demo</div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" disabled={busy} onClick={() => start(() => undoDecision(id))}
            className="h-12 rounded-xl border bg-background text-sm font-medium">Undo</button>
          {next}
        </div>
      </section>
    );

  if (mode === "reject")
    return (
      <section className="space-y-3 rounded-xl border bg-background p-4">
        <ErrorNote msg={err} />
        <div className="text-sm font-semibold">Reject: pick a standard reason <span className="font-normal text-muted-foreground">(MOCK list)</span></div>
        <div className="flex flex-col gap-2">
          {reasons.map((r) => (
            <button key={r} type="button" onClick={() => setPicked(r)}
              className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm ${picked === r ? "border-red-600 bg-red-50 font-medium" : ""}`}>
              {r}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Note to employee (optional)"
          rows={2} maxLength={300} aria-label="Note to employee (optional)" className="w-full rounded-xl border p-3 text-base" />
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setMode("idle")} className="h-12 rounded-xl border text-sm font-medium">Cancel</button>
          <button type="button" disabled={!picked || busy}
            onClick={() => start(async () => { const r = await rejectClaim(id, picked!, text); if (r.ok) setMode("idle"); return r; })}
            className="h-12 rounded-xl bg-red-600 text-sm font-medium text-white disabled:opacity-40">Confirm reject</button>
        </div>
      </section>
    );

  return (
    <section className="grid grid-cols-2 gap-3">
      {err && <div className="col-span-2"><ErrorNote msg={err} /></div>}
      <button type="button" disabled={busy} onClick={() => setMode("reject")}
        className="h-12 rounded-xl border border-red-600 bg-background text-sm font-medium text-red-700">Reject</button>
      <button type="button" disabled={busy} onClick={() => start(() => approveClaim(id))}
        className="h-12 rounded-xl bg-emerald-700 text-sm font-medium text-white disabled:opacity-50">
        {busy ? "Saving…" : "Approve"}
      </button>
    </section>
  );
}
