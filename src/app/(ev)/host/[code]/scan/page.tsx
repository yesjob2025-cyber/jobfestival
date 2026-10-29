import type { Metadata } from "next";
import { guard } from "../guard";
import { Scanner } from "./scanner";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "입장 · 퇴장 스캐너" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const g = await guard(code, "staff", "스태프 로그인");
  if ("view" in g) return g.view;
  return <Scanner event={g.ev} role={g.role} />;
}
