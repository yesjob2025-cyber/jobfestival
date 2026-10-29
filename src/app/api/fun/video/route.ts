// 1분 자기소개 영상 — 브라우저가 저장소(Vercel Blob, 비공개)에 바로 올릴 수 있게 일회용 서명 주소를 내줍니다.
// (서버를 거치면 4.5MB 요청 한도에 걸리므로 영상은 직접 업로드)
// 서명 방식은 저장소 연결이 토큰(BLOB_READ_WRITE_TOKEN) · OIDC(BLOB_STORE_ID) 어느 쪽이어도 됩니다.

import { issueSignedToken, put } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { blobConfigured } from "@/lib/future-card/blob";

export const runtime = "nodejs";

const PATH = /^videos\/[a-z0-9]{20}\.(mp4|webm)$/;
const MAX_BYTES = 60 * 1024 * 1024;
const TYPES = ["video/mp4", "video/webm"];

/** 업로드 전에 저장소가 연결돼 있는지 확인 (안 돼 있으면 화면에 안내) */
export async function GET() {
  return Response.json({ configured: blobConfigured() });
}

export async function POST(request: Request) {
  if (!blobConfigured()) return Response.json({ error: "not-configured" }, { status: 503 });
  const body = (await request.json()) as HandleUploadPresignedBody;
  try {
    const result = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname, clientPayload) => {
        if (!PATH.test(pathname)) throw new Error("bad path");
        // 대본은 받기 페이지에서 영상과 함께 보여 주려고 따로 저장합니다.
        if (clientPayload) {
          await put(pathname.replace(/\.(mp4|webm)$/, ".txt"), clientPayload.slice(0, 1500), {
            access: "private",
            contentType: "text/plain; charset=utf-8",
            addRandomSuffix: false,
          });
        }
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: TYPES,
          maximumSizeInBytes: MAX_BYTES,
          validUntil: Date.now() + 10 * 60 * 1000,
        });
        return { token, urlOptions: { allowedContentTypes: TYPES, maximumSizeInBytes: MAX_BYTES, addRandomSuffix: false } };
      },
    });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "upload" }, { status: 400 });
  }
}
