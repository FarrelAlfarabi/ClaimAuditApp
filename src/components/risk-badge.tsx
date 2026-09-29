"use client";

import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/rules/engine";
import { RiskBars } from "@/components/icons";
import { useT } from "@/components/i18n-provider";

/** Square badge + strength bars + label. `full` says "High risk" instead of "High". */
export function RiskBadge({ risk, className, full, size }: { risk: RiskLevel; className?: string; full?: boolean; size?: "lg" }) {
  const t = useT();
  if (size === "lg")
    return (
      <span className={cn("risk", `risk-${risk}`, "h-auto gap-3 rounded-[18px] border-2 px-6 py-3 text-2xl", className)}>
        <RiskBars risk={risk} size={24} />{t.riskFull[risk]}
      </span>
    );
  return (
    <span className={cn("risk", `risk-${risk}`, className)}>
      <RiskBars risk={risk} />{full ? t.riskFull[risk] : t.risk[risk]}
    </span>
  );
}
