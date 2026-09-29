"use client";

import { useTransition, useState } from "react";
import { resetDemoAction } from "@/app/actions";
import { safe } from "@/lib/safe-action";
import { ErrorNote } from "@/components/error-note";

export function ResetDemo() {
  const [busy, go] = useTransition();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string>();
  return (
    <section className="space-y-2 rounded-xl border border-dashed bg-background p-4">
      <h2 className="text-sm font-semibold">Demo tools</h2>
      <p className="text-sm text-muted-foreground">Restores the 80 seed claims, clears decisions, submitted claims, uploads and rule changes.</p>
      <ErrorNote msg={err} />
      <button type="button" disabled={busy}
        onClick={() => { if (confirm("Reset all demo data? This cannot be undone.")) { setErr(undefined); go(async () => { let ok = true; await safe(resetDemoAction, (m) => { ok = false; setErr(m); }); if (ok) { setDone(true); location.reload(); } }); } }}
        className="h-12 w-full rounded-xl border border-red-600 text-sm font-medium text-red-700 disabled:opacity-50">
        {busy ? "Resetting…" : done ? "Reset done" : "Reset demo data"}
      </button>
    </section>
  );
}
