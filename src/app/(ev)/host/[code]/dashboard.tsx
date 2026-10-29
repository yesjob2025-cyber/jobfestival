"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Card, EvButton, QrImage, Shell, Stat } from "@/components/ev/ui";
import { HourlyChart } from "@/components/ev/hourly-chart";
import type { Stats } from "@/lib/ev/service";
import { dateRange, type PublicEvent } from "@/lib/ev/shared";

/** 담당자 관리 화면 — 실시간 현황 + 바로가기 */
export function Dashboard({ event: ev }: { event: PublicEvent }) {
  const router = useRouter();
  const [s, setS] = useState<Stats | null>(null);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [newPin, setNewPin] = useState<{ which: string; pin: string } | null>(null);

  useEffect(() => {
    setOrigin(location.origin);
    const load = () => api<Stats>(`/api/ev/${ev.code}/stats`).then(setS).catch(() => {});
    load();
    const t = setInterval(() => document.visibilityState === "visible" && load(), 10_000);
    return () => clearInterval(t);
  }, [ev.code]);

  const regUrl = `${origin}/e/${ev.code}`;
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");

  async function pin(which: "admin" | "staff") {
    if (!confirm(`${which === "admin" ? "관리자" : "스태프"} PIN 을 새로 발급할까요? 이전 PIN 은 더 이상 쓸 수 없어요.`)) return;
    setNewPin(await api<{ which: string; pin: string }>(`/api/ev/${ev.code}/pin`, { which }));
  }

  return (
    <Shell
      wide
      color={ev.color}
      title={ev.name}
      sub={`행사 코드 ${ev.code} · ${dateRange(ev.startsOn, ev.endsOn)}${ev.place ? ` · ${ev.place}` : ""}`}
      right={
        <button
          type="button"
          className="shrink-0 rounded-lg bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25"
          onClick={async () => {
            await api(`/api/ev/${ev.code}/logout`, {});
            router.refresh();
          }}
        >
          로그아웃
        </button>
      }
    >
      {/* 현황 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="등록" value={s?.total ?? "–"} sub={s ? `사전 ${s.pre} · 현장 ${s.onsite}` : undefined} />
        <Stat label="입장" value={s?.entered ?? "–"} sub={s ? `등록 대비 ${pct(s.entered, s.total)}` : undefined} accent />
        <Stat label="지금 행사장 안" value={s?.inside ?? "–"} sub="입장 − 퇴장" />
        <Stat label="퇴장" value={s?.exited ?? "–"} sub={s ? `입장 대비 ${pct(s.exited, s.entered)}` : undefined} />
        <Stat label="설문 참여" value={s?.surveyed ?? "–"} sub={s ? `입장 대비 ${pct(s.surveyed, s.entered)}` : undefined} />
        <Stat label="평균 머문 시간" value={s?.stayMin != null ? `${s.stayMin}분` : "–"} sub="퇴장한 분 기준" />
      </div>
      <p className="mt-2 text-right text-xs text-ink-muted">10초마다 자동으로 새로 고쳐져요</p>

      <Card className="mt-4">
        <h2 className="mb-3 text-lg font-extrabold text-ink">시간대별 입장 · 퇴장</h2>
        {s && s.hourly.length ? <HourlyChart data={s.hourly} color={ev.color} /> : <p className="py-8 text-center text-sm text-ink-muted">아직 입장 기록이 없어요</p>}
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Card>
          <h2 className="text-lg font-extrabold text-ink">① 사전등록 받기</h2>
          <p className="mt-1 text-sm text-ink-muted">이 주소나 QR 을 홍보물 · 문자 · SNS 에 올려 주세요.</p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            {origin && <QrImage text={regUrl} size={150} />}
            <div className="w-full min-w-0 space-y-2">
              <p className="break-all rounded-xl bg-ink-bg px-3 py-2.5 font-mono text-sm text-ink">{regUrl || "…"}</p>
              <div className="grid grid-cols-2 gap-2">
                <EvButton
                  tone="line"
                  className="py-2.5 text-sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(regUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? "복사했어요 ✓" : "주소 복사"}
                </EvButton>
                <a href={`/host/${ev.code}/poster`} target="_blank" className="inline-flex items-center justify-center rounded-xl border-2 border-[var(--ev)] px-3 py-2.5 text-sm font-bold text-[var(--ev)]">
                  QR 포스터 인쇄
                </a>
              </div>
              <a href={regUrl} target="_blank" className="block text-center text-sm font-bold text-ink-muted underline">
                등록 페이지 미리 보기
              </a>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-extrabold text-ink">② 행사 당일 · ③ 끝난 뒤</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link href={`/host/${ev.code}/scan`} emoji="📷" title="입장 · 퇴장 스캐너" desc="입구 · 출구 기기에서 열기 (스태프 PIN)" />
            <Link href={`/host/${ev.code}/onsite`} emoji="📝" title="현장 등록" desc="사전등록 안 한 분 — 등록하면 바로 입장" />
            <Link href={`/api/ev/${ev.code}/export`} emoji="📥" title="참가자 명단 (엑셀)" desc="등록 · 입장 · 퇴장 시각 · 설문 포함 CSV" />
            <Link href={`/host/${ev.code}/report`} emoji="📊" title="결과보고서" desc="통계 · 그래프 · 만족도 — PDF 로 저장" />
            <Link href={`/host/${ev.code}/settings`} emoji="⚙️" title="행사 설정" desc="이름 · 날짜 · 등록 항목 · 설문 문항" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-line pt-4 text-sm">
            <span className="font-bold text-ink-muted">PIN 새로 발급:</span>
            <button type="button" className="font-bold text-[var(--ev)] underline" onClick={() => pin("staff")}>
              스태프 PIN
            </button>
            <button type="button" className="font-bold text-[var(--ev)] underline" onClick={() => pin("admin")}>
              관리자 PIN
            </button>
          </div>
          {newPin && (
            <p className="mt-3 rounded-xl bg-[#FFF6D1] px-4 py-3 text-sm font-bold text-[#8A6A00]">
              새 {newPin.which === "admin" ? "관리자" : "스태프"} PIN: <span className="font-mono text-xl tracking-widest">{newPin.pin}</span> (지금만 보여요)
            </p>
          )}
        </Card>
      </div>
    </Shell>
  );
}

function Link(props: { href: string; emoji: string; title: string; desc: string }) {
  return (
    <a href={props.href} className="flex items-start gap-3 rounded-xl border border-ink-line p-3.5 transition hover:border-[var(--ev)] hover:bg-ink-bg">
      <span className="text-2xl">{props.emoji}</span>
      <span>
        <span className="block font-bold text-ink">{props.title}</span>
        <span className="block text-xs text-ink-muted">{props.desc}</span>
      </span>
    </a>
  );
}
