// 하루 한 번(vercel.json crons) — 보관 기간이 지난 행사의 이름 · 연락처 등을 지웁니다.

import { dbConfigured } from "@/lib/ev/db";
import { purgeExpired } from "@/lib/ev/service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("unauthorized", { status: 401 });
  }
  if (!dbConfigured()) return Response.json({ purged: [] });
  return Response.json({ purged: await purgeExpired() });
}
