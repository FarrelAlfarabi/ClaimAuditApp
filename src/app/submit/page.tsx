import { listEmployees } from "@/lib/db";
import { rulesConfig } from "@/lib/rules/config";
import { SubmitForm } from "@/components/submit-form";

export const dynamic = "force-dynamic";

export default function SubmitPage() {
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10); // Asia/Jakarta
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Submit a claim</h1>
        <p className="text-sm text-muted-foreground">Demo form. The audit engine checks it the moment you submit.</p>
      </div>
      <SubmitForm employees={listEmployees()} categories={Object.keys(rulesConfig.categoryLimits)} today={today} />
    </div>
  );
}
