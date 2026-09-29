export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const idr = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
export const dayName = (d: string) => DAYS[new Date(`${d}T00:00:00Z`).getUTCDay()];
