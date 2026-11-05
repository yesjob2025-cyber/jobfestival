import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { roleOf } from "@/lib/ev/auth";
import { dbConfigured } from "@/lib/ev/db";
import { getEvent } from "@/lib/ev/service";
import { EventHome } from "./event-home";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!dbConfigured()) return {};
  const ev = await getEvent((await params).code);
  return ev ? { title: ev.name, description: `${ev.hostOrg} ${ev.name} — 사전등록 · 입장 QR · 부대행사` } : {};
}

/** 행사 전용 페이지 — 사전등록 · 내 입장 QR · 부대행사 안내 (확정된 행사만 부대행사가 열림) */
export default async function Page({ params }: Props) {
  if (!dbConfigured()) return <p className="p-10 text-center">데이터베이스가 아직 연결되지 않았어요.</p>;
  const { code } = await params;
  const ev = await getEvent(code);
  if (!ev) notFound();
  const role = await roleOf(code);
  return <EventHome event={ev} role={role} />;
}
