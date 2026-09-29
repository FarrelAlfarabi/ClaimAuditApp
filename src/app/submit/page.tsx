import { listEmployees } from "@/lib/store";
import { getEffectiveConfig } from "@/lib/settings";
import { SubmitForm } from "@/components/submit-form";
import { requirePageRole } from "@/lib/role";
import { getDict } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const me = await requirePageRole("employee");
  const t = await getDict();
  const employees = await listEmployees();
  const self = me.employeeId ? employees.find((e) => e.id === me.employeeId) ?? null : null;
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10); // Asia/Jakarta
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight">{t.submit.title}</h1>
        <p className="text-sm text-muted-foreground">{t.submit.sub}</p>
      </div>
      <SubmitForm employees={employees} self={self} limits={(await getEffectiveConfig()).categoryLimits} today={today} />
    </div>
  );
}
