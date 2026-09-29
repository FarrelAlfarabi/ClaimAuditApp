import { redirect } from "next/navigation";
import { authEnabled, quickLoginEnabled } from "@/lib/auth/config";
import { getSessionUser } from "@/lib/role";
import { getDict } from "@/lib/i18n/server";
import { LoginForm } from "@/components/login-form";
import { IconReceipt } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!authEnabled()) redirect("/"); // login switched off: demo role switcher instead
  const me = await getSessionUser();
  if (me) redirect(me.role === "employee" ? "/submit" : "/");
  const t = await getDict();
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm space-y-5">
      <section className="relative -mx-4 -mt-5 overflow-hidden rounded-b-[32px] bg-accent-soft px-6 pt-8 pb-8 sm:mx-0 sm:mt-0 sm:rounded-[32px]">
        <div className="absolute -right-10 top-4 h-[170px] w-[170px] rounded-full bg-accent" aria-hidden />
        <div className="absolute right-14 top-28 h-[70px] w-[70px] rotate-[14deg] rounded-[22px] bg-primary opacity-90" aria-hidden />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary text-primary-foreground shadow-[0_5px_0_var(--primary-strong)]">
          <IconReceipt size={34} strokeWidth={2} />
        </div>
        <h1 className="relative mt-4 text-[32px] font-extrabold tracking-tight">{t.app.name}</h1>
        <p className="relative mt-1 max-w-[230px] text-base font-semibold leading-snug text-ink-2">{t.login.tagline}</p>
        <span className="mock-tag relative mt-3">{t.app.mockTag}</span>
      </section>
      <p className="sr-only">{t.login.title}</p>
      <LoginForm next={next ?? ""} quick={quickLoginEnabled()} />
      <p className="text-center text-[13px] text-muted-foreground">{t.login.footer}</p>
    </div>
  );
}
