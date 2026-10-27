// 완성된 미래 명함 이미지를 올려 두고 ID 를 돌려줍니다 → 화면의 QR 로 각자 휴대폰에서 받기.
// 저장소: Vercel Blob (비공개). 이미지는 /api/card/[id] 로만 보여 주고, 3일이 지나면 cleanup 이 지웁니다.

import { put } from "@vercel/blob";
import { blobConfigured, cardPath, newCardId } from "@/lib/future-card/blob";

export const runtime = "nodejs";

const MAX_BYTES = 3_500_000;

export async function POST(req: Request) {
  if (!blobConfigured()) {
    return Response.json({ error: "not-configured" }, { status: 503 });
  }

  const body = new Uint8Array(await req.arrayBuffer());
  if (body.byteLength === 0 || body.byteLength > MAX_BYTES) {
    return Response.json({ error: "size" }, { status: 413 });
  }
  // JPEG 만 받습니다 (FF D8 FF)
  if (body[0] !== 0xff || body[1] !== 0xd8 || body[2] !== 0xff) {
    return Response.json({ error: "type" }, { status: 415 });
  }

  const id = newCardId();
  await put(cardPath(id), Buffer.from(body), {
    access: "private",
    contentType: "image/jpeg",
    addRandomSuffix: false,
  });
  return Response.json({ id });
}
