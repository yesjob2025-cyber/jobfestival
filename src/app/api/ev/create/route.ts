// 새 행사 만들기 — 개설 코드(EVENT_CREATE_CODE)가 맞아야 합니다. 만든 사람은 바로 관리자로 로그인됩니다.

import { checkCreateCode, login } from "@/lib/ev/auth";
import { dbConfigured } from "@/lib/ev/db";
import { cleanEvent, createEvent } from "@/lib/ev/service";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ db: dbConfigured(), create: !!process.env.EVENT_CREATE_CODE });
}

export async function POST(req: Request) {
  if (!dbConfigured()) return Response.json({ error: "데이터베이스가 아직 연결되지 않았어요. (DATABASE_URL)" }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!checkCreateCode(String(b.createCode ?? ""))) return Response.json({ error: "개설 코드가 맞지 않아요." }, { status: 403 });
  const e = cleanEvent(b);
  if (typeof e === "string") return Response.json({ error: e }, { status: 400 });
  const out = await createEvent(e);
  await login(out.code, "admin");
  return Response.json(out);
}
