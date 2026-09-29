"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { safe } from "@/lib/safe-action";
import { idr } from "@/lib/format";
import { catLabel } from "@/lib/i18n/dict";
import { ErrorNote } from "@/components/error-note";
import { IconAlertCircle, IconCamera, IconCheck, IconChevronDown } from "@/components/icons";
import { useT } from "@/components/i18n-provider";
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

function Field({ id, label, optional, error, hint, children }: {
  id: string; label: string; optional?: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}{optional && <> <span className="opt">{optional}</span></>}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="hint">{hint}</p>}
      {error && <p id={`${id}-err`} className="field-error"><IconAlertCircle size={16} className="mt-0.5 shrink-0" />{error}</p>}
    </div>
  );
}

function Select({ className, ...p }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select {...p} className={`input appearance-none pr-11 font-semibold ${className ?? ""}`} />
      <IconChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-2" />
    </div>
  );
}

export function SubmitForm({ employees, self, limits, today }: { employees: Employee[]; self: Employee | null; limits: Record<string, number>; today: string }) {
  const t = useT();
  const [errors, setErrors] = useState<SubmitErrorsState>({});
  const [netErr, setNetErr] = useState<string>();
  const [pending, go] = useTransition();
  const router = useRouter();
  const inFlight = useRef(false); // sync lock: React state updates too late to stop a fast double tap
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [preview, setPreview] = useState<string>();
  const [photo, setPhoto] = useState<File>();
  const [preparing, setPreparing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const e = errors;
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
        <p id="form-errors" tabIndex={-1} role="alert" className="banner banner-error">{t.submit.fix}</p>
      )}

      {self && (
        <div className="banner banner-info items-center">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground" aria-hidden>
            {self.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <span className="min-w-0 flex-1 leading-snug">
            <span className="font-semibold">{t.submit.as}</span> <b>{self.name}</b>
            <br /><span className="text-ink-2">{self.department_name}</span>
          </span>
          <span className="mock-tag" title={t.submit.linked}>{t.app.mock}</span>
        </div>
      )}

      <div className="card space-y-4 p-4 md:p-5">
        {!self && (
          <Field id="employee" label={t.submit.asPick} error={e.employee}>
            <Select id="employee" name="employee" defaultValue={employees[0]?.id} {...aria("employee", e.employee)}>
              {employees.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.department_name}</option>)}
            </Select>
          </Field>
        )}
        <Field id="category" label={t.submit.category} error={e.category}
          hint={category && limits[category] ? t.submit.limit(idr(limits[category])) : undefined}>
          <Select id="category" name="category" value={category} onChange={(ev) => setCategory(ev.target.value)} {...aria("category", e.category)}>
            <option value="" disabled>{t.submit.choose}</option>
            {Object.keys(limits).map((c) => <option key={c} value={c}>{catLabel(t, c)}</option>)}
          </Select>
        </Field>
        <Field id="merchant" label={t.submit.merchant} error={e.merchant}>
          <input id="merchant" name="merchant" autoComplete="off" autoCapitalize="words" maxLength={80}
            className="input font-semibold" {...aria("merchant", e.merchant)} />
        </Field>
        <Field id="amount" label={t.submit.amount} error={e.amount}>
          <div className="input-prefix">
            <span>Rp</span>
            <input id="amount" name="amount" inputMode="numeric" autoComplete="off"
              value={amount ? Number(amount).toLocaleString("id-ID") : ""}
              onChange={(ev) => setAmount(ev.target.value.replace(/\D/g, "").slice(0, 10))}
              className="input num font-bold" {...aria("amount", e.amount)} />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="date" label={t.submit.date} error={e.date}>
            <input id="date" name="date" type="date" defaultValue={today} max={today} className="input num font-semibold" {...aria("date", e.date)} />
          </Field>
          <Field id="time" label={t.submit.time} optional={t.submit.optional} error={e.time}>
            <input id="time" name="time" type="time" className="input num" {...aria("time", e.time)} />
          </Field>
        </div>
        {!e.time && <p id="time-hint" className="hint -mt-2">{t.submit.timeHint}</p>}
        <Field id="description" label={t.submit.description} optional={t.submit.optional} error={e.description}>
          <input id="description" name="description" maxLength={200} className="input" {...aria("description", e.description)} />
        </Field>

        <div>
          <span className="field-label">{t.submit.photo}</span>
          <div className="flex gap-3 rounded-[14px] border-[1.5px] border-border-strong bg-card-2 p-3">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={t.submit.selectedAlt} className="h-32 w-24 shrink-0 rounded-[10px] bg-card object-cover" />
            ) : (
              <span className="flex h-32 w-24 shrink-0 items-center justify-center rounded-[10px] bg-card text-muted-foreground"><IconCamera size={32} /></span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {preview ? (
                <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--st-approved)]"><IconCheck size={16} strokeWidth={2.6} />{t.submit.photoAdded}</span>
              ) : (
                <span className="text-sm text-muted-foreground">{t.submit.noPhoto}</span>
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
              <div className="mt-auto flex flex-wrap gap-2">
                <label htmlFor="receipt" className="btn btn-secondary btn-sm flex-1 cursor-pointer">
                  {preparing ? t.submit.preparing : preview ? t.submit.change : t.submit.take}
                </label>
                {preview && (
                  <button type="button" className="btn btn-danger-outline btn-sm flex-1"
                    onClick={() => { setPhoto(undefined); setPreview(undefined); if (fileRef.current) fileRef.current.value = ""; }}>
                    {t.submit.remove}
                  </button>
                )}
              </div>
            </div>
          </div>
          {e.receipt && <p id="receipt-err" className="field-error"><IconAlertCircle size={16} className="mt-0.5 shrink-0" />{e.receipt}</p>}
        </div>
      </div>

      <button type="submit" disabled={pending || preparing} className="btn btn-primary min-h-14 w-full rounded-2xl text-[17px]">
        {pending ? t.submit.submitting : t.submit.button}
      </button>
      <p className="hint text-center">{t.submit.after}</p>
    </form>
  );
}
