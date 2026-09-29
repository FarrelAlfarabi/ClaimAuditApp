import { listEmployees } from "@/lib/db";
import { rulesConfig } from "@/lib/rules/config";
import { SubmitForm } from "@/components/submit-form";
import { requirePageRole } from "@/lib/role";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const me = await requirePageRole("employee");
  const employees = listEmployees();
  const self = me.employeeId ? employees.find((e) => e.id === me.employeeId) ?? null : null;
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10); // Asia/Jakarta
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Submit a claim</h1>
        <p className="text-sm text-muted-foreground">Demo form. The audit engine checks it the moment you submit.</p>
      </div>
      <SubmitForm employees={employees} self={self} categories={Object.keys(rulesConfig.categoryLimits)} today={today} />
    </div>
  );
}
