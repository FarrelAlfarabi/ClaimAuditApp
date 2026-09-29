"use client";

import { useTransition, useState } from "react";
import { batchApproveLow } from "@/app/actions";
import { safe } from "@/lib/safe-action";

export function BatchApprove({ count }: { count: number }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<number | null>(null);
  const [err, setErr] = useState<string>();
  if (count === 0) return null; // nothing left; also clears the "Approved N" note after the page refreshes
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3">
      <span className="text-sm">
        {err ? <span role="alert" className="text-red-800">{err}</span> : done !== null ? `Approved ${done} Low-risk claims.` : `${count} Low-risk claims have no flags.`}
      </span>
      {count > 0 && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Approve all ${count} pending Low-risk claims?`)) return;
            setErr(undefined);
            start(async () => { const n = await safe(batchApproveLow, setErr); if (n !== undefined) setDone(n); });
          }}
          className="h-11 shrink-0 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Approving…" : `Approve all ${count}`}
        </button>
      )}
    </div>
  );
}
