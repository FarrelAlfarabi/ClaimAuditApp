import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/db";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  // Only our own generated names: 64 hex chars + known extension. Blocks path traversal.
  if (!/^[a-f0-9]{64}\.(jpg|png|webp|gif)$/.test(name)) return new Response("Not found", { status: 404 });
  const file = path.join(UPLOAD_DIR, name);
  if (!fs.existsSync(file)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(file), {
    headers: { "Content-Type": TYPES[path.extname(name)], "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" },
  });
}
