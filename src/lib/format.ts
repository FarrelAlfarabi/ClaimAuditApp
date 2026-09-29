import type { Dict } from "./i18n/dict";

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const idr = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
export const dayName = (d: string) => DAYS[new Date(`${d}T00:00:00Z`).getUTCDay()];

/** "2026-09-26" → "Sat 26 Sep 2026" / "Sab 26 Sep 2026". Dates are stored as plain calendar days, so no time zone math. */
export function fmtDate(d: string, t: Dict, withYear = true) {
  const x = new Date(`${d}T00:00:00Z`);
  if (isNaN(x.getTime())) return d;
  return `${t.days[x.getUTCDay()]} ${x.getUTCDate()} ${t.months[x.getUTCMonth()]}${withYear ? ` ${x.getUTCFullYear()}` : ""}`;
}

/** ISO timestamp → "29 Sep 2026, 14:32 WIB" in Asia/Jakarta. */
export function fmtStamp(iso: string, t: Dict) {
  const x = new Date(new Date(iso).getTime() + 7 * 3600_000);
  if (isNaN(x.getTime())) return iso;
  const hh = String(x.getUTCHours()).padStart(2, "0"), mm = String(x.getUTCMinutes()).padStart(2, "0");
  return `${x.getUTCDate()} ${t.months[x.getUTCMonth()]} ${x.getUTCFullYear()}, ${hh}:${mm} WIB`;
}
