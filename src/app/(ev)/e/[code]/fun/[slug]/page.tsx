import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FUN_EVENTS } from "@/lib/fun/config";
import { guard } from "../../../../host/[code]/guard";
import { EventBooth } from "./event-booth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = FUN_EVENTS.find((x) => x.slug === slug);
  return e ? { title: e.name } : {};
}

/** 행사 부스 태블릿 — 스태프 로그인 후, 고른 부대행사만 (확정 전에는 관리자만 미리 보기) */
export default async function Page({ params }: Props) {
  const { code, slug } = await params;
  const g = await guard(code, "staff", "부스 태블릿 — 스태프 로그인");
  if ("view" in g) return g.view;
  if (!g.ev.booths.includes(slug) || !FUN_EVENTS.some((e) => e.slug === slug)) notFound();
  if (g.ev.status !== "confirmed" && g.role !== "admin") {
    return <p className="p-10 text-center font-bold">아직 확정되지 않은 행사예요. 운영자가 확정하면 부스가 열려요.</p>;
  }
  return <EventBooth event={g.ev} slug={slug} />;
}
