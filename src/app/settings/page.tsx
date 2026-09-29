import { getEffectiveConfig, isCustomized } from "@/lib/settings";
import { RulesForm } from "@/components/rules-form";
import { ResetDemo } from "@/components/reset-demo";
import { requirePageRole } from "@/lib/role";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePageRole("finance");
  const c = await getEffectiveConfig();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Audit rules</h1>
        <p className="text-sm text-muted-foreground">
          Changes apply to every claim immediately. Values are MOCK examples (contoh, bukan kebijakan Ruangguru).
        </p>
      </div>
      <RulesForm
        initial={{ categoryLimits: c.categoryLimits, nearLimitPct: c.nearLimitPct, workingHours: c.workingHours }}
        customized={await isCustomized()}
      />
      <ResetDemo />
    </div>
  );
}
