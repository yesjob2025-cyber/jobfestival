import type { Metadata } from "next";
import { guard } from "../guard";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "행사 설정" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const g = await guard(code, "admin", "관리자 로그인");
  if ("view" in g) return g.view;
  return <SettingsForm event={g.ev} />;
}
