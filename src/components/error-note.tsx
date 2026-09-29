export function ErrorNote({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{msg}</p>;
}
