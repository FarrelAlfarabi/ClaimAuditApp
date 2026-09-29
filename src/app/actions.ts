"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROLE_COOKIE, type Role } from "@/lib/role";
import { parseClaimForm, saveReceipt, type SubmitErrors } from "@/lib/submit";
import { approveMany, insertClaim, resetDemoData, setAuditDecision, undoAuditDecision } from "@/lib/db";
import { getAuditedClaims } from "@/lib/audit";
import { rejectionReasons } from "@/lib/rules/config";
import { resetRules, saveRules, validateRules, type EditableRules } from "@/lib/settings";

function refresh(id?: number) {
  revalidatePath("/");
  revalidatePath("/claims");
  if (id) revalidatePath(`/claims/${id}`);
}

export async function approveClaim(id: number) {
  setAuditDecision(id, "approved", null, null);
  refresh(id);
}

export async function rejectClaim(id: number, reason: string, note: string) {
  if (!rejectionReasons.includes(reason)) throw new Error("Unknown rejection reason");
  setAuditDecision(id, "rejected", reason, note.trim() || null);
  refresh(id);
}

export async function undoDecision(id: number) {
  undoAuditDecision(id);
  refresh(id);
}

/** Approves every pending claim the engine currently rates Low. Computed on the server, not trusted from the client. */
export async function batchApproveLow() {
  const ids = getAuditedClaims().filter((c) => c.risk === "Low" && c.audit_status === "pending").map((c) => c.id);
  const n = approveMany(ids);
  refresh();
  return n;
}

export type SaveRulesResult = { ok: true } | { ok: false; errors: Record<string, string> };

export async function saveRulesAction(r: EditableRules): Promise<SaveRulesResult> {
  const errors = validateRules(r);
  if (errors) return { ok: false, errors };
  saveRules(r);
  refresh();
  revalidatePath("/settings");
  return { ok: true };
}

export async function resetRulesAction() {
  resetRules();
  refresh();
  revalidatePath("/settings");
}

export type SubmitState = { errors?: SubmitErrors };

export async function submitClaimAction(_: SubmitState, f: FormData): Promise<SubmitState> {
  const parsed = parseClaimForm(f);
  if ("errors" in parsed) return { errors: parsed.errors };
  let receipt_path: string | null = null;
  let receipt_hash: string | null = null;
  const file = f.get("receipt");
  if (file instanceof File && file.size > 0) {
    const saved = await saveReceipt(file);
    if ("error" in saved) return { errors: { receipt: saved.error } };
    receipt_path = saved.path;
    receipt_hash = saved.hash;
  }
  const id = insertClaim({ ...parsed.claim, receipt_path, receipt_hash });
  refresh();
  redirect(`/submit/done/${id}`);
}

export async function setRoleAction(role: Role) {
  (await cookies()).set(ROLE_COOKIE, role, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
  redirect(role === "employee" ? "/submit" : "/");
}

export async function resetDemoAction() {
  resetDemoData();
  refresh();
  revalidatePath("/settings");
}
