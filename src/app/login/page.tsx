import { redirect } from "next/navigation";
import { authEnabled, quickLoginEnabled } from "@/lib/auth/config";
import { getSessionUser } from "@/lib/role";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!authEnabled()) redirect("/"); // login switched off: demo role switcher instead
  const me = await getSessionUser();
  if (me) redirect(me.role === "employee" ? "/submit" : "/");
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm space-y-5 pt-4">
      <div>
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="text-sm text-muted-foreground">Demo accounts only. All data in this app is MOCK.</p>
      </div>
      <LoginForm next={next ?? ""} quick={quickLoginEnabled()} />
    </div>
  );
}
