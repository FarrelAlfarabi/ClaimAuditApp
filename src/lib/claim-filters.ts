import type { AuditedClaim } from "./audit";
import type { RuleId } from "./rules/engine";
import { dictFor } from "./i18n/dict";
import { reasonText } from "./i18n/reasons";

const ID = dictFor("id");

/** Every filter lives in the URL (?q=…&risk=…), so a filtered view can be reloaded, shared or bookmarked. */
export type Filters = {
  q?: string;        // free text: claim #, employee, merchant, category, department, description, flag reasons
  risk?: string;     // High | Medium | Low
  category?: string;
  dept?: string;
  status?: string;   // pending | approved | rejected
  flag?: string;     // RuleId
  from?: string;     // YYYY-MM-DD, transaction date
  to?: string;
  min?: string;      // IDR
  max?: string;
  receipt?: string;  // with | without
  emp?: string;      // submitting employee (MOCK name)
  mgr?: string;      // approving manager (MOCK name)
  by?: string;       // Finance user who decided; "none" = decided without login (demo mode)
  time?: string;     // with | without (transaction time entered; off-hours check needs it)
  src?: string;      // seed | demo (submitted through the demo form)
  day?: string;      // weekday | weekend
  hits?: string;     // 0 | 1 | 2+ (number of flags)
  sort?: string;     // see SORTS
};

export const FILTER_KEYS: (keyof Filters)[] = ["q", "risk", "category", "dept", "status", "flag", "from", "to", "min", "max", "receipt", "emp", "mgr", "by", "time", "src", "day", "hits", "sort"];

export const FLAG_LABELS: Record<RuleId, string> = {
  over_limit: "Over limit",
  near_limit: "Near limit",
  duplicate: "Duplicate",
  weekend: "Weekend",
  off_hours: "Off-hours",
  missing_receipt: "No receipt",
};

export const SORTS = {
  risk: "Riskiest first",
  newest: "Newest date",
  recent: "Recently submitted",
  decided: "Recently decided",
  oldest: "Oldest date",
  amount_desc: "Highest amount",
  amount_asc: "Lowest amount",
} as const;

const RISK_RANK = { High: 0, Medium: 1, Low: 2 } as const;
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}#]+/gu, " ").trim();
const num = (s?: string) => (s && /^\d+$/.test(s.replace(/\D/g, "")) ? Number(s.replace(/\D/g, "")) : undefined);

/** Picks only known keys and drops empty values from raw search params. */
export function readFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const f: Filters = {};
  for (const k of FILTER_KEYS) {
    const v = sp[k];
    const s = (Array.isArray(v) ? v[0] : v)?.trim();
    if (s) f[k] = s.slice(0, 100);
  }
  return f;
}

export const activeCount = (f: Filters) => FILTER_KEYS.filter((k) => k !== "sort" && k !== "q" && f[k]).length;

function matchesText(c: AuditedClaim, q: string) {
  const id = q.trim().match(/^#?(\d{1,6})$/);
  if (id && q.trim().startsWith("#")) return c.id === Number(id[1]); // "#8" means claim 8, not 80
  const words = norm(q).split(" ").filter(Boolean);
  if (!words.length) return true;
  const hay = norm(
    [`#${c.id}`, String(c.id), c.employee_name, c.merchant, c.category, c.department_name, c.description,
      String(c.amount), c.transaction_date, c.manager_name, c.audited_by ?? "", ...c.hits.map((h) => `${FLAG_LABELS[h.rule]} ${h.reason}`), c.audit_reason ?? "",
      // Indonesian words too, so search works in either UI language ("makan", "akhir pekan")
      ID.category[c.category] ?? "", ...c.hits.map((h) => `${ID.flag[h.rule]} ${reasonText(h, ID)}`), ID.rejectReason[c.audit_reason ?? ""] ?? ""].join(" ")
  );
  return words.every((w) => hay.includes(w)); // every word must appear somewhere ("gramedia 301" works)
}

export function applyFilters(all: AuditedClaim[], f: Filters): AuditedClaim[] {
  const min = num(f.min), max = num(f.max);
  const out = all.filter(
    (c) =>
      (!f.q || matchesText(c, f.q)) &&
      (!f.risk || c.risk === f.risk) &&
      (!f.category || c.category === f.category) &&
      (!f.dept || c.department_name === f.dept) &&
      (!f.status || c.audit_status === f.status) &&
      (!f.flag || c.hits.some((h) => h.rule === f.flag)) &&
      (!f.from || c.transaction_date >= f.from) &&
      (!f.to || c.transaction_date <= f.to) &&
      (min === undefined || c.amount >= min) &&
      (max === undefined || c.amount <= max) &&
      (!f.receipt || (f.receipt === "with" ? !!c.receipt_path : !c.receipt_path)) &&
      (!f.emp || c.employee_name === f.emp) &&
      (!f.mgr || c.manager_name === f.mgr) &&
      (!f.by || (f.by === "none" ? c.audit_status !== "pending" && !c.audited_by : c.audited_by === f.by)) &&
      (!f.time || (f.time === "with" ? !!c.transaction_time : !c.transaction_time)) &&
      (!f.src || c.source === f.src) &&
      (!f.day || (f.day === "weekend") === [0, 6].includes(new Date(`${c.transaction_date}T00:00:00Z`).getUTCDay())) &&
      (!f.hits || (f.hits === "2+" ? c.hits.length >= 2 : c.hits.length === Number(f.hits)))
  );
  const by: Record<string, (a: AuditedClaim, b: AuditedClaim) => number> = {
    newest: (a, b) => b.transaction_date.localeCompare(a.transaction_date) || b.id - a.id,
    oldest: (a, b) => a.transaction_date.localeCompare(b.transaction_date) || a.id - b.id,
    amount_desc: (a, b) => b.amount - a.amount || a.id - b.id,
    amount_asc: (a, b) => a.amount - b.amount || a.id - b.id,
    recent: (a, b) => b.id - a.id,
    decided: (a, b) => (b.audited_at ?? "").localeCompare(a.audited_at ?? "") || b.id - a.id,
    risk: (a, b) => RISK_RANK[a.risk] - RISK_RANK[b.risk] || b.score - a.score || a.id - b.id,
  };
  // No explicit sort: keep the audit order (pending first, then riskiest) from getAuditedClaims.
  return f.sort && by[f.sort] ? [...out].sort(by[f.sort]) : out;
}
