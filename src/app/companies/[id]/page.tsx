import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COMPANIES, EXPO, getCompany, mentorsFor, sessionFor } from "@/lib/expo";

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const company = getCompany(id);
  return {
    title: company ? company.name : "참여기업",
    description: company
      ? `${company.name} · ${company.category} · ${company.industry} · 부스 ${company.boothNo}`
      : undefined,
  };
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = getCompany(id);
  if (!company) notFound();

  const index = COMPANIES.findIndex((c) => c.id === company.id);
  const prev = COMPANIES[index - 1];
  const next = COMPANIES[index + 1];
  const session = sessionFor(company);
  const mentors = mentorsFor(company);
  const sameCategory = COMPANIES.filter(
    (c) => c.category === company.category && c.id !== company.id
  ).slice(0, 4);

  return (
    <>
      <section className="border-b border-ink-line bg-navy text-white">
        <div className="wrap py-12 sm:py-14">
          <Link href="/companies" className="text-sm font-bold text-white/60 hover:text-white">
            ← 참여기업 목록
          </Link>

          <div className="mt-5 flex items-start gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-black text-sun">
              {company.boothNo.split(",")[0]}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip border-transparent bg-white/15 text-white">
                  부스 {company.boothNo}
                </span>
                <span className="chip border-transparent bg-white/15 text-white">
                  {company.category}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{company.name}</h1>
              <p className="mt-2 text-sm text-white/75">{company.industry}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap grid gap-8 py-10 lg:grid-cols-[1.7fr_1fr] sm:py-14">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-extrabold text-navy">기업 정보</h2>
            <dl className="mt-4 divide-y divide-ink-line text-sm">
              {[
                { k: "기업명", v: company.name },
                { k: "기업분류", v: company.category },
                { k: "업종", v: company.industry },
                { k: "부스번호", v: company.boothNo },
              ].map((row) => (
                <div key={row.k} className="grid grid-cols-[88px_1fr] gap-4 py-3">
                  <dt className="font-bold text-ink-muted">{row.k}</dt>
                  <dd className="font-semibold text-ink">{row.v}</dd>
                </div>
              ))}
              {company.homepage && (
                <div className="grid grid-cols-[88px_1fr] gap-4 py-3">
                  <dt className="font-bold text-ink-muted">홈페이지</dt>
                  <dd>
                    <a
                      href={company.homepage}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-ocean hover:underline"
                    >
                      {company.homepage}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {company.intro && (
            <section className="card p-6">
              <h2 className="text-lg font-extrabold text-navy">기업 소개</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {company.intro}
              </p>
            </section>
          )}

          {company.hiring && company.hiring.length > 0 && (
            <section className="card p-6">
              <h2 className="text-lg font-extrabold text-navy">모집 직무</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {company.hiring.map((h) => (
                  <li key={h} className="chip-ocean">
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!company.intro && (
            <section className="rounded-2xl border border-dashed border-ink-line bg-ink-bg p-6 text-sm text-ink-muted">
              상세 기업 소개와 모집 직무는 준비 중입니다. 행사 당일 부스{" "}
              <b className="text-navy">{company.boothNo}</b> 에서 채용 담당자와 직접 상담하실 수
              있습니다.
            </section>
          )}

          {(session || mentors.length > 0) && (
            <section className="card p-6">
              <h2 className="text-lg font-extrabold text-navy">함께 참여하는 프로그램</h2>
              <div className="mt-4 space-y-3">
                {session && (
                  <div className="rounded-xl bg-ocean-mist px-4 py-3">
                    <p className="text-xs font-bold text-ocean">채용설명회</p>
                    <p className="mt-1 text-sm font-extrabold text-navy">
                      {session.time} · 4층 라이브러리홀
                    </p>
                  </div>
                )}
                {mentors.map((m) => (
                  <div key={m.id} className="rounded-xl bg-sun/15 px-4 py-3">
                    <p className="text-xs font-bold text-[#8A6A00]">현직자 동문선배 멘토링</p>
                    <p className="mt-1 text-sm font-extrabold text-navy">
                      {m.name} 선배 · {m.position}
                    </p>
                    <p className="text-xs text-ink-muted">{m.dept}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <nav className="flex items-center justify-between gap-3">
            {prev ? (
              <Link href={`/companies/${prev.id}`} className="btn-outline btn-sm">
                ← {prev.name}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/companies/${next.id}`} className="btn-outline btn-sm">
                {next.name} →
              </Link>
            )}
          </nav>
        </div>

        <aside className="space-y-5">
          <div className="card sticky top-20 p-5">
            <p className="text-sm font-extrabold text-navy">현장 방문 안내</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">부스 위치</dt>
                <dd className="font-bold">{company.boothNo}번 부스</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">일시</dt>
                <dd className="font-bold">{EXPO.dateLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">운영 시간</dt>
                <dd className="font-bold">{EXPO.timeLabel}</dd>
              </div>
            </dl>
            <p className="mt-3 rounded-xl bg-ink-bg px-4 py-3 text-xs text-ink-muted">
              {EXPO.venue}
            </p>
            <Link href="/companies" className="btn-primary mt-4 w-full">
              다른 기업 보기
            </Link>
          </div>

          {sameCategory.length > 0 && (
            <div className="card p-5">
              <p className="text-sm font-extrabold text-navy">같은 분류 기업</p>
              <ul className="mt-3 space-y-2">
                {sameCategory.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/companies/${c.id}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-ink-line px-3 py-2.5 text-sm font-bold hover:border-ocean/50 hover:bg-ocean-mist"
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="shrink-0 text-xs text-ink-muted">{c.boothNo}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
