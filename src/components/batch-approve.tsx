"use client";

import { useTransition, useState } from "react";
import { batchApproveLow } from "@/app/actions";

export function BatchApprove({ count }: { count: number }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<number | null>(null);
  if (count === 0 && done === null) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-background p-3">
      <span className="text-sm">
        {done !== null ? `Approved ${done} Low-risk claims.` : `${count} Low-risk claims have no flags.`}
      </span>
      {count > 0 && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Approve all ${count} pending Low-risk claims?`)) return;
            start(async () => setDone(await batchApproveLow()));
          }}
          className="h-11 shrink-0 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Approving…" : `Approve all ${count}`}
        </button>
      )}
    </div>
  );
}
