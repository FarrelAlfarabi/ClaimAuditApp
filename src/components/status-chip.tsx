import type { AuditStatus } from "@/lib/db";

const styles: Record<AuditStatus, string> = {
  pending: "border-muted-foreground/30 text-muted-foreground",
  approved: "border-emerald-600 bg-emerald-50 text-emerald-800",
  rejected: "border-red-600 bg-red-50 text-red-800",
};
const labels: Record<AuditStatus, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

export function StatusChip({ status }: { status: AuditStatus }) {
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
}
