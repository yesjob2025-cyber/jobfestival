// 실사 정장 그림 (누구나)

import { get } from "@vercel/blob";
import { SUIT_ID } from "@/lib/fun/suits";
import { blobConfigured } from "@/lib/future-card/blob";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!SUIT_ID.test(id) || !blobConfigured()) return new Response("not found", { status: 404 });
  const r = await get(`suits/${id}.png`, { access: "private" }).catch(() => null);
  if (!r || r.statusCode !== 200 || !r.stream) return new Response("not found", { status: 404 });
  return new Response(r.stream, { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable" } });
}
