// 담당자 화면 공통 — 행사 찾기와 로그인 확인 (서버)

import { notFound, redirect } from "next/navigation";
import { LoginBox } from "@/components/ev/login-box";
import { Shell } from "@/components/ev/ui";
import { roleOf, type Role } from "@/lib/ev/auth";
import { dbConfigured } from "@/lib/ev/db";
import { getEvent } from "@/lib/ev/service";
import type { PublicEvent } from "@/lib/ev/shared";

/** need 역할이 없으면 로그인 화면을 돌려주고, 있으면 행사 정보를 돌려줍니다 */
export async function guard(code: string, need: Role, what: string): Promise<{ ev: PublicEvent; role: Role } | { view: React.ReactNode }> {
  if (!dbConfigured()) return { view: <p className="p-10 text-center">데이터베이스가 아직 연결되지 않았어요.</p> };
  const ev = await getEvent(code);
  if (!ev) notFound();
  const role = await roleOf(code);
  if (role === "admin" || (role === "staff" && need === "staff")) return { ev, role };
  // 스태프가 관리자 화면에 오면 스캐너로
  if (role === "staff" && need === "admin") redirect(`/host/${code}/scan`);
  return {
    view: (
      <Shell color={ev.color} title={ev.name} sub="담당자 · 스태프 화면">
        <LoginBox code={code} what={what} />
      </Shell>
    ),
  };
}
