import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/db";
import { getSessionUser } from "@/lib/role";
import { usingSupabase } from "@/lib/store";
import { sb } from "@/lib/store-supabase";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!(await getSessionUser())) return new Response("Not found", { status: 404 });
  const { name } = await params;
  // Only our own generated names: 64 hex chars + known extension. Blocks path traversal.
  if (!/^[a-f0-9]{64}\.(jpg|png|webp|gif)$/.test(name)) return new Response("Not found", { status: 404 });
  if (usingSupabase()) {
    const r = await sb.readReceiptFile(name); // storage policy: only signed-in app users can read
    if (!r) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(r.bytes), {
      headers: { "Content-Type": TYPES[path.extname(name)], "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" },
    });
  }
  const file = path.join(UPLOAD_DIR, name);
  if (!fs.existsSync(file)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(file), {
    headers: { "Content-Type": TYPES[path.extname(name)], "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" },
  });
}
