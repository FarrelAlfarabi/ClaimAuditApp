"use client";

import { useEffect, useTransition, useState } from "react";
import { batchApproveLow } from "@/app/actions";
import { safe } from "@/lib/safe-action";
import { IconZap } from "@/components/icons";
import { useT } from "@/components/i18n-provider";

export function BatchApprove({ count }: { count: number }) {
  const t = useT();
  const [pending, start] = useTransition();
  const [done, setDone] = useState<number | null>(null);
  const [err, setErr] = useState<string>();
  // New pending Low claims appeared (e.g. after a reset): forget the old "Approved N" note.
  useEffect(() => { if (count > 0) setDone(null); }, [count]);
  if (count === 0 && done === null) return null;
  return (
    <div className="card flex flex-wrap items-center gap-3 p-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary-soft text-primary-ink"><IconZap size={22} /></span>
      <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-ink-2">
        {err ? <span role="alert" className="text-danger-ink">{err}</span> : done !== null ? t.batch.done(done) : t.batch.noFlags(count)}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(t.batch.confirm(count))) return;
          setErr(undefined);
          start(async () => { const n = await safe(batchApproveLow, setErr); if (n !== undefined) setDone(n); });
        }}
        className="btn btn-primary btn-sm shrink-0"
      >
        {pending ? t.batch.approving : t.batch.approveAll(count)}
      </button>
    </div>
  );
}
