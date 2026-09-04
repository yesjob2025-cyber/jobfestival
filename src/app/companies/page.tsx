import type { Metadata } from "next";
import { COMPANIES, EXPO } from "@/lib/expo";
import { CompanyExplorer } from "./company-explorer";

export const metadata: Metadata = {
  title: "참여기업",
  description: `${EXPO.title} 참여기업 목록 — 부스번호, 기업분류, 업종 안내`,
};

export default function CompaniesPage() {
  const categories = new Set(COMPANIES.map((c) => c.category));

  return (
    <>
      <section className="border-b border-ink-line bg-navy text-white">
        <div className="wrap py-12 sm:py-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sun">Companies</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">참여기업</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
            {EXPO.boothSummary} · 기업을 선택하면 상세 소개를 볼 수 있습니다.
          </p>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-white/50">참여기업</dt>
              <dd className="mt-0.5 text-xl font-black">{COMPANIES.length}개사</dd>
            </div>
            <div>
              <dt className="text-white/50">기업분류</dt>
              <dd className="mt-0.5 text-xl font-black">{categories.size}종</dd>
            </div>
            <div>
              <dt className="text-white/50">운영 시간</dt>
              <dd className="mt-0.5 text-xl font-black">{EXPO.timeLabel}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="wrap py-10 sm:py-14">
        <CompanyExplorer companies={COMPANIES} />
      </div>
    </>
  );
}
