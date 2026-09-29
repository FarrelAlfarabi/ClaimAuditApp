"use client";

import { useEffect, useRef, useState } from "react";
import { IconX, IconZoom } from "@/components/icons";
import { useT } from "@/components/i18n-provider";

/** Receipt thumbnail; tap to open full screen, tap again to close. Handles slow and failed loads. */
export function ReceiptViewer({ src }: { src: string | null }) {
  const t = useT();
  const [zoom, setZoom] = useState(false);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const mock = !!src?.startsWith("/mock-receipts/");
  const img = useRef<HTMLImageElement>(null);
  // A cached image can finish loading before hydration, so onLoad never fires. Check once on mount.
  useEffect(() => {
    const el = img.current;
    if (el?.complete) setState(el.naturalWidth > 0 ? "ok" : "error");
  }, [src]);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoom]);

  if (!src)
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-danger-border bg-danger-soft text-[15px] font-bold text-danger-ink">
        <IconX size={28} />{t.receipt.none}
      </div>
    );
  return (
    <>
      <div className="card p-3">
        <button type="button" onClick={() => state === "ok" && setZoom(true)} aria-label={t.receipt.open}
          className="relative flex min-h-72 w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-xl bg-card-2 p-3 md:min-h-[560px]">
          {state === "loading" && <span className="absolute text-sm text-muted-foreground">{t.receipt.loading}</span>}
          {state === "error" && <span className="absolute text-sm font-semibold text-danger-ink">{t.receipt.failed}</span>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={img} src={src} alt={mock ? t.receipt.altMock : t.receipt.altUpload} onLoad={() => setState("ok")}
            onError={() => setState("error")}
            className={`mx-auto max-h-72 rounded object-contain shadow-[0_6px_16px_rgb(18_32_58/0.14)] md:max-h-[540px] ${state === "ok" ? "" : "invisible"}`} />
          {state === "ok" && (
            <span className="absolute right-2.5 bottom-2.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-[rgb(18_32_58/0.82)] px-3 text-[13px] font-bold text-white">
              <IconZoom size={16} />{t.receipt.zoom}
            </span>
          )}
        </button>
        <span className="mt-2 block text-xs text-muted-foreground">{mock ? t.receipt.mock : t.receipt.uploaded}</span>
      </div>
      {zoom && (
        <button type="button" autoFocus onClick={() => setZoom(false)}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4" aria-label={t.receipt.close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={t.receipt.altFull} className="max-h-full max-w-full object-contain" />
        </button>
      )}
    </>
  );
}
