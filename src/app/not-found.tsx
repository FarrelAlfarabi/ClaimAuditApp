import Link from "next/link";
import { getDict } from "@/lib/i18n/server";

export default async function NotFound() {
  const t = await getDict();
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 px-5 py-8 text-center">
      <h1 className="text-lg font-extrabold">{t.error.notFound}</h1>
      <p className="text-sm text-muted-foreground">{t.error.notFoundBody}</p>
      <Link href="/" className="btn btn-secondary w-full max-w-xs">{t.detail.back}</Link>
    </div>
  );
}
