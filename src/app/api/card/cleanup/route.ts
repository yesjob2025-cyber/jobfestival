// 하루 한 번(vercel.json crons) 올린 지 3일이 지난 명함 이미지를 지웁니다.

import { del, list } from "@vercel/blob";
import { blobConfigured } from "@/lib/future-card/blob";

export const runtime = "nodejs";

const KEEP_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  // CRON_SECRET 을 정해 두면 Vercel 크론만 부를 수 있습니다.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("unauthorized", { status: 401 });
  }
  if (!blobConfigured()) return Response.json({ deleted: 0 });

  const cutoff = Date.now() - KEEP_MS;
  let cursor: string | undefined;
  let deleted = 0;
  do {
    const page = await list({ prefix: "cards/", cursor, limit: 1000 });
    const old = page.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff).map((b) => b.url);
    if (old.length) await del(old);
    deleted += old.length;
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return Response.json({ deleted });
}
