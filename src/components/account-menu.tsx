"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconChevronDown, IconSignOut } from "@/components/icons";
import { useLang, useT } from "@/components/i18n-provider";
import { LANGS, LANG_COOKIE, dictFor, type Lang } from "@/lib/i18n/dict";
import type { Theme } from "@/lib/i18n/server";
import type { Role, SessionUser } from "@/lib/role";
import { cn } from "@/lib/utils";

const YEAR = 60 * 60 * 24 * 365;
const setCookie = (k: string, v: string) => { document.cookie = `${k}=${v}; path=/; max-age=${YEAR}; samesite=lax`; };

function Segmented<V extends string>({ label, value, options, onPick }: {
  label: string; value: V; options: { v: V; label: string }[]; onPick: (v: V) => void;
}) {
  return (
    <div role="group" aria-label={label} className="space-y-1.5">
      <div className="eyebrow">{label}</div>
      <div className="flex rounded-[14px] bg-card-2 p-1">
        {options.map((o) => (
          <button key={o.v} type="button" aria-pressed={value === o.v} onClick={() => onPick(o.v)}
            className={cn("min-h-11 flex-1 rounded-[10px] px-2 text-sm font-bold",
              value === o.v ? "bg-card text-primary-ink shadow-[var(--shadow-card)]" : "text-ink-2")}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Top-bar menu: who is signed in, language, theme, sign out (or the demo role switcher when login is off). */
export function AccountMenu({ user, loginMode, theme: initialTheme, busy, onSwitchRole, onSignOut }: {
  user: SessionUser | null; loginMode: boolean; theme: Theme; busy: boolean; onSwitchRole: (r: Role) => void; onSignOut: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("touchstart", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const pickLang = (l: Lang) => {
    if (l === lang) return;
    setCookie(LANG_COOKIE, l);
    document.documentElement.lang = l;
    router.refresh(); // server components re-render in the new language
  };
  const pickTheme = (v: Theme) => {
    setTheme(v);
    setCookie("theme", v);
    if (v === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = v;
  };

  const roleName = user ? t.role[user.role] : "";
  const who = loginMode ? user?.name : roleName;

  return (
    <div ref={box} className="relative">
      <button ref={btn} type="button" aria-haspopup="true" aria-expanded={open} aria-label={`${t.menu.open}${who ? `: ${who}` : ""}`}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 max-w-[46vw] items-center gap-2 rounded-xl border-[1.5px] border-border-strong bg-card py-1 pr-2 pl-3 text-left md:max-w-xs">
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-bold text-ink">{who ?? t.menu.language}</span>
          {user && loginMode && <span className="truncate text-xs font-semibold text-muted-foreground">{roleName}</span>}
          {!loginMode && <span className="truncate text-xs font-semibold text-muted-foreground">{t.menu.demoRole}</span>}
        </span>
        <IconChevronDown size={18} className="shrink-0 text-ink-2" />
      </button>
      {open && (
        <div className="card absolute right-0 top-full z-30 mt-2 w-[min(320px,calc(100vw-32px))] space-y-4 p-4 shadow-[var(--shadow-sheet)]">
          {loginMode && user && (
            <div className="space-y-0.5">
              <div className="eyebrow">{t.menu.signedInAs}</div>
              <div className="truncate text-[15px] font-bold">{user.name}</div>
              <div className="truncate text-sm text-muted-foreground">{user.email ? `${user.email} · ` : ""}{roleName}</div>
            </div>
          )}
          {!loginMode && user && (
            <Segmented label={t.menu.demoRole} value={user.role}
              options={(["employee", "finance"] as Role[]).map((r) => ({ v: r, label: t.role[r] }))}
              onPick={(r) => { if (r !== user.role && !busy) { setOpen(false); onSwitchRole(r); } }} />
          )}
          {/* Each language names itself, so someone who cannot read the current one can still find theirs. */}
          <Segmented label={t.menu.language} value={lang} options={LANGS.map((l) => ({ v: l, label: dictFor(l).langName }))} onPick={pickLang} />
          <Segmented label={t.menu.theme} value={theme}
            options={[{ v: "system", label: t.menu.system }, { v: "light", label: t.menu.light }, { v: "dark", label: t.menu.dark }]} onPick={pickTheme} />
          {loginMode && user && (
            <button type="button" disabled={busy} onClick={() => { setOpen(false); onSignOut(); }} className="btn btn-secondary btn-sm w-full">
              <IconSignOut size={18} />{t.menu.signOut}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
