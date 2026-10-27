// ─────────────────────────────────────────────────────────────
// 미래 명함 — QR 로 휴대폰에 받기
//
// 부스 기기가 완성 명함(JPEG)을 /api/card 로 올리면 Vercel Blob 주소가 돌아옵니다.
// QR 에는 그 주소를 짧게 줄여 (저장소 ID s + 파일 ID f) 받기 페이지 주소로 담습니다.
// ─────────────────────────────────────────────────────────────

const BLOB_HOST = ".public.blob.vercel-storage.com";
const SAFE = /^[a-z0-9]{6,40}$/i;

/** 올린 명함을 받는 페이지 주소 (QR 내용) */
export function receiveUrl(origin: string, receivePath: string, blobUrl: string): string {
  const u = new URL(blobUrl);
  const s = u.hostname.slice(0, -BLOB_HOST.length);
  const f = u.pathname.replace(/^\/cards\//, "").replace(/\.jpg$/, "");
  return `${origin}${receivePath}?s=${s}&f=${f}`;
}

/** 받기 페이지 → 실제 이미지 주소 (엉뚱한 주소는 거름) */
export function cardImageUrl(s?: string, f?: string): string | null {
  if (!s || !f || !SAFE.test(s) || !SAFE.test(f)) return null;
  return `https://${s}${BLOB_HOST}/cards/${f}.jpg`;
}

/** 완성 명함을 올리고 받기 페이지 주소를 돌려줍니다. */
export async function uploadCard(canvas: HTMLCanvasElement, receivePath: string): Promise<string> {
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
  if (!blob) throw new Error("encode");
  const res = await fetch("/api/card", { method: "POST", body: blob, headers: { "content-type": "image/jpeg" } });
  if (res.status === 503) throw new Error("not-configured");
  if (!res.ok) throw new Error(`upload ${res.status}`);
  const { url } = (await res.json()) as { url: string };
  return receiveUrl(location.origin, receivePath, url);
}
