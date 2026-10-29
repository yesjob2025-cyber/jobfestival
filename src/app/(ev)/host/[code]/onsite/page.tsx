import type { Metadata } from "next";
import { guard } from "../guard";
import { Onsite } from "./onsite";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "현장 등록" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const g = await guard(code, "staff", "스태프 로그인");
  if ("view" in g) return g.view;
  return <Onsite event={g.ev} />;
}
