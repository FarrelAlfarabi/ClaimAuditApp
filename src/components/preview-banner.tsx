/** Loud label on every preview screen: nothing here works yet. */
export function PreviewBanner({ phase }: { phase: string }) {
  return (
    <div role="note" className="rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 p-3 text-sm text-amber-950"
      style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 12px, rgba(245,158,11,.10) 12px 24px)" }}>
      <div className="font-bold">DEMO PREVIEW · NOT WORKING YET</div>
      <div>Picture of a planned feature ({phase}). Buttons do nothing and all data is MOCK. Nothing here is saved.</div>
    </div>
  );
}

/** A button that looks real but is disabled, with the reason read out. */
export function FakeButton({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button type="button" disabled aria-disabled title="Preview only: not working yet"
      className={`h-12 w-full cursor-not-allowed rounded-xl text-sm font-medium ${primary ? "bg-neutral-500 text-white" : "border border-dashed bg-background text-muted-foreground"}`}>
      {children} <span className="sr-only">(preview only, not working)</span>
    </button>
  );
}
