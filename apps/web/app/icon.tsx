import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 32, height: 32 };

export default function Icon() {
  const buf = readFileSync(join(process.cwd(), "public", "favicon_32x32.png"));
  return new Response(buf, { headers: { "Content-Type": "image/png" } });
}
