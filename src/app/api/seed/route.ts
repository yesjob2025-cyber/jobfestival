import { NextResponse } from "next/server";
import { seedBooths } from "@/lib/seed-runner";

// 보호된 시드 엔드포인트: /api/seed?secret=...[&force=1]
// SEED_SECRET 환경변수와 일치해야 실행. Supabase 에 부스 데이터를 채운다.
// (참가자·지원·체크인 데이터는 force 를 써도 삭제되지 않음)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const force = url.searchParams.get("force") === "1";

  if (!process.env.SEED_SECRET) {
    return NextResponse.json({ error: "SEED_SECRET 미설정" }, { status: 400 });
  }
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await seedBooths(force));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
