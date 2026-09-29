import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuditedClaims } from "@/lib/audit";
import { idr } from "@/lib/format";
import { RiskBadge } from "@/components/risk-badge";
import { requirePageRole } from "@/lib/role";

export const dynamic = "force-dynamic";

/** Shown right after a submit: what the engine decided, live. */
export default async function Done({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePageRole("employee");
  const id = Number((await params).id);
  const c = (await getAuditedClaims()).find((x) => x.id === id);
  if (!c || c.source !== "demo" || (me.employeeId && c.employee_id !== me.employeeId)) notFound();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-background p-5 text-center">
        <div className="text-sm text-muted-foreground">Claim #{c.id} submitted · {idr(c.amount)}</div>
        <div className="mt-3 text-sm">Audit engine result</div>
        <RiskBadge risk={c.risk} className="mt-2 px-6 py-2 text-2xl" />
      </div>
      <section className="rounded-xl border bg-background p-4">
        <h2 className="mb-2 text-sm font-semibold">
          {c.hits.length ? `${c.hits.length} reason${c.hits.length > 1 ? "s" : ""} Finance will see` : "No flags. Goes to the Low-risk pile."}
        </h2>
        <ul className="space-y-2">
          {c.hits.map((h) => (
            <li key={h.rule} className="flex gap-3 text-sm">
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">+{h.points}</span>
              <span>{h.reason}</span>
            </li>
          ))}
        </ul>
      </section>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/submit" className="flex h-12 items-center justify-center rounded-xl border text-sm font-medium">Submit another</Link>
        <Link href="/my" className="flex h-12 items-center justify-center rounded-xl bg-foreground text-sm font-medium text-background">My claims</Link>
      </div>
    </div>
  );
}
