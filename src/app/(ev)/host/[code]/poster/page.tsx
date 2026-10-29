import type { Metadata } from "next";
import { guard } from "../guard";
import { Poster } from "./poster";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "사전등록 QR 포스터" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const g = await guard(code, "admin", "관리자 로그인");
  if ("view" in g) return g.view;
  return <Poster event={g.ev} />;
}
