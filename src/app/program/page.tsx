import type { Metadata } from "next";
import Link from "next/link";
import { COMPANIES, EVENTS, EXPO, MENTORS, SESSIONS } from "@/lib/expo";

export const metadata: Metadata = {
  title: "행사 프로그램",
  description: `${EXPO.title} 채용설명회 · 현직자 동문선배 멘토링 · 부대 이벤트 안내`,
};

export default function ProgramPage() {
  const companyByName = new Map(COMPANIES.map((c) => [c.name.replace(/\s/g, ""), c]));
  const findCompany = (name: string) => companyByName.get(name.replace(/\s/g, ""));

  return (
    <>
      <section className="border-b border-ink-line bg-navy text-white">
        <div className="wrap py-12 sm:py-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sun">Program</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">행사 프로그램</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
            {EXPO.dateLabel} {EXPO.timeLabel} · {EXPO.venue}
          </p>
        </div>
      </section>

      <div className="wrap space-y-14 py-12 sm:py-16">
        <section>
          <p className="label">Session</p>
          <h2 className="h-section mt-2">채용설명회</h2>
          <p className="mt-2 text-sm text-ink-muted">4층 라이브러리홀 · 기업별 50분 진행</p>

          <ol className="mt-6 space-y-2">
            {SESSIONS.map((s) => {
              const company = findCompany(s.company);
              const row = (
                <>
                  <span className="w-32 shrink-0 text-sm font-black text-ocean">{s.time}</span>
                  <span className="flex-1 text-base font-extrabold text-navy">{s.company}</span>
                  {company && <span className="chip shrink-0">부스 {company.boothNo}</span>}
                </>
              );
              return (
                <li key={s.time}>
                  {company ? (
                    <Link
                      href={`/companies/${company.id}`}
                      className="card-link flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="card flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4">
                      {row}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section>
          <p className="label">Mentoring</p>
          <h2 className="h-section mt-2">현직자 동문선배 멘토링</h2>
          <p className="mt-2 text-sm text-ink-muted">
            다양한 직무의 동문 선배가 전하는 REAL 취업 노하우
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MENTORS.map((m) => (
              <li key={m.id} className="card p-5">
                <p className="text-base font-extrabold text-navy">{m.name}</p>
                <p className="mt-1 text-sm font-bold text-ocean">{m.company}</p>
                <p className="mt-2 text-xs text-ink-muted">
                  {m.position} · {m.dept}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="label">Event</p>
          <h2 className="h-section mt-2">부대 이벤트</h2>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {EVENTS.map((e) => (
              <li key={e.name} className="card p-5">
                <p className="text-base font-extrabold text-navy">{e.name}</p>
                <p className="mt-2 text-sm text-ink-soft">{e.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6 text-center sm:p-10">
          <h2 className="text-2xl font-black text-navy">참여기업을 미리 확인하세요</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {EXPO.boothSummary} — 관심 기업의 부스번호를 미리 확인하면 동선이 편해집니다.
          </p>
          <Link href="/companies" className="btn-primary mt-6">
            참여기업 {COMPANIES.length}개사 보기
          </Link>
        </section>
      </div>
    </>
  );
}
