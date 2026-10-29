// 부대행사 서버 전용 — Google Gemini 로 사진 바꾸기 (사진 + 글 → 사진)
// GEMINI_API_KEY 가 없으면 null. 모델은 GEMINI_IMAGE_MODEL 로 바꿀 수 있습니다.

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

export const geminiConfigured = () => !!process.env.GEMINI_API_KEY;

type Part = { text?: string; inlineData?: { mimeType: string; data: string }; inline_data?: { mime_type: string; data: string } };

/** 성공하면 data URL, 거절 · 실패면 이유와 함께 null */
export async function editImage(jpegBase64: string, prompt: string): Promise<{ image: string } | { error: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: "not-configured" };
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: jpegBase64 } }] }],
        generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "1:1" } },
      }),
      signal: AbortSignal.timeout(55_000),
    });
    if (!res.ok) {
      console.error("gemini:", res.status, (await res.text()).slice(0, 500));
      return { error: res.status === 429 ? "busy" : "failed" };
    }
    const body = (await res.json()) as { candidates?: { content?: { parts?: Part[] }; finishReason?: string }[]; promptFeedback?: { blockReason?: string } };
    const parts = body.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      const mime = p.inlineData?.mimeType ?? p.inline_data?.mime_type;
      const data = p.inlineData?.data ?? p.inline_data?.data;
      if (mime && data) return { image: `data:${mime};base64,${data}` };
    }
    console.warn("gemini: no image", body.promptFeedback?.blockReason ?? body.candidates?.[0]?.finishReason);
    return { error: "blocked" };
  } catch (e) {
    console.error("gemini:", e);
    return { error: "failed" };
  }
}
