// ─────────────────────────────────────────────────────────────
// AI 이미지 (Google Gemini) — 미래 명함 AI 스타일 · 이력서 사진 AI 실사 정장
//
// 화면은 스타일 id 나 옷 선택만 보내고, 글(프롬프트)은 서버가 이 목록에서 만듭니다.
// (아무 글이나 보내 이미지를 만들게 하지 않으려는 것)
// 서버에 GEMINI_API_KEY 가 없으면 버튼이 보이지 않습니다.
// ─────────────────────────────────────────────────────────────

import type { IdOptions } from "./id-photo";

/** 얼굴을 그대로 두라는 공통 지시 */
const KEEP =
  "Keep the person's face, identity, facial features, skin tone, hairstyle and expression exactly the same and clearly recognizable. " +
  "Keep the same head position, size and framing (head and shoulders, centered, facing the camera). " +
  "Use a plain, clean, light solid background. Output a single square image. No text, no watermark, no logos.";

export const AI_STYLES = [
  { id: "ceo", emoji: "💼", name: "10년 후 CEO", prompt: "Transform this photo into a polished corporate portrait of the same person ten years later as a successful CEO: tailored dark business suit, confident smile, soft studio lighting, photorealistic." },
  { id: "captain", emoji: "⚓", name: "선장 · 항해사", prompt: "Transform this photo into a photorealistic portrait of the same person as a ship captain in a crisp white naval officer uniform with gold insignia and a captain's cap." },
  { id: "doctor", emoji: "🩺", name: "의사 가운", prompt: "Transform this photo into a photorealistic portrait of the same person as a hospital doctor wearing a white coat and a stethoscope, friendly expression." },
  { id: "astronaut", emoji: "🚀", name: "우주비행사", prompt: "Transform this photo into a photorealistic portrait of the same person as an astronaut in a white space suit, helmet off, with a subtle mission patch." },
  { id: "webtoon", emoji: "📱", name: "웹툰 주인공", prompt: "Redraw this photo as a Korean webtoon main character illustration: clean line art, soft cel shading, bright colors, smart casual outfit." },
  { id: "toon3d", emoji: "🧸", name: "3D 애니 캐릭터", prompt: "Redraw this photo as a cute 3D animated feature-film character: big expressive eyes, soft subsurface lighting, smooth stylized shapes, smart casual outfit." },
  { id: "watercolor", emoji: "🎨", name: "수채화 애니", prompt: "Redraw this photo as a hand-painted anime film still with soft watercolor textures, warm gentle lighting and delicate line art." },
  { id: "oil", emoji: "🖼️", name: "명화 초상화", prompt: "Redraw this photo as a classical Renaissance oil painting portrait with rich brush strokes, dramatic chiaroscuro lighting and elegant period clothing." },
  { id: "hero", emoji: "🦸", name: "슈퍼히어로", prompt: "Transform this photo into a cinematic portrait of the same person as an original superhero (no existing characters) in a navy and sky-blue suit with a yellow emblem, heroic lighting." },
  { id: "clay", emoji: "🟠", name: "클레이 인형", prompt: "Redraw this photo as a handmade clay figurine (claymation style) with visible fingerprint textures, soft studio lighting and a cheerful look." },
] as const;
export type AiStyleId = (typeof AI_STYLES)[number]["id"];

/** 이력서 사진용 — 고른 옷 · 색 그대로 실사 정장으로 */
export function suitPrompt(o: Pick<IdOptions, "outfit" | "suit" | "tie">): string {
  const suitEn = { navy: "navy", charcoal: "charcoal gray", black: "black", beige: "beige" }[o.suit];
  const tieEn = { navy: "navy", burgundy: "burgundy", sky: "sky blue" }[o.tie];
  const outfit = {
    suitTie: `a well-fitted ${suitEn} business suit jacket, a crisp white dress shirt and a ${tieEn} necktie`,
    suit: `a well-fitted ${suitEn} business suit jacket over a crisp white dress shirt with an open collar, no tie`,
    suitW: `a well-fitted women's ${suitEn} business suit jacket over a white blouse`,
    shirtTie: `a crisp white dress shirt with a ${tieEn} necktie, no jacket`,
  }[o.outfit];
  return (
    `Edit this photo into a professional Korean resume ID photo. Change only the clothing: the person wears ${outfit}, realistic fabric and natural fit on the shoulders. ` +
    "Front-facing, neat, soft even studio lighting, photorealistic, high detail. " +
    KEEP
  );
}

export function stylePrompt(id: string): string | null {
  const s = AI_STYLES.find((x) => x.id === id);
  return s ? `${s.prompt} ${KEEP}` : null;
}

export type AiRequest = { kind: "style"; style: AiStyleId } | ({ kind: "suit" } & Pick<IdOptions, "outfit" | "suit" | "tie">);

/** 서버에 Gemini 키가 있는지 */
export async function aiAvailable(): Promise<boolean> {
  try {
    const r = await fetch("/api/fun/ai-image");
    return ((await r.json()) as { configured?: boolean }).configured === true;
  } catch {
    return false;
  }
}

/** 사진을 보내 AI 이미지를 받아 같은 크기 정사각형 캔버스로 돌려줍니다. 실패하면 오류 문구를 던집니다. */
export async function aiTransform(src: HTMLCanvasElement, req: AiRequest): Promise<HTMLCanvasElement> {
  // 보낼 때는 768px JPEG 로 줄여서 (요청 크기 · 속도)
  const small = document.createElement("canvas");
  small.width = small.height = 768;
  small.getContext("2d")!.drawImage(src, 0, 0, 768, 768);
  const res = await fetch("/api/fun/ai-image", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...req, image: small.toDataURL("image/jpeg", 0.9) }),
  });
  const body = (await res.json().catch(() => ({}))) as { image?: string; error?: string };
  if (!res.ok || !body.image) throw new Error(body.error ?? "AI 이미지를 만들지 못했어요.");

  const img = new Image();
  img.src = body.image;
  await img.decode();
  const size = src.width;
  const out = document.createElement("canvas");
  out.width = out.height = size;
  // 정사각형이 아니면 가운데를 잘라 맞춤
  const k = Math.max(size / img.naturalWidth, size / img.naturalHeight);
  const w = img.naturalWidth * k;
  const h = img.naturalHeight * k;
  out.getContext("2d")!.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return out;
}
