import * as local from "./db";
import { sb } from "./store-supabase";
import { authEnabled } from "./auth/config";
import type { ClaimRow, Employee, NewClaim } from "./db";

export type { ClaimRow, Employee, NewClaim, AuditStatus } from "./db";

/**
 * Where claims live.
 *  - Supabase Postgres when login is on (the user's session is what lets the database check permissions).
 *  - Local SQLite when login is off (AUTH_DISABLED=1) or DATA_BACKEND=sqlite: the offline fallback for the demo.
 * Both keep the same claims, so the app code does not care which one it is talking to.
 */
export const usingSupabase = () => authEnabled() && process.env.DATA_BACKEND !== "sqlite";

export const listClaims = async (): Promise<ClaimRow[]> => (usingSupabase() ? sb.listClaims() : local.listClaims());
export const listEmployees = async (): Promise<Employee[]> => (usingSupabase() ? sb.listEmployees() : local.listEmployees());
export const insertClaim = async (c: NewClaim): Promise<number> => (usingSupabase() ? sb.insertClaim(c) : local.insertClaim(c));

export const setAuditDecision = async (
  id: number, status: "approved" | "rejected", reason: string | null, note: string | null, by: string | null
): Promise<number> => (usingSupabase() ? sb.setAuditDecision(id, status, reason, note) : local.setAuditDecision(id, status, reason, note, by));

export const undoAuditDecision = async (id: number) => (usingSupabase() ? sb.undoAuditDecision(id) : local.undoAuditDecision(id));
export const approveMany = async (ids: number[], by: string | null): Promise<number> =>
  usingSupabase() ? sb.approveMany(ids) : local.approveMany(ids, by);

export const getSetting = async <T>(key: string): Promise<T | undefined> => (usingSupabase() ? sb.getSetting<T>(key) : local.getSetting<T>(key));
export const putSetting = async (key: string, value: unknown) => (usingSupabase() ? sb.putSetting(key, value) : local.putSetting(key, value));
export const deleteSetting = async (key: string) => (usingSupabase() ? sb.deleteSetting(key) : local.deleteSetting(key));
export const resetDemoData = async () => (usingSupabase() ? sb.resetDemoData() : local.resetDemoData());

/** Duplicate-check keys of every claim, for roles that cannot read every claim row (employees). Supabase only. */
export const dupKeys = async () => (usingSupabase() ? sb.dupKeys() : []);
