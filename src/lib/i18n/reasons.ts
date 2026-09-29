import type { RuleHit } from "../rules/engine";
import { idr } from "../format";
import { catLabel, type Dict } from "./dict";

/** A rule hit's reason in the current language. Falls back to the engine's English text if a value is missing. */
export function reasonText(h: RuleHit, t: Dict): string {
  if (h.rule === "missing_receipt") return t.reason.missing; // no values needed
  const p = h.params;
  if (!p) return h.reason;
  const ids = (a?: number[]) => (a ?? []).map((i) => `#${i}`).join(", ");
  switch (h.rule) {
    case "over_limit":
      if (p.amount === undefined || p.limit === undefined || !p.category) break;
      return t.reason.over(idr(p.amount), catLabel(t, p.category), idr(p.limit), idr(p.amount - p.limit));
    case "near_limit":
      if (p.amount === undefined || p.limit === undefined || !p.category || p.pct === undefined) break;
      return t.reason.near(idr(p.amount), p.pct, catLabel(t, p.category), idr(p.limit));
    case "duplicate": {
      const parts = [];
      if (p.dataIds?.length) parts.push(t.reason.dupData(ids(p.dataIds)));
      if (p.hashIds?.length) parts.push(t.reason.dupHash(ids(p.hashIds)));
      if (!parts.length) break;
      return t.reason.dup(parts.join("; "));
    }
    case "weekend":
      if (p.dow === undefined || !p.date) break;
      return t.reason.weekend(t.daysLong[p.dow], p.date);
    case "off_hours":
      if (!p.time || !p.start || !p.end) break;
      return t.reason.offHours(p.time, p.start, p.end);
  }
  return h.reason;
}
