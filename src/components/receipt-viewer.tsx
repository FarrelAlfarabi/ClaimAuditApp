"use client";

import { useState } from "react";

/** Receipt thumbnail; tap to open full screen, tap again to close. */
export function ReceiptViewer({ src }: { src: string | null }) {
  const [zoom, setZoom] = useState(false);
  if (!src)
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-red-300 bg-red-50 text-sm font-medium text-red-700">
        No receipt attached
      </div>
    );
  return (
    <>
      <button type="button" onClick={() => setZoom(true)} className="block w-full rounded-xl border bg-background p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Receipt (MOCK placeholder)" className="mx-auto max-h-72 object-contain" />
        <span className="mt-1 block text-xs text-muted-foreground">Tap to zoom · MOCK placeholder receipt</span>
      </button>
      {zoom && (
        <button type="button" onClick={() => setZoom(false)}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4" aria-label="Close receipt">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Receipt full size" className="max-h-full max-w-full object-contain" />
        </button>
      )}
    </>
  );
}
