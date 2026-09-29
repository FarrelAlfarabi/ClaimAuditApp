"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Search box that updates ?q= as you type (short pause), keeping every other filter. */
export function SearchBar({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep the box in sync when filters change elsewhere (e.g. "Clear all").
  useEffect(() => setValue(params.get("q") ?? ""), [params]);

  const push = (v: string) => {
    const next = new URLSearchParams(params.toString());
    if (v.trim()) next.set("q", v.trim()); else next.delete("q");
    const s = next.toString();
    router.replace(s ? `${path}?${s}` : path, { scroll: false });
  };

  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); clearTimeout(timer.current); push(value); }} className="relative">
      <label htmlFor="search" className="sr-only">Search</label>
      <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input id="search" type="search" inputMode="search" enterKeyHint="search" autoComplete="off" value={value} placeholder={placeholder}
        onChange={(e) => { const v = e.target.value; setValue(v); clearTimeout(timer.current); timer.current = setTimeout(() => push(v), 300); }}
        className="h-12 w-full rounded-xl border bg-background pl-10 pr-11 text-base [&::-webkit-search-cancel-button]:hidden" />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => { setValue(""); clearTimeout(timer.current); push(""); }}
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground">✕</button>
      )}
    </form>
  );
}
