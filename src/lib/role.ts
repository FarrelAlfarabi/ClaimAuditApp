import { cookies } from "next/headers";

export type Role = "finance" | "employee";
export const ROLE_COOKIE = "demo_role";

/** Demo role switcher instead of login (master-plan 2.1). Default: Finance. */
export async function getRole(): Promise<Role> {
  return (await cookies()).get(ROLE_COOKIE)?.value === "employee" ? "employee" : "finance";
}
