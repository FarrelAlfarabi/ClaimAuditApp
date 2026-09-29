"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { approveClaim, rejectClaim, undoDecision } from "@/app/actions";
import type { AuditStatus } from "@/lib/db";

type Props = {
  id: number;
  status: AuditStatus;
  reason: string | null;
  note: string | null;
  reasons: string[];
  nextId: number | null;
};

export function DecisionPanel({ id, status, reason, note, reasons, nextId }: Props) {
  const [mode, setMode] = useState<"idle" | "reject">("idle");
  const [picked, setPicked] = useState<string>();
  const [text, setText] = useState("");
  const [busy, start] = useTransition();

  const next = nextId && (
    <Link href={`/claims/${nextId}`} className="flex h-12 items-center justify-center rounded-xl border text-sm font-medium">
      Next pending claim →
    </Link>
  );

  if (status !== "pending")
    return (
      <section className={`space-y-3 rounded-xl border p-4 ${status === "approved" ? "bg-emerald-50" : "bg-red-50"}`}>
        <div className="text-sm font-semibold">{status === "approved" ? "Approved" : "Rejected"}</div>
        {reason && <div className="text-sm">Reason: {reason}</div>}
        {note && <div className="text-sm text-muted-foreground">Note: {note}</div>}
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
          rows={2} className="w-full rounded-xl border p-3 text-base" />
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setMode("idle")} className="h-12 rounded-xl border text-sm font-medium">Cancel</button>
          <button type="button" disabled={!picked || busy}
            onClick={() => start(() => rejectClaim(id, picked!, text))}
            className="h-12 rounded-xl bg-red-600 text-sm font-medium text-white disabled:opacity-40">Confirm reject</button>
        </div>
      </section>
    );

  return (
    <section className="grid grid-cols-2 gap-3">
      <button type="button" disabled={busy} onClick={() => setMode("reject")}
        className="h-12 rounded-xl border border-red-600 bg-background text-sm font-medium text-red-700">Reject</button>
      <button type="button" disabled={busy} onClick={() => start(() => approveClaim(id))}
        className="h-12 rounded-xl bg-emerald-700 text-sm font-medium text-white disabled:opacity-50">
        {busy ? "Saving…" : "Approve"}
      </button>
    </section>
  );
}
