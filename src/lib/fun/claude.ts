// 부대행사 서버 전용 — Claude 로 짧은 글 쓰기 (1분 자기소개 대본 · 타로 풀이)
// ANTHROPIC_API_KEY 가 없거나 실패 · 거절이면 null → 호출하는 쪽이 미리 만든 글로 대신합니다.

import Anthropic from "@anthropic-ai/sdk";

export async function writeWithClaude(system: string, user: string, label: string): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic();
  try {
    const res = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system,
      messages: [{ role: "user", content: user }],
    });
    if (res.stop_reason === "refusal") return null;
    const out = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return out || null;
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) console.warn(`${label}: rate limited`);
    else if (e instanceof Anthropic.APIError) console.error(`${label}: API ${e.status}`, e.message);
    else console.error(`${label}:`, e);
    return null;
  }
}
