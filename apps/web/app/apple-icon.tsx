import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 192, height: 192 };

export default function AppleIcon() {
  const buf = readFileSync(join(process.cwd(), "public", "icon_192x192.png"));
  return new Response(buf, { headers: { "Content-Type": "image/png" } });
}
