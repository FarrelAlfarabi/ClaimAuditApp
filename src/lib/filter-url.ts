import { FILTER_KEYS, type Filters } from "./claim-filters";

/** Builds `/path?…` from filters, dropping empty values. Shared by server and client components. */
export function filterHref(basePath: string, f: Filters, patch: Partial<Filters> = {}) {
  const merged = { ...f, ...patch };
  const qs = new URLSearchParams();
  for (const k of FILTER_KEYS) if (merged[k]) qs.set(k, merged[k]!);
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}
