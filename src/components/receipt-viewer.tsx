"use client";

import { useEffect, useRef, useState } from "react";

/** Receipt thumbnail; tap to open full screen, tap again to close. Handles slow and failed loads. */
export function ReceiptViewer({ src }: { src: string | null }) {
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
      <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-red-300 bg-red-50 text-sm font-medium text-red-700">
        No receipt attached
      </div>
    );
  return (
    <>
      <button type="button" onClick={() => state === "ok" && setZoom(true)} aria-label="Open receipt full screen"
        className="block w-full rounded-xl border bg-background p-2">
        <div className="relative flex min-h-48 items-center justify-center">
          {state === "loading" && <span className="absolute text-sm text-muted-foreground">Loading receipt…</span>}
          {state === "error" && <span className="absolute text-sm text-red-700">Receipt could not be loaded</span>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={img} src={src} alt={mock ? "Receipt (MOCK placeholder)" : "Uploaded receipt"} onLoad={() => setState("ok")}
            onError={() => setState("error")}
            className={`mx-auto max-h-72 object-contain ${state === "ok" ? "" : "invisible"}`} />
        </div>
        <span className="mt-1 block text-xs text-muted-foreground">
          Tap to zoom{mock ? " · MOCK placeholder receipt" : " · uploaded in demo"}
        </span>
      </button>
      {zoom && (
        <button type="button" autoFocus onClick={() => setZoom(false)}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4" aria-label="Close receipt">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Receipt full size" className="max-h-full max-w-full object-contain" />
        </button>
      )}
    </>
  );
}
