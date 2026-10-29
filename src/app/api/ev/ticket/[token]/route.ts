// 참가자 티켓 — 상태 확인(GET) · 퇴장 전 만족도 설문 제출(POST)

import { getTicket, saveSurvey } from "@/lib/ev/service";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const t = await getTicket((await params).token);
  if (!t) return Response.json({ error: "티켓을 찾을 수 없어요." }, { status: 404 });
  return Response.json(t, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const t = await getTicket(token);
  if (!t) return Response.json({ error: "티켓을 찾을 수 없어요." }, { status: 404 });
  if (!t.enteredAt) return Response.json({ error: "입장한 뒤에 설문에 참여할 수 있어요." }, { status: 400 });
  const b = (await req.json().catch(() => ({}))) as { scores?: unknown; comment?: unknown };
  const scores = Array.isArray(b.scores) ? b.scores.map(Number) : [];
  const err = await saveSurvey(token, scores, String(b.comment ?? ""), t.event.survey.length);
  if (err) return Response.json({ error: err }, { status: 400 });
  return Response.json(await getTicket(token));
}
