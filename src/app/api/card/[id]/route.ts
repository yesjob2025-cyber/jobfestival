// 비공개 저장소의 명함 이미지를 보여 줍니다 (QR 받기 페이지에서 사용).

import { get } from "@vercel/blob";
import { blobConfigured, cardPath, isCardId } from "@/lib/future-card/blob";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isCardId(id) || !blobConfigured()) return new Response("not found", { status: 404 });

  try {
    const res = await get(cardPath(id), { access: "private" });
    if (!res || res.statusCode !== 200) return new Response("not found", { status: 404 });
    return new Response(res.stream, {
      headers: {
        "content-type": res.blob.contentType,
        "cache-control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
