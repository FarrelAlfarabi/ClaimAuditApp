"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROLE_COOKIE, requireRole, type Role } from "@/lib/role";
import { DEMO_ACCOUNTS, authEnabled, quickLoginEnabled } from "@/lib/auth/config";
import { supabaseServer } from "@/lib/auth/server";
import { parseClaimForm, saveReceipt, type SubmitErrors } from "@/lib/submit";
import { approveMany, insertClaim, resetDemoData, setAuditDecision, undoAuditDecision } from "@/lib/db";
import { getAuditedClaims } from "@/lib/audit";
import { rejectionReasons } from "@/lib/rules/config";
import { resetRules, saveRules, validateRules, type EditableRules } from "@/lib/settings";
import { getDict } from "@/lib/i18n/server";

function refresh(id?: number) {
  revalidatePath("/");
  revalidatePath("/claims");
  if (id) revalidatePath(`/claims/${id}`);
}

export type DecisionResult = { ok: true } | { ok: false; message: string };

export async function approveClaim(id: number): Promise<DecisionResult> {
  const me = await requireRole("finance");
  const n = setAuditDecision(id, "approved", null, null, me.email);
  refresh(id);
  return n ? { ok: true } : { ok: false, message: (await getDict()).err.already };
}

export async function rejectClaim(id: number, reason: string, note: string): Promise<DecisionResult> {
  const me = await requireRole("finance");
  const t = await getDict();
  if (!rejectionReasons.includes(reason)) return { ok: false, message: t.err.pickReason };
  const n = setAuditDecision(id, "rejected", reason, note.trim().slice(0, 300) || null, me.email);
  refresh(id);
  return n ? { ok: true } : { ok: false, message: t.err.already };
}

export async function undoDecision(id: number) {
  await requireRole("finance");
  undoAuditDecision(id);
  refresh(id);
}

/** Approves every pending claim the engine currently rates Low. Computed on the server, not trusted from the client. */
export async function batchApproveLow() {
  const me = await requireRole("finance");
  const ids = getAuditedClaims().filter((c) => c.risk === "Low" && c.audit_status === "pending").map((c) => c.id);
  const n = approveMany(ids, me.email);
  refresh();
  return n;
}

export type SaveRulesResult = { ok: true } | { ok: false; errors: Record<string, string> };

export async function saveRulesAction(r: EditableRules): Promise<SaveRulesResult> {
  await requireRole("finance");
  const errors = validateRules(r, await getDict());
  if (errors) return { ok: false, errors };
  saveRules(r);
  refresh();
  revalidatePath("/settings");
  return { ok: true };
}

export async function resetRulesAction() {
  await requireRole("finance");
  resetRules();
  refresh();
  revalidatePath("/settings");
}

export type SubmitErrorsState = SubmitErrors;
export type SubmitState = { errors?: SubmitErrors; doneId?: number };

export async function submitClaimAction(f: FormData): Promise<SubmitState> {
  const me = await requireRole("employee");
  // A signed-in employee always submits as their own (MOCK) employee record; the picker only exists without login.
  if (me.employeeId) f.set("employee", String(me.employeeId));
  const t = await getDict();
  const parsed = parseClaimForm(f, t);
  if ("errors" in parsed) return { errors: parsed.errors };
  let receipt_path: string | null = null;
  let receipt_hash: string | null = null;
  const file = f.get("receipt");
  if (file instanceof File && file.size > 0) {
    const saved = await saveReceipt(file, t);
    if ("error" in saved) return { errors: { receipt: saved.error } };
    receipt_path = saved.path;
    receipt_hash = saved.hash;
  }
  const id = insertClaim({ ...parsed.claim, receipt_path, receipt_hash });
  refresh();
  return { doneId: id }; // client navigates; a redirect here could not be told apart from a network failure
}

export async function setRoleAction(role: Role) {
  if (authEnabled()) return; // with login on, the role comes from the account, not a cookie
  (await cookies()).set(ROLE_COOKIE, role, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
}

export async function resetDemoAction() {
  await requireRole("finance");
  resetDemoData();
  refresh();
  revalidatePath("/settings");
}

// ---- Login (Supabase Auth) ----

export type SignInState = { error?: string };


const safeNext = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : null);

async function signInWith(email: string, password: string, next: string | null): Promise<SignInState> {
  const t = await getDict();
  const UNREACHABLE = t.err.unreachable;
  let role: unknown;
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.status === 400) return { error: t.err.wrongLogin };
      // status 0 / 5xx: the login service could not be reached (e.g. hotspot without mobile data)
      if (!error.status || error.status >= 500) return { error: UNREACHABLE };
      return { error: t.err.loginFailed };
    }
    role = data.user?.app_metadata?.role;
    if (role !== "finance" && role !== "employee") {
      await supabase.auth.signOut().catch(() => {});
      return { error: t.err.noRole };
    }
  } catch {
    return { error: UNREACHABLE };
  }
  redirect(next ?? (role === "employee" ? "/submit" : "/"));
}

export async function signInAction(_: SignInState, f: FormData): Promise<SignInState> {
  const email = String(f.get("email") ?? "").trim().toLowerCase();
  const password = String(f.get("password") ?? "");
  if (!email || !password) return { error: (await getDict()).err.enterLogin };
  return signInWith(email, password, safeNext(f.get("next")));
}

/** Demo-only one-tap sign-in. The shared demo password never leaves the server. */
export async function quickSignInAction(role: Role): Promise<SignInState> {
  if (!quickLoginEnabled()) return { error: (await getDict()).err.quickOff };
  return signInWith(DEMO_ACCOUNTS[role], process.env.DEMO_PASSWORD!, null);
}

export async function signOutAction() {
  if (authEnabled()) {
    try {
      await (await supabaseServer()).auth.signOut();
    } catch {
      // Supabase unreachable: the local session cookie is still cleared by the client below navigating to /login.
    }
  }
  // No redirect() here: the client navigates, so a real network failure can be told apart from success.
  return { ok: true as const };
}
