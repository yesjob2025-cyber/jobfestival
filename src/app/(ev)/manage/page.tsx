import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/ev/admin-shell";
import { StatusBadge } from "@/components/ev/status-badge";
import { session } from "@/lib/ev/auth";
import { dbConfigured } from "@/lib/ev/db";
import { getOrg, listEvents } from "@/lib/ev/service";
import { dateRange } from "@/lib/ev/shared";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "내 행사" };

/** 기관 관리자 첫 화면 — 우리 기관 행사 목록 */
export default async function Page() {
  if (!dbConfigured()) return <p className="p-10 text-center">데이터베이스가 아직 연결되지 않았어요.</p>;
  const s = await session();
  if (s.super) redirect("/console");
  if (!s.orgId) redirect("/login");
  const [org, events] = await Promise.all([getOrg(s.orgId), listEvents(s.orgId)]);
  if (!org) redirect("/login");

  return (
    <AdminShell who={`${org.name} · ${org.login_id}`}>
      <h1 className="text-2xl font-extrabold text-ink">{org.name} 행사</h1>
      <p className="mt-1 text-sm text-ink-muted">행사를 눌러 대시보드(등록자 · 부스 참여 · 만족도)와 운영 도구를 여세요.</p>
      {events.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-muted">아직 만들어진 행사가 없어요. 서비스 담당자가 행사를 열면 여기에 나타나요.</div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {events.map((e) => (
            <li key={e.code}>
              <Link href={`/host/${e.code}`} className="card-link flex h-full flex-col p-5" style={{ borderTop: `6px solid ${e.color}` }}>
                <span className="flex items-start justify-between gap-2">
                  <span className="text-lg font-extrabold text-ink">{e.name}</span>
                  <StatusBadge status={e.status} />
                </span>
                <span className="mt-1 text-sm text-ink-muted">
                  {dateRange(e.startsOn, e.endsOn)}
                  {e.place && ` · ${e.place}`}
                </span>
                <span className="mt-4 flex gap-4 text-sm font-bold text-ink-soft">
                  <span>등록 {e.total}</span>
                  <span>입장 {e.entered}</span>
                  <span>부대행사 {e.booths.length}개</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
