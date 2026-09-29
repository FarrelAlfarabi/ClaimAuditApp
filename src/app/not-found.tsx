import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-lg font-semibold">Not found</h1>
      <p className="text-sm text-muted-foreground">This claim or page does not exist. It may have been removed by a demo reset.</p>
      <Link href="/" className="mx-auto flex h-12 max-w-xs items-center justify-center rounded-xl border text-sm font-medium">Back to queue</Link>
    </div>
  );
}
