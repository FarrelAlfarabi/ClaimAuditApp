"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Queue", match: (p: string) => p === "/" || /^\/claims\/\d+/.test(p) },
  { href: "/claims", label: "All claims", match: (p: string) => p === "/claims" },
];

/** Phone-first shell: sticky top bar + bottom tabs. On wide screens content stays centered. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-dvh bg-muted/40">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-base font-semibold">Claim Audit</span>
          <span className="rounded-md border border-amber-400 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
            DEMO · MOCK DATA
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-4 pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-5xl grid-cols-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex h-14 items-center justify-center text-sm font-medium",
                t.match(path) ? "text-foreground border-t-2 border-foreground -mt-px" : "text-muted-foreground"
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
