"use client";

import { useActionState, useState, useTransition } from "react";
import { quickSignInAction, signInAction, type SignInState } from "@/app/actions";
import { safe } from "@/lib/safe-action";
import { ErrorNote } from "@/components/error-note";
import { IconCamera, IconChevronRight, IconShield } from "@/components/icons";
import { useT } from "@/components/i18n-provider";

export function LoginForm({ next, quick }: { next: string; quick: boolean }) {
  const t = useT();
  const [state, action, pending] = useActionState<SignInState, FormData>(signInAction, {});
  const [quickErr, setQuickErr] = useState<string>();
  const [quickBusy, go] = useTransition();
  const busy = pending || quickBusy;

  const quickSignIn = (role: "finance" | "employee") => {
    setQuickErr(undefined);
    go(async () => {
      const r = await safe(() => quickSignInAction(role), setQuickErr);
      if (r?.error) setQuickErr(r.error);
    });
  };
  const big = "flex min-h-[76px] w-full items-center gap-3.5 rounded-[18px] px-4 py-3 text-left disabled:opacity-60";

  return (
    <div className="space-y-4">
      {quick && (
        <section className="space-y-3">
          <h2 className="eyebrow text-[13px]">{t.login.quick}</h2>
          <button type="button" disabled={busy} onClick={() => quickSignIn("finance")}
            className={`${big} bg-primary text-primary-foreground shadow-[0_4px_0_var(--primary-strong)]`}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/15"><IconShield size={26} /></span>
            <span className="flex flex-1 flex-col"><span className="text-lg font-extrabold">{t.role.finance}</span><span className="text-sm font-medium opacity-90">{t.login.financeDesc}</span></span>
            <IconChevronRight />
          </button>
          <button type="button" disabled={busy} onClick={() => quickSignIn("employee")}
            className={`${big} border-[1.5px] border-border-strong bg-card text-ink`}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-primary-soft text-primary-ink"><IconCamera size={26} /></span>
            <span className="flex flex-1 flex-col"><span className="text-lg font-extrabold">{t.role.employee}</span><span className="text-sm text-muted-foreground">{t.login.employeeDesc}</span></span>
            <IconChevronRight className="text-primary-ink" />
          </button>
          <ErrorNote msg={quickErr} />
          <div className="flex items-center gap-2.5 pt-1" aria-hidden>
            <div className="h-px flex-1 bg-border" /><span className="text-[13px] text-muted-foreground">{t.login.orEmail}</span><div className="h-px flex-1 bg-border" />
          </div>
        </section>
      )}
      <form action={action} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <ErrorNote msg={state.error} />
        <div>
          <label htmlFor="email" className="field-label">{t.login.email}</label>
          <input id="email" name="email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" required className="input" />
        </div>
        <div>
          <label htmlFor="password" className="field-label">{t.login.password}</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
        </div>
        <button type="submit" disabled={busy} className={`btn w-full ${quick ? "btn-secondary" : "btn-primary"}`}>
          {pending ? t.login.signingIn : t.login.title}
        </button>
      </form>
    </div>
  );
}
