import { IconAlert, IconLock } from "@/components/icons";
import type { Dict } from "@/lib/i18n/dict";

/** Loud label on every preview screen: nothing here works yet. */
export function PreviewBanner({ phase, t }: { phase: string; t: Dict }) {
  return (
    <div role="note" className="preview-banner space-y-0.5">
      <div className="flex items-center gap-2 text-[15px] font-extrabold tracking-wide"><IconAlert className="shrink-0" />{t.coming.banner}</div>
      <div className="text-[13px] font-semibold">{t.coming.bannerBody(t.coming.phaseShort[phase] ?? phase)}</div>
    </div>
  );
}

/** A button that looks real but is disabled: stripes, dashed border and a lock, with the reason read out. */
export function FakeButton({ children, t }: { children: React.ReactNode; primary?: boolean; t: Dict }) {
  return (
    <button type="button" disabled aria-disabled title={t.coming.previewOnly} className="btn btn-preview btn-sm w-full">
      <IconLock size={16} />{children} <span className="sr-only">{t.coming.srPreview}</span>
    </button>
  );
}
