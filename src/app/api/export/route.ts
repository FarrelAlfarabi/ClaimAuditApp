import { getAuditedClaims } from "@/lib/audit";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\r\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Verified (approved) claims as CSV. UTF-8 BOM + CRLF so Excel opens it cleanly with the right encoding. */
export async function GET() {
  const rows = getAuditedClaims()
    .filter((c) => c.audit_status === "approved")
    .sort((a, b) => a.id - b.id);
  const header = [
    "Claim ID", "Employee (MOCK)", "Department (MOCK)", "Category", "Merchant", "Amount (IDR)",
    "Transaction date", "Transaction time", "Risk", "Score", "Flags", "Audit status", "Audited at",
  ];
  const lines = rows.map((c) =>
    [
      c.id, c.employee_name, c.department_name, c.category, c.merchant, c.amount,
      c.transaction_date, c.transaction_time, c.risk, c.score, c.hits.map((h) => h.rule).join(" | "),
      c.audit_status, c.audited_at,
    ].map(cell).join(",")
  );
  const csv = "﻿" + [header.join(","), ...lines].join("\r\n") + "\r\n";
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="verified-claims-${date}.csv"`,
    },
  });
}
