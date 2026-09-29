"use client";

import { useTransition, useState } from "react";
import { resetDemoAction } from "@/app/actions";
import { safe } from "@/lib/safe-action";
import { ErrorNote } from "@/components/error-note";
import { IconAlert, IconRefresh } from "@/components/icons";
import { useT } from "@/components/i18n-provider";

export function ResetDemo() {
  const t = useT();
  const [busy, go] = useTransition();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string>();
  return (
    <section className="mt-2 space-y-2.5 rounded-2xl border-[1.5px] border-dashed border-danger-border bg-danger-soft/40 p-4">
      <div className="flex items-center gap-2 text-danger-ink"><IconAlert /><h2 className="text-lg font-extrabold">{t.demo.title}</h2></div>
      <p className="text-sm leading-relaxed text-ink-2">{t.demo.body}</p>
      <ErrorNote msg={err} />
      <button type="button" disabled={busy}
        onClick={() => { if (confirm(t.demo.confirm)) { setErr(undefined); go(async () => { let ok = true; await safe(resetDemoAction, (m) => { ok = false; setErr(m); }); if (ok) { setDone(true); location.reload(); } }); } }}
        className="btn btn-danger-outline w-full">
        <IconRefresh size={18} />{busy ? t.demo.resetting : done ? t.demo.done : t.demo.reset}
      </button>
    </section>
  );
}
