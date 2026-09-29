import Link from "next/link";
import { redirect } from "next/navigation";
import { PREVIEWS } from "@/lib/previews";
import { getSessionUser } from "@/lib/role";
import { getDict, getLang } from "@/lib/i18n/server";
import { IconAlert, IconChevronRight, IconSparkle } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function PreviewIndex() {
  if (!(await getSessionUser())) redirect("/login");
  const [t, lang] = await Promise.all([getDict(), getLang()]);
  const phases = ["Phase 1", "Phase 2"] as const;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight md:text-3xl">{t.coming.title}</h1>
        <p className="text-sm text-muted-foreground">{t.coming.sub}</p>
      </div>
      <div className="preview-banner flex items-center gap-2 text-[13px] font-extrabold tracking-wide"><IconAlert size={18} className="shrink-0" />{t.coming.none}</div>
      {phases.map((ph) => (
        <section key={ph} className="space-y-2.5">
          <h2 className="text-lg font-extrabold">{t.coming.phase[ph]}</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {PREVIEWS.filter((p) => p.phase === ph).map((p) => (
              <li key={p.slug}>
                <Link href={`/preview/${p.slug}`} className="card flex min-h-11 items-start gap-3 p-3.5 text-inherit no-underline hover:border-border-strong active:bg-card-2">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${ph === "Phase 1" ? "bg-primary-soft text-primary-ink" : "bg-accent-soft text-mock"}`}>
                    <IconSparkle size={22} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-extrabold">{lang === "id" ? p.titleId : p.title}</span>
                      <span className="rounded-full bg-card-2 px-2 py-0.5 text-xs font-bold text-ink-2">{t.who[p.who]}</span>
                      <span className="mock-tag">{t.coming.preview}</span>
                    </span>
                    <span className="text-sm leading-snug text-ink-2">{lang === "id" ? p.blurbId : p.blurb}</span>
                  </span>
                  <IconChevronRight className="mt-3 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
