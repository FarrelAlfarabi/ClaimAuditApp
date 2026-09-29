"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { safe } from "@/lib/safe-action";
import { ErrorNote } from "@/components/error-note";
import { cn } from "@/lib/utils";
import { setRoleAction, signOutAction } from "@/app/actions";
import type { Role, SessionUser } from "@/lib/role";

type Tab = { href: string; label: string; match: (p: string) => boolean };

const TABS: Record<Role, Tab[]> = {
  finance: [
    { href: "/", label: "Queue", match: (p) => p === "/" || /^\/claims\/\d+/.test(p) },
    { href: "/claims", label: "All claims", match: (p) => p === "/claims" },
    { href: "/settings", label: "Rules", match: (p) => p === "/settings" },
    { href: "/preview", label: "Coming", match: (p) => p.startsWith("/preview") },
  ],
  employee: [
    { href: "/submit", label: "Submit", match: (p) => p.startsWith("/submit") },
    { href: "/my", label: "My claims", match: (p) => p === "/my" },
    { href: "/preview", label: "Coming", match: (p) => p.startsWith("/preview") },
  ],
};

/**
 * Phone-first shell: sticky top bar + bottom tabs for the current role.
 * With login: shows who is signed in and a Sign out button. Without login: the demo role switcher.
 */
export function AppShell({ user, loginMode, children }: { user: SessionUser | null; loginMode: boolean; children: React.ReactNode }) {
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
    <div className="min-h-dvh bg-muted/40">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold leading-tight">Claim Audit</div>
            <div className="text-[11px] font-medium leading-tight text-amber-800">DEMO · MOCK DATA</div>
          </div>
          {loginMode ? (
            user && (
              <div className="flex min-w-0 items-center gap-2">
                <div className="min-w-0 text-right">
                  <div className="truncate text-xs font-medium">{user.name}</div>
                  <div className="text-[11px] text-muted-foreground">{user.role === "finance" ? "Finance" : "Employee"}</div>
                </div>
                <button type="button" disabled={busy} onClick={signOut}
                  className="h-11 shrink-0 rounded-full border px-3 text-sm font-medium">Sign out</button>
              </div>
            )
          ) : (
            <div role="group" aria-label="Demo role" className="flex rounded-full border p-0.5 text-sm">
              {(["employee", "finance"] as Role[]).map((r) => (
                <button key={r} type="button" disabled={busy} aria-pressed={role === r}
                  onClick={() => role !== r && switchRole(r)}
                  className={cn("h-11 min-w-11 rounded-full px-3 font-medium", role === r ? "bg-foreground text-background" : "text-muted-foreground")}>
                  {r === "employee" ? "Employee" : "Finance"}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-4 pb-24">
        {err && <div className="mb-4"><ErrorNote msg={err} /></div>}
        {children}
      </main>
      {tabs.length > 0 && <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t bg-background pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-5xl" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => {
            const on = t.match(path);
            return (
              <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined}
                className={cn("-mt-px flex h-14 items-center justify-center border-t-2 text-sm font-medium",
                  on ? "border-foreground text-foreground" : "border-transparent text-muted-foreground")}>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>}
    </div>
  );
}
