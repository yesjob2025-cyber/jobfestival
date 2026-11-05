"use client";

import { useEffect, useState } from "react";
import { shade } from "@/components/ev/ui";
import { CORNERS, FUN_EVENTS } from "@/lib/fun/config";
import { dateRange, type PublicEvent } from "@/lib/ev/shared";
import { SERVICE } from "@/lib/service";

export function EventHome({ event: ev, role }: { event: PublicEvent; role: "admin" | "staff" | null }) {
  const [ticket, setTicket] = useState<string | null>(null);
  useEffect(() => {
    try {
      setTicket(localStorage.getItem(`ev-ticket-${ev.code}`));
    } catch {}
  }, [ev.code]);

  const booths = FUN_EVENTS.filter((e) => ev.booths.includes(e.slug));
  const open = ev.status === "confirmed";
  const staff = role !== null;

  return (
    <div className="min-h-screen bg-ink-bg" style={{ ["--ev" as string]: ev.color }}>
      <header className="relative overflow-hidden text-white" style={{ background: `linear-gradient(140deg, ${ev.color}, ${shade(ev.color, -45)})` }}>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-8">
          {ev.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ev.logo} alt="" className="mb-4 h-14 w-auto rounded-xl bg-white p-1.5 shadow" />
          )}
          {ev.hostOrg && <p className="text-sm font-bold text-white/80">{ev.hostOrg}</p>}
          <h1 className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl">{ev.name}</h1>
          <p className="mt-3 font-bold text-white/90">
            📅 {dateRange(ev.startsOn, ev.endsOn)}
            {ev.place && ` · 📍 ${ev.place}`}
          </p>
        </div>
      </header>

      <main className="relative mx-auto -mt-6 max-w-3xl space-y-5 px-4 pb-12">
        {!open && (
          <p className="rounded-2xl bg-[#FFF6D1] px-4 py-3 text-center text-sm font-bold text-[#8A6A00]">
            🛠️ 행사 준비 중이에요{staff ? " — 운영자가 확정하면 부대행사가 열려요" : ""}
          </p>
        )}

        <section className="card grid gap-3 p-5 sm:grid-cols-2">
          {ticket ? (
            <a href={`/t/${ticket}`} className="flex flex-col items-center gap-1 rounded-2xl bg-[var(--ev)] p-5 text-center text-white">
              <span className="text-4xl">🎫</span>
              <span className="text-lg font-extrabold">내 입장 QR</span>
              <span className="text-xs text-white/80">입구 · 부스 · 출구에서 보여 주세요</span>
            </a>
          ) : (
            <a href={`/e/${ev.code}/register`} className="flex flex-col items-center gap-1 rounded-2xl bg-[var(--ev)] p-5 text-center text-white">
              <span className="text-4xl">📝</span>
              <span className="text-lg font-extrabold">사전등록하기</span>
              <span className="text-xs text-white/80">1분이면 끝 · 휴대폰에 입장 QR 이 생겨요</span>
            </a>
          )}
          <div className="rounded-2xl border-2 border-ink-line p-5 text-sm text-ink-soft">
            <p className="font-extrabold text-ink">이렇게 참여해요</p>
            <ol className="mt-2 space-y-1">
              <li>① 사전등록하고 입장 QR 받기</li>
              <li>② 입구에서 QR 보여 주고 입장</li>
              {booths.length > 0 && <li>③ 부대행사 부스에서 QR 스탬프{ev.stampGoal ? ` (${ev.stampGoal}개 모으면 기념품!)` : ""}</li>}
              <li>{booths.length > 0 ? "④" : "③"} 나갈 때 만족도 설문 · 퇴장 QR</li>
            </ol>
          </div>
          {ev.notice && <p className="whitespace-pre-line rounded-2xl bg-ink-bg p-4 text-sm text-ink-soft sm:col-span-2">{ev.notice}</p>}
        </section>

        {open && booths.length > 0 && (
          <section className="card p-5">
            <h2 className="text-xl font-extrabold text-ink">🎪 오늘의 부대행사</h2>
            <p className="mt-1 text-sm text-ink-muted">현장 부스에서 체험하고, 결과는 QR 로 내 휴대폰에 받아 가세요.</p>
            {CORNERS.filter((c) => booths.some((b) => b.corner === c.id)).map((c) => (
              <div key={c.id} className="mt-4">
                <p className="mb-2 text-sm font-extrabold text-ink-muted">
                  {c.emoji} {c.name}
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {booths
                    .filter((b) => b.corner === c.id)
                    .map((b) => (
                      <li key={b.slug} className="flex items-center gap-3 rounded-2xl border border-ink-line bg-white p-3">
                        <span className="text-3xl">{b.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-extrabold text-ink">{b.name}</span>
                          <span className="block text-xs text-ink-muted">{b.desc}</span>
                        </span>
                        {staff && (
                          <a href={`/e/${ev.code}/fun/${b.slug}`} className="shrink-0 rounded-xl bg-[var(--ev)] px-3 py-2 text-xs font-extrabold text-white">
                            부스 열기
                          </a>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            {staff && <p className="mt-3 text-xs text-ink-muted">‘부스 열기’는 스태프에게만 보여요. 부스 태블릿에서 눌러 띄워 두세요.</p>}
          </section>
        )}

        <footer className="pt-4 text-center text-xs text-ink-muted">
          {staff ? (
            <a href={`/host/${ev.code}`} className="font-bold underline">
              관리 화면
            </a>
          ) : (
            <a href="/login" className="underline">
              관리자
            </a>
          )}{" "}
          · Powered by <a href="/" className="font-bold">{SERVICE.name}</a>
        </footer>
      </main>
    </div>
  );
}
