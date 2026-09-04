import Link from "next/link";
import { PosterBoard } from "@/components/poster-board";
import { COMPANIES, EVENTS, EXPO, MENTORS, SESSIONS } from "@/lib/expo";
import { findPoster } from "@/lib/poster";

export default function HomePage() {
  const poster = findPoster();

  return (
    <>
      {/* 포스터 */}
      <section className="bg-ink-bg py-10 sm:py-14">
        <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,460px)_1fr]">
          <PosterBoard poster={poster} />

          <div>
            <p className="label">{EXPO.year} Job Fair</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-navy sm:text-4xl">
              {EXPO.title}
            </h1>

            <dl className="mt-7 space-y-3 text-sm sm:text-base">
              <div className="flex gap-4">
                <dt className="w-14 shrink-0 font-bold text-ink-muted">일시</dt>
                <dd className="font-bold text-ink">
                  {EXPO.dateLabel} <span className="text-ocean">{EXPO.timeLabel}</span>
                </dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-14 shrink-0 font-bold text-ink-muted">장소</dt>
                <dd className="font-bold text-ink">{EXPO.venue}</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-14 shrink-0 font-bold text-ink-muted">주최</dt>
                <dd className="font-bold text-ink">{EXPO.host}</dd>
              </div>
            </dl>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { label: "참여기업", value: `${COMPANIES.length}개사` },
                { label: "채용설명회", value: `${SESSIONS.length}개사` },
                { label: "동문 멘토", value: `${MENTORS.length}명` },
              ].map((s) => (
                <div key={s.label} className="card px-4 py-3.5 text-center">
                  <p className="text-xs text-ink-muted">{s.label}</p>
                  <p className="mt-1 text-xl font-black text-navy">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/companies" className="btn-primary">
                참여기업 목록 보기
              </Link>
              <Link href="/program" className="btn-outline">
                행사 프로그램
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 프로그램 요약 */}
      <section className="wrap py-14 sm:py-20">
        <p className="label">Program</p>
        <h2 className="h-section mt-2">하루 동안 이렇게 진행됩니다</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/companies" className="card-link p-6">
            <span className="chip-ocean">부스 운영</span>
            <h3 className="mt-3 text-lg font-extrabold text-navy">{EXPO.boothSummary}</h3>
            <p className="mt-2 text-sm text-ink-soft">
              공기업·공공기관부터 대기업·중견·중소기업까지, 관심 기업 부스에서 채용 상담을 받을 수
              있습니다.
            </p>
            <p className="mt-4 text-sm font-bold text-ocean">참여기업 {COMPANIES.length}개사 보기 →</p>
          </Link>

          <Link href="/program" className="card-link p-6">
            <span className="chip-ocean">채용설명회</span>
            <h3 className="mt-3 text-lg font-extrabold text-navy">
              주요 기업 {SESSIONS.length}개사 현장 설명회
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
              {SESSIONS.map((s) => (
                <li key={s.time}>
                  <span className="font-bold text-navy">{s.time}</span> · {s.company}
                </li>
              ))}
            </ul>
          </Link>

          <Link href="/program" className="card-link p-6">
            <span className="chip-ocean">현직자 동문선배 멘토링</span>
            <h3 className="mt-3 text-lg font-extrabold text-navy">
              다양한 직무 동문 선배가 전하는 REAL 취업 노하우
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              {MENTORS.slice(0, 4)
                .map((m) => m.company)
                .join(" · ")}{" "}
              등 {MENTORS.length}명의 선배가 함께합니다.
            </p>
          </Link>

          <div className="card p-6">
            <span className="chip-sun">이벤트</span>
            <h3 className="mt-3 text-lg font-extrabold text-navy">참여만 해도 즐거운 부대 이벤트</h3>
            <ul className="mt-3 grid gap-1.5 text-sm text-ink-soft sm:grid-cols-2">
              {EVENTS.map((e) => (
                <li key={e.name}>· {e.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 참여기업 미리보기 */}
      <section className="border-t border-ink-line bg-ink-bg py-14 sm:py-20">
        <div className="wrap">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="label">Companies</p>
              <h2 className="h-section mt-2">이런 기업이 함께합니다</h2>
            </div>
            <Link href="/companies" className="btn-outline btn-sm shrink-0">
              전체보기
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANIES.slice(0, 9).map((c) => (
              <Link key={c.id} href={`/companies/${c.id}`} className="card-link flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-xs font-black text-sun">
                  {c.boothNo.split(",")[0]}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold text-navy">{c.name}</span>
                  <span className="block truncate text-xs text-ink-muted">
                    {c.category} · {c.industry}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
