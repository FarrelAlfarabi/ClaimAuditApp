import { getEffectiveConfig, isCustomized } from "@/lib/settings";
import { RulesForm } from "@/components/rules-form";
import { ResetDemo } from "@/components/reset-demo";
import { requirePageRole } from "@/lib/role";
import { getDict } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePageRole("finance");
  const t = await getDict();
  const c = getEffectiveConfig();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight md:text-3xl">{t.rules.title}</h1>
        <p className="text-sm text-muted-foreground">{t.rules.sub}</p>
      </div>
      {/* Keeps the Indonesian note from the original screen: "contoh, bukan kebijakan Ruangguru". */}
      <div className="banner banner-mock"><span className="mock-tag bg-card">{t.app.mock}</span><span>{t.rules.mockNote} (contoh, bukan kebijakan Ruangguru)</span></div>
      <RulesForm
        initial={{ categoryLimits: c.categoryLimits, nearLimitPct: c.nearLimitPct, workingHours: c.workingHours }}
        customized={isCustomized()}
      />
      <ResetDemo />
    </div>
  );
}
