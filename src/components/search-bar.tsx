"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconSearch, IconX } from "@/components/icons";
import { useT } from "@/components/i18n-provider";

/** Search box that updates ?q= as you type (short pause), keeping every other filter. */
export function SearchBar({ placeholder }: { placeholder: "finance" | "mine" }) {
  const t = useT();
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
    <form role="search" onSubmit={(e) => { e.preventDefault(); clearTimeout(timer.current); push(value); }} className="relative min-w-0 flex-1">
      <label htmlFor="search" className="sr-only">{t.search.label}</label>
      <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input id="search" type="search" inputMode="search" enterKeyHint="search" autoComplete="off" value={value} placeholder={t.search[placeholder]}
        onChange={(e) => { const v = e.target.value; setValue(v); clearTimeout(timer.current); timer.current = setTimeout(() => push(v), 300); }}
        className="input pl-11 pr-12 [&::-webkit-search-cancel-button]:hidden" />
      {value && (
        <button type="button" aria-label={t.search.clear} onClick={() => { setValue(""); clearTimeout(timer.current); push(""); }}
          className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground">
          <IconX size={18} />
        </button>
      )}
    </form>
  );
}
