"use client";

/** Last-resort screen if a page crashes: keeps the demo recoverable instead of Next's blank "Application error". */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">Usually a dropped connection. Your last action may not have been saved.</p>
      <div className="mx-auto grid max-w-xs gap-3">
        <button type="button" onClick={() => reset()} className="h-12 rounded-xl bg-foreground text-sm font-medium text-background">Try again</button>
        {/* Full reload on purpose: resets client state after a crash. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="flex h-12 items-center justify-center rounded-xl border text-sm font-medium">Go to start</a>
      </div>
    </div>
  );
}
