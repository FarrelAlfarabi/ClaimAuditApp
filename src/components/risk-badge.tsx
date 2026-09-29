import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/rules/engine";

const styles: Record<RiskLevel, string> = {
  High: "bg-red-600 text-white",
  Medium: "bg-amber-400 text-amber-950",
  Low: "bg-emerald-100 text-emerald-900",
};

export function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-bold", styles[risk], className)}>
      {risk}
    </span>
  );
}
