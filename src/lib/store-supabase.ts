import { supabaseServer } from "./auth/server";
import type { ClaimRow, Employee, NewClaim } from "./db";

/**
 * Supabase Postgres backend. Every call runs as the signed-in user (their JWT), so row level security decides what
 * they can read; writes go through security-definer functions that check the role again (supabase/migrations).
 */
const fail = (what: string, e: { message: string } | null) => {
  if (e) throw new Error(`${what}: ${e.message}`);
};

export const sb = {
  async listClaims(): Promise<ClaimRow[]> {
    const s = await supabaseServer();
    const { data, error } = await s.from("claims_v").select("*").order("id").limit(5000);
    fail("listClaims", error);
    return (data ?? []) as ClaimRow[];
  },

  /** Minimal fields of every claim, for duplicate checks that must see other people's claims. */
  async dupKeys(): Promise<{ id: number; amount: number; transaction_date: string; merchant: string; receipt_hash: string | null }[]> {
    const s = await supabaseServer();
    const { data, error } = await s.rpc("dup_keys");
    fail("dupKeys", error);
    return data ?? [];
  },

  async listEmployees(): Promise<Employee[]> {
    const s = await supabaseServer();
    const { data, error } = await s.from("employees").select("id, name, departments(name)").order("name");
    fail("listEmployees", error);
    return (data ?? []).map((r: { id: number; name: string; departments: { name: string } | { name: string }[] | null }) => ({
      id: r.id, name: r.name, department_name: (Array.isArray(r.departments) ? r.departments[0]?.name : r.departments?.name) ?? "",
    }));
  },

  async setAuditDecision(id: number, status: "approved" | "rejected", reason: string | null, note: string | null): Promise<number> {
    const s = await supabaseServer();
    const { data, error } = await s.rpc("decide_claim", { p_id: id, p_status: status, p_reason: reason, p_note: note });
    fail("decide_claim", error);
    return Number(data ?? 0);
  },

  async undoAuditDecision(id: number) {
    const { error } = await (await supabaseServer()).rpc("undo_decision", { p_id: id });
    fail("undo_decision", error);
  },

  async approveMany(ids: number[]): Promise<number> {
    const { data, error } = await (await supabaseServer()).rpc("approve_many", { p_ids: ids });
    fail("approve_many", error);
    return Number(data ?? 0);
  },

  async insertClaim(c: NewClaim): Promise<number> {
    const { data, error } = await (await supabaseServer()).rpc("submit_claim", {
      p_category: c.category, p_merchant: c.merchant, p_amount: c.amount, p_date: c.transaction_date, p_time: c.transaction_time ?? "",
      p_description: c.description, p_receipt_path: c.receipt_path, p_receipt_hash: c.receipt_hash,
    });
    fail("submit_claim", error);
    return Number(data);
  },

  async getSetting<T>(key: string): Promise<T | undefined> {
    const { data, error } = await (await supabaseServer()).from("settings").select("value").eq("key", key).maybeSingle();
    fail("getSetting", error);
    return data ? (data.value as T) : undefined;
  },
  async putSetting(key: string, value: unknown) {
    const { error } = await (await supabaseServer()).rpc("put_setting", { p_key: key, p_value: value });
    fail("put_setting", error);
  },
  async deleteSetting(key: string) {
    const { error } = await (await supabaseServer()).rpc("delete_setting", { p_key: key });
    fail("delete_setting", error);
  },

  async resetDemoData() {
    const s = await supabaseServer();
    const { error } = await s.rpc("reset_demo");
    fail("reset_demo", error);
    // Uploaded receipts belong to demo submissions; clear them too.
    const { data: files } = await s.storage.from("receipts").list("", { limit: 1000 });
    if (files?.length) await s.storage.from("receipts").remove(files.map((f) => f.name));
  },

  async saveReceiptFile(name: string, bytes: Buffer, contentType: string) {
    // The file name is its SHA-256, so "already exists" means the identical photo is already stored: that is fine.
    const { error } = await (await supabaseServer()).storage.from("receipts").upload(name, bytes, { contentType, upsert: false });
    if (error && !/already exists|duplicate/i.test(error.message)) fail("upload receipt", error);
  },
  async readReceiptFile(name: string): Promise<{ bytes: Buffer; type: string } | null> {
    const { data, error } = await (await supabaseServer()).storage.from("receipts").download(name);
    if (error || !data) return null;
    return { bytes: Buffer.from(await data.arrayBuffer()), type: data.type };
  },
};
