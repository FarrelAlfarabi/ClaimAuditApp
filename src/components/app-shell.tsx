"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { setRoleAction } from "@/app/actions";
import type { Role } from "@/lib/role";

type Tab = { href: string; label: string; match: (p: string) => boolean };

const TABS: Record<Role, Tab[]> = {
  finance: [
    { href: "/", label: "Queue", match: (p) => p === "/" || /^\/claims\/\d+/.test(p) },
    { href: "/claims", label: "All claims", match: (p) => p === "/claims" },
    { href: "/settings", label: "Rules", match: (p) => p === "/settings" },
  ],
  employee: [
    { href: "/submit", label: "Submit", match: (p) => p.startsWith("/submit") },
    { href: "/my", label: "My claims", match: (p) => p === "/my" },
  ],
};

/** Phone-first shell: sticky top bar with demo role switcher + bottom tabs for the current role. */
export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const path = usePathname();
  const [busy, go] = useTransition();
  const tabs = TABS[role];
  return (
    <div className="min-h-dvh bg-muted/40">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold leading-tight">Claim Audit</div>
            <div className="text-[11px] font-medium leading-tight text-amber-800">DEMO · MOCK DATA</div>
          </div>
          <div role="group" aria-label="Demo role" className="flex rounded-full border p-0.5 text-sm">
            {(["employee", "finance"] as Role[]).map((r) => (
              <button key={r} type="button" disabled={busy} aria-pressed={role === r}
                onClick={() => role !== r && go(() => setRoleAction(r))}
                className={cn("h-10 rounded-full px-3 font-medium", role === r ? "bg-foreground text-background" : "text-muted-foreground")}>
                {r === "employee" ? "Employee" : "Finance"}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-4 pb-24">{children}</main>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t bg-background pb-[env(safe-area-inset-bottom)]">
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
      </nav>
    </div>
  );
}
