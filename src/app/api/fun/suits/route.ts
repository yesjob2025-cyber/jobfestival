// 실사 정장 목록 — 누구나 읽기(GET), 운영자만 저장 · 지우기(POST)

import { session } from "@/lib/ev/auth";
import { readSuits, removeSuit, saveSuit, toItem } from "@/lib/fun/suit-store";
import { SUIT_ID } from "@/lib/fun/suits";
import { blobConfigured } from "@/lib/future-card/blob";

export const runtime = "nodejs";

export async function GET() {
  return Response.json((await readSuits()).map(toItem), { headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  if (!(await session()).super) return Response.json({ error: "운영자 로그인이 필요해요." }, { status: 401 });
  if (!blobConfigured()) return Response.json({ error: "파일 저장소(Vercel Blob)가 연결되지 않았어요." }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(b.id ?? "");
  if (!SUIT_ID.test(id)) return Response.json({ error: "id 가 올바르지 않아요." }, { status: 400 });
  if (b.remove === true) {
    await removeSuit(id);
    return Response.json({ ok: true });
  }
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(String(b.image ?? ""));
  const neck = Array.isArray(b.neck) ? b.neck.map(Number) : [];
  const shoulder = Number(b.shoulder);
  if (!m || m[1].length > 6_000_000) return Response.json({ error: "PNG 이미지가 필요해요 (4MB 이하)." }, { status: 400 });
  if (neck.length !== 2 || neck.some((v) => !Number.isFinite(v)) || !(shoulder > 10)) return Response.json({ error: "목 위치 · 어깨 폭을 확인해 주세요." }, { status: 400 });
  await saveSuit(
    { id, name: String(b.name ?? id).slice(0, 40), gender: b.gender === "f" ? "f" : "m", neck: [neck[0], neck[1]], shoulder },
    Buffer.from(m[1], "base64"),
  );
  return Response.json({ ok: true });
}
