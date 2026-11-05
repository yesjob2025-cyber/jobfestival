// 운영자 전용 — Gemini 로 정장 사진 만들기 (초록 배경, 배경 지우기 · 저장은 콘솔 화면에서)

import { session } from "@/lib/ev/auth";
import { generateImage, geminiConfigured } from "@/lib/fun/gemini";
import { SUIT_PRESETS, suitPrompt } from "@/lib/fun/suits";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await session()).super) return Response.json({ error: "운영자 로그인이 필요해요." }, { status: 401 });
  if (!geminiConfigured()) return Response.json({ error: "GEMINI_API_KEY 가 없어요. 이미지 올리기를 써 주세요." }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as { preset?: string };
  const p = SUIT_PRESETS.find((x) => x.id === b.preset);
  if (!p) return Response.json({ error: "정장 종류를 골라 주세요." }, { status: 400 });
  const out = await generateImage(suitPrompt(p.garment));
  if ("error" in out) return Response.json({ error: out.error === "busy" ? "요청이 많아요. 잠시 뒤 다시." : "만들지 못했어요. 다시 눌러 주세요." }, { status: 502 });
  return Response.json(out);
}
