// ─────────────────────────────────────────────────────────────
// 미래 명함 — QR 로 휴대폰에 받기 (브라우저 쪽)
//
// 부스 기기가 완성 명함(JPEG)을 /api/card 로 올리면 ID 가 돌아옵니다 (Vercel Blob 비공개 저장소).
// QR 에는 받기 페이지 주소(?id=…)를 담고, 이미지는 /api/card/[id] 로만 보여 줍니다.
// ─────────────────────────────────────────────────────────────

const ID = /^[a-z0-9]{20}$/;

/** 받기 페이지 → 이미지 주소 (엉뚱한 값은 거름) */
export function cardImageUrl(id?: string): string | null {
  return id && ID.test(id) ? `/api/card/${id}` : null;
}

/** 완성 명함을 올리고 받기 페이지 주소(QR 내용)를 돌려줍니다. */
export async function uploadCard(canvas: HTMLCanvasElement, receivePath: string): Promise<string> {
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
  if (!blob) throw new Error("encode");
  const res = await fetch("/api/card", { method: "POST", body: blob, headers: { "content-type": "image/jpeg" } });
  if (res.status === 503) throw new Error("not-configured");
  if (!res.ok) throw new Error(`upload ${res.status}`);
  const { id } = (await res.json()) as { id: string };
  return `${location.origin}${receivePath}?id=${id}`;
}
