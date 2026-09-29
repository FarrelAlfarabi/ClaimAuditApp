"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { safe } from "@/lib/safe-action";
import { ErrorNote } from "@/components/error-note";
import { submitClaimAction, type SubmitErrorsState } from "@/app/actions";
import type { Employee } from "@/lib/db";

const MAX_SIDE = 1600;

/** Shrinks a phone photo to max 1600px JPEG before upload: 4 MB becomes ~300 KB, which matters on a phone hotspot. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ? new File([blob], "receipt.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file; // e.g. HEIC the browser cannot decode: send as-is and let the server explain
  }
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function SubmitForm({ employees, categories, today }: { employees: Employee[]; categories: string[]; today: string }) {
  const [errors, setErrors] = useState<SubmitErrorsState>({});
  const [netErr, setNetErr] = useState<string>();
  const [pending, go] = useTransition();
  const router = useRouter();
  const inFlight = useRef(false); // sync lock: React state updates too late to stop a fast double tap
  const [amount, setAmount] = useState("");
  const [preview, setPreview] = useState<string>();
  const [photo, setPhoto] = useState<File>();
  const [preparing, setPreparing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const e = errors;
  const input = (bad?: string) => `h-12 w-full rounded-xl border bg-background px-3 text-base ${bad ? "border-red-600" : ""}`;
  const aria = (id: string, bad?: string) => ({ "aria-invalid": !!bad, "aria-describedby": bad ? `${id}-err` : `${id}-hint` });

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        if (inFlight.current) return;
        inFlight.current = true;
        const fd = new FormData(ev.currentTarget);
        fd.delete("receipt");
        if (photo) fd.set("receipt", photo);
        setNetErr(undefined);
        go(async () => {
          const res = await safe(() => submitClaimAction(fd), setNetErr);
          if (!res?.doneId) inFlight.current = false; // allow retry; on success stay locked while navigating
          if (!res) return;
          if (res.doneId) router.push(`/submit/done/${res.doneId}`);
          else {
            setErrors(res.errors ?? {});
            requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
          }
        });
      }}
      className="space-y-4"
      noValidate
    >
      <ErrorNote msg={netErr} />
      {Object.keys(e).length > 0 && (
        <p id="form-errors" tabIndex={-1} role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Please fix the fields marked below.
        </p>
      )}
      <div className="space-y-4 rounded-xl border bg-background p-4">
        <Field id="employee" label="Submitting as (MOCK employee)" error={e.employee}>
          <select id="employee" name="employee" defaultValue={employees[0]?.id} className={input(e.employee)} {...aria("employee", e.employee)}>
            {employees.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.department_name}</option>)}
          </select>
        </Field>
        <Field id="category" label="Category" error={e.category}>
          <select id="category" name="category" defaultValue="" className={input(e.category)} {...aria("category", e.category)}>
            <option value="" disabled>Choose…</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field id="merchant" label="Merchant" error={e.merchant}>
          <input id="merchant" name="merchant" autoComplete="off" autoCapitalize="words" maxLength={80}
            className={input(e.merchant)} {...aria("merchant", e.merchant)} />
        </Field>
        <Field id="amount" label="Amount" error={e.amount}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
            <input id="amount" name="amount" inputMode="numeric" autoComplete="off"
              value={amount ? Number(amount).toLocaleString("id-ID") : ""}
              onChange={(ev) => setAmount(ev.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`${input(e.amount)} pl-10 tabular-nums`} {...aria("amount", e.amount)} />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="date" label="Date" error={e.date}>
            <input id="date" name="date" type="date" defaultValue={today} max={today} className={input(e.date)} {...aria("date", e.date)} />
          </Field>
          <Field id="time" label="Time (optional)" error={e.time} hint="Needed for off-hours check">
            <input id="time" name="time" type="time" className={input(e.time)} {...aria("time", e.time)} />
          </Field>
        </div>
        <Field id="description" label="Description (optional)" error={e.description}>
          <input id="description" name="description" maxLength={200} className={input(e.description)} {...aria("description", e.description)} />
        </Field>
      </div>

      <div className="space-y-2 rounded-xl border bg-background p-4">
        <span className="block text-sm font-medium">Receipt photo</span>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Selected receipt" className="max-h-56 rounded-lg border object-contain" />
        ) : (
          <p className="text-sm text-muted-foreground">No photo yet. Claims without a receipt are flagged.</p>
        )}
        <input ref={fileRef} id="receipt" type="file" accept="image/*" className="sr-only" aria-describedby={e.receipt ? "receipt-err" : undefined}
          onChange={async (ev) => {
            const f = ev.target.files?.[0];
            if (!f) return;
            setPreparing(true);
            const small = await shrink(f);
            setPhoto(small);
            setPreview((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(small); });
            setPreparing(false);
          }} />
        <div className="grid grid-cols-2 gap-3">
          <label htmlFor="receipt" className="flex h-12 cursor-pointer items-center justify-center rounded-xl border text-sm font-medium">
            {preparing ? "Preparing…" : preview ? "Change photo" : "Take or choose photo"}
          </label>
          {preview && (
            <button type="button" className="h-12 rounded-xl border text-sm font-medium"
              onClick={() => { setPhoto(undefined); setPreview(undefined); if (fileRef.current) fileRef.current.value = ""; }}>
              Remove
            </button>
          )}
        </div>
        {e.receipt && <p id="receipt-err" className="text-sm text-red-700">{e.receipt}</p>}
      </div>

      <button type="submit" disabled={pending || preparing}
        className="h-14 w-full rounded-xl bg-foreground text-base font-semibold text-background disabled:opacity-50">
        {pending ? "Submitting…" : "Submit claim"}
      </button>
    </form>
  );
}
