"use client";

import { IconAlert } from "@/components/icons";
import { useT } from "@/components/i18n-provider";

/** Last-resort screen if a page crashes: keeps the demo recoverable instead of Next's blank "Application error". */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useT();
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 px-5 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-danger-soft text-danger-ink"><IconAlert size={32} /></div>
      <h1 className="text-lg font-extrabold">{t.error.title}</h1>
      <p className="text-sm text-muted-foreground">{t.error.body}</p>
      <div className="grid w-full max-w-xs gap-2.5">
        <button type="button" onClick={() => reset()} className="btn btn-primary">{t.error.retry}</button>
        {/* Full reload on purpose: resets client state after a crash. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="btn btn-secondary">{t.error.start}</a>
      </div>
    </div>
  );
}
