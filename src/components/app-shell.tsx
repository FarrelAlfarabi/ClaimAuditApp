"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { safe } from "@/lib/safe-action";
import { ErrorNote } from "@/components/error-note";
import { AccountMenu } from "@/components/account-menu";
import { IconList, IconPlus, IconQueue, IconReceipt, IconShield, IconSparkle, IconTable } from "@/components/icons";
import { useT } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import { setRoleAction, signOutAction } from "@/app/actions";
import type { Role, SessionUser } from "@/lib/role";
import type { Dict } from "@/lib/i18n/dict";
import type { Theme } from "@/lib/i18n/server";

type Tab = { href: string; label: (t: Dict) => string; Icon: (p: { size?: number }) => React.ReactNode; match: (p: string) => boolean };

const TABS: Record<Role, Tab[]> = {
  finance: [
    { href: "/", label: (t) => t.nav.queue, Icon: IconQueue, match: (p) => p === "/" || /^\/claims\/\d+/.test(p) },
    { href: "/claims", label: (t) => t.nav.allClaims, Icon: IconTable, match: (p) => p === "/claims" },
    { href: "/settings", label: (t) => t.nav.rules, Icon: IconShield, match: (p) => p === "/settings" },
    { href: "/preview", label: (t) => t.nav.coming, Icon: IconSparkle, match: (p) => p.startsWith("/preview") },
  ],
  employee: [
    { href: "/submit", label: (t) => t.nav.submit, Icon: IconPlus, match: (p) => p.startsWith("/submit") },
    { href: "/my", label: (t) => t.nav.myClaims, Icon: IconList, match: (p) => p === "/my" },
    { href: "/preview", label: (t) => t.nav.coming, Icon: IconSparkle, match: (p) => p.startsWith("/preview") },
  ],
};

/**
 * Phone-first shell: sticky top bar (app name, MOCK tag, account menu) + bottom tabs; on laptop the tabs move into the top bar.
 * The account menu holds language, theme, sign out, and the demo role switcher when login is off.
 */
export function AppShell({ user, loginMode, theme, children }: { user: SessionUser | null; loginMode: boolean; theme: Theme; children: React.ReactNode }) {
  const t = useT();
  const role = user?.role ?? null;
  const path = usePathname();
  const [busy, go] = useTransition();
  const [err, setErr] = useState<string>();
  const router = useRouter();
  const switchRole = (r: Role) => {
    setErr(undefined);
    go(async () => {
      let ok = true;
      await safe(() => setRoleAction(r), (m) => { ok = false; setErr(m); });
      if (ok) { router.push(r === "employee" ? "/submit" : "/"); router.refresh(); }
    });
  };
  const tabs = role ? TABS[role] : [];
  const signOut = () => {
    setErr(undefined);
    go(async () => {
      const r = await safe(signOutAction, setErr);
      if (r?.ok) { router.push("/login"); router.refresh(); }
    });
  };
  // Errors belong to the screen they happened on; clear them when the page changes.
  useEffect(() => setErr(undefined), [path]);
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-3 px-4 py-2">
          <Link href={role === "employee" ? "/submit" : "/"} className="flex min-w-0 items-center gap-2.5 text-inherit no-underline">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_3px_0_var(--accent)]">
              <IconReceipt size={22} strokeWidth={2} />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[17px] font-extrabold leading-tight tracking-tight text-ink">{t.app.name}</span>
              <span className="mock-tag self-start">{t.app.mockTag}</span>
            </span>
          </Link>
          {tabs.length > 0 && (
            <nav aria-label={t.nav.main} className="ml-4 hidden gap-1 md:flex">
              {tabs.map((tab) => {
                const on = tab.match(path);
                return (
                  <Link key={tab.href} href={tab.href} aria-current={on ? "page" : undefined}
                    className={cn("inline-flex h-11 items-center rounded-full px-4 text-[15px] font-bold no-underline",
                      on ? "bg-primary-soft text-primary-ink" : "text-ink-2 hover:bg-card-2")}>
                    {tab.label(t)}
                  </Link>
                );
              })}
            </nav>
          )}
          <div className="ml-auto">
            <AccountMenu user={user} loginMode={loginMode} theme={theme} busy={busy} onSwitchRole={switchRole} onSignOut={signOut} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-5 pb-32 md:pb-12">
        {err && <div className="mb-4"><ErrorNote msg={err} /></div>}
        {children}
      </main>
      {tabs.length > 0 && (
        <nav aria-label={t.nav.main} className="fixed inset-x-0 bottom-0 z-20 border-t bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_16px_rgb(18_32_58/0.06)] md:hidden">
          <div className="mx-auto grid max-w-lg px-2 pt-1.5 pb-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
            {tabs.map((tab) => {
              const on = tab.match(path);
              return (
                <Link key={tab.href} href={tab.href} aria-current={on ? "page" : undefined}
                  className={cn("flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold no-underline",
                    on ? "text-primary-ink" : "text-muted-foreground")}>
                  <span className={cn("flex h-[30px] w-14 items-center justify-center rounded-full", on && "bg-primary-soft")}>
                    <tab.Icon size={22} />
                  </span>
                  {tab.label(t)}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
