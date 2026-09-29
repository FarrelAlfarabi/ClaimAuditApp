import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR, type NewClaim } from "./db";
import { listEmployees, usingSupabase } from "./store";
import { sb } from "./store-supabase";
import { getEffectiveConfig } from "./settings";
import { dictFor, type Dict } from "./i18n/dict";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

export type SubmitErrors = Partial<Record<"employee" | "category" | "merchant" | "amount" | "date" | "time" | "description" | "receipt" | "form", string>>;

const todayJakarta = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

/** Server-side validation for the demo submit form. Returns the claim (without receipt) or field errors. */
export async function parseClaimForm(f: FormData, t: Dict = dictFor("en")): Promise<{ claim: Omit<NewClaim, "receipt_path" | "receipt_hash"> } | { errors: SubmitErrors }> {
  const e: SubmitErrors = {};
  const str = (k: string) => String(f.get(k) ?? "").trim();

  const employee_id = Number(str("employee"));
  if (!(await listEmployees()).some((x) => x.id === employee_id)) e.employee = t.err.employee;

  const category = str("category");
  if (!(category in (await getEffectiveConfig()).categoryLimits)) e.category = t.err.category;

  const merchant = str("merchant");
  if (merchant.length < 2 || merchant.length > 80) e.merchant = t.err.merchant;

  const amountRaw = str("amount").replace(/\D/g, "");
  const amount = Number(amountRaw);
  if (!amountRaw || !Number.isSafeInteger(amount) || amount < 1000 || amount > 1_000_000_000)
    e.amount = t.err.amount;

  const transaction_date = str("date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(transaction_date) || isNaN(Date.parse(transaction_date))) e.date = t.err.date;
  else if (transaction_date > todayJakarta()) e.date = t.err.future;

  const tm = str("time");
  if (tm && !/^([01]\d|2[0-3]):[0-5]\d$/.test(tm)) e.time = t.err.time;

  const description = str("description") || `${category} expense`;
  if (description.length > 200) e.description = t.err.description;

  if (Object.keys(e).length) return { errors: e };
  return { claim: { employee_id, category, merchant, amount, transaction_date, transaction_time: tm || null, description } };
}

/** Saves an uploaded image under its sha256 name (so identical files share one name and a hash for duplicate checks). */
export async function saveReceipt(file: File, t: Dict = dictFor("en")): Promise<{ path: string; hash: string } | { error: string }> {
  if (!EXT[file.type]) return { error: t.err.photoType };
  if (file.size > MAX_UPLOAD_BYTES) return { error: t.err.photoSize };
  const buf = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  const name = `${hash}.${EXT[file.type]}`;
  if (usingSupabase()) await sb.saveReceiptFile(name, buf, file.type);
  else {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  }
  return { path: `/api/receipts/${name}`, hash };
}
