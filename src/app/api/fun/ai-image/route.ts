// AI 이미지 — 화면에서 고른 스타일(또는 옷)과 사진을 받아 Gemini 로 바꾼 사진을 돌려줍니다.
// 사진은 저장하지 않습니다. 글(프롬프트)은 정해진 목록에서만 만듭니다.

import { stylePrompt, suitPrompt } from "@/lib/fun/ai-image";
import { editImage, geminiConfigured } from "@/lib/fun/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARS = 2_000_000;
const MESSAGES: Record<string, string> = {
  "not-configured": "AI 기능이 아직 설정되지 않았어요.",
  busy: "지금 요청이 많아요. 잠시 뒤 다시 눌러 주세요.",
  blocked: "이 사진으로는 AI 이미지를 만들 수 없었어요. 다른 스타일을 골라 보세요.",
  failed: "AI 이미지를 만들지 못했어요. 다시 눌러 주세요.",
};

export async function GET() {
  return Response.json({ configured: geminiConfigured() });
}

const OUTFITS = ["suitTie", "suit", "suitW", "shirtTie"];
const SUITS = ["navy", "charcoal", "black", "beige"];
const TIES = ["navy", "burgundy", "sky"];

export async function POST(request: Request) {
  if (!geminiConfigured()) return Response.json({ error: MESSAGES["not-configured"] }, { status: 503 });
  const b = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const image = typeof b?.image === "string" ? b.image : "";
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(image);
  if (!m || image.length > MAX_CHARS) return Response.json({ error: "사진이 올바르지 않아요." }, { status: 400 });

  let prompt: string | null = null;
  if (b?.kind === "style" && typeof b.style === "string") prompt = stylePrompt(b.style);
  if (b?.kind === "suit" && OUTFITS.includes(b.outfit as string) && SUITS.includes(b.suit as string) && TIES.includes(b.tie as string)) {
    prompt = suitPrompt(b as never);
  }
  if (!prompt) return Response.json({ error: "스타일이 올바르지 않아요." }, { status: 400 });

  const out = await editImage(m[1], prompt);
  if ("error" in out) return Response.json({ error: MESSAGES[out.error] ?? MESSAGES.failed }, { status: 502 });
  return Response.json(out);
}
