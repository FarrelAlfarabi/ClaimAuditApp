import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authEnabled } from "./auth/config";
import { supabaseServer } from "./auth/server";

export type Role = "finance" | "employee";
export const ROLE_COOKIE = "demo_role";

export type SessionUser = {
  role: Role;
  email: string | null;       // null in no-login demo mode
  name: string;
  employeeId: number | null;  // MOCK employee row this login submits as (employees only)
};

/**
 * Who is using the app. With login on: the Supabase user, role from app_metadata (not editable by the user).
 * With login off (AUTH_DISABLED=1 or no Supabase config): the demo role switcher cookie.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (authEnabled()) {
    try {
      const supabase = await supabaseServer();
      const { data } = await supabase.auth.getClaims();
      const c = data?.claims as
        | { email?: string; app_metadata?: { role?: string; employee_id?: number }; user_metadata?: { display_name?: string } }
        | undefined;
      const role = c?.app_metadata?.role;
      if (!c || (role !== "finance" && role !== "employee")) return null; // signed out, or an account with no app role
      return {
        role,
        email: c.email ?? null,
        name: c.user_metadata?.display_name ?? c.email ?? "User",
        employeeId: role === "employee" ? (c.app_metadata?.employee_id ?? null) : null,
      };
    } catch {
      return null;
    }
  }
  const role: Role = (await cookies()).get(ROLE_COOKIE)?.value === "employee" ? "employee" : "finance";
  return { role, email: null, name: role === "finance" ? "Finance (demo)" : "Employee (demo)", employeeId: null };
}

export async function getRole(): Promise<Role | null> {
  return (await getSessionUser())?.role ?? null;
}

/** For pages: send the wrong role to its own home, and signed-out users to login. */
export async function requirePageRole(role: Role): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  if (u.role !== role) redirect(u.role === "employee" ? "/submit" : "/");
  return u;
}

export class NotAllowedError extends Error {}

/** For server actions and route handlers: the server decides, never the phone. */
export async function requireRole(role: Role): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u || u.role !== role) throw new NotAllowedError(`Only ${role} can do this`);
  return u;
}
