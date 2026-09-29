"use client";

import { useActionState, useState, useTransition } from "react";
import { quickSignInAction, signInAction, type SignInState } from "@/app/actions";
import { safe } from "@/lib/safe-action";
import { ErrorNote } from "@/components/error-note";

export function LoginForm({ next, quick }: { next: string; quick: boolean }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signInAction, {});
  const [quickErr, setQuickErr] = useState<string>();
  const [quickBusy, go] = useTransition();
  const input = "h-12 w-full rounded-xl border bg-background px-3 text-base";
  const busy = pending || quickBusy;

  const quickSignIn = (role: "finance" | "employee") => {
    setQuickErr(undefined);
    go(async () => {
      const r = await safe(() => quickSignInAction(role), setQuickErr);
      if (r?.error) setQuickErr(r.error);
    });
  };

  return (
    <div className="space-y-5">
      {quick && (
        <section className="space-y-3 rounded-xl border border-dashed bg-background p-4">
          <h2 className="text-sm font-semibold">Quick demo sign-in</h2>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" disabled={busy} onClick={() => quickSignIn("finance")}
              className="h-12 rounded-xl bg-foreground text-sm font-medium text-background disabled:opacity-50">Finance</button>
            <button type="button" disabled={busy} onClick={() => quickSignIn("employee")}
              className="h-12 rounded-xl border text-sm font-medium disabled:opacity-50">Employee</button>
          </div>
          <ErrorNote msg={quickErr} />
        </section>
      )}
      <form action={action} className="space-y-4 rounded-xl border bg-background p-4">
        <input type="hidden" name="next" value={next} />
        <ErrorNote msg={state.error} />
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" required className={input} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
        </div>
        <button type="submit" disabled={busy}
          className="h-12 w-full rounded-xl bg-foreground text-sm font-semibold text-background disabled:opacity-50">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
