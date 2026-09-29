import { cookies } from "next/headers";
import { LANG_COOKIE, dictFor, isLang, type Lang } from "./dict";

/** Language from the cookie set by the account menu. Default English. */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : "en";
}

export async function getDict() {
  return dictFor(await getLang());
}

export type Theme = "system" | "light" | "dark";
export const THEME_COOKIE = "theme";

export async function getTheme(): Promise<Theme> {
  const v = (await cookies()).get(THEME_COOKIE)?.value;
  return v === "light" || v === "dark" ? v : "system";
}
