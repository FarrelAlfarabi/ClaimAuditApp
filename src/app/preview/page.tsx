import Link from "next/link";
import { PREVIEWS } from "@/lib/previews";
import { getSessionUser } from "@/lib/role";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PreviewIndex() {
  if (!(await getSessionUser())) redirect("/login");
  const phases = ["Phase 1", "Phase 2"] as const;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Coming next</h1>
        <p className="text-sm text-muted-foreground">
          Pictures of planned features so you can see where this is going. <b>None of these work yet.</b> Everything outside this
          section is the working demo.
        </p>
      </div>
      {phases.map((ph) => (
        <section key={ph} className="space-y-2">
          <h2 className="text-sm font-semibold">{ph}{ph === "Phase 1" ? " (after contract)" : " (later, separate contract)"}</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {PREVIEWS.filter((p) => p.phase === ph).map((p) => (
              <li key={p.slug}>
                <Link href={`/preview/${p.slug}`} className="block min-h-11 rounded-xl border border-dashed bg-background p-4 active:bg-muted">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{p.title}</span>
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">PREVIEW</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{p.blurb}</div>
                  <div className="mt-1 text-xs text-muted-foreground">For: {p.who}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
