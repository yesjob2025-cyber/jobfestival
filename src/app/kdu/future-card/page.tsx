import type { Metadata } from "next";
import { Confetti } from "@/components/kdu/confetti";
import { FutureCardStudio } from "@/components/future-card/studio";
import { futureYear, KDU_BRAND } from "@/lib/future-card/brand";

export const metadata: Metadata = {
  title: "미래 명함 만들기",
  description: `경동대 Fun Fun Job Festival 이벤트관 — 사진을 찍고 ${futureYear(KDU_BRAND)}년, 10년 후 나의 명함을 만들어 보세요.`,
};

export default function KduFutureCardPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-r from-kdu-sky to-[#3EC3FE] text-white">
        <Confetti />
        <div className="wrap relative flex items-center justify-between gap-4 py-6 sm:py-8">
          <div>
            <p className="inline-flex rounded-full bg-kdu-navy px-4 py-1 font-jua text-sm text-kdu-yellow sm:text-base">
              Fun Fun Job Festival · 이벤트관
            </p>
            <h1 className="kdu-3d mt-3 font-jua text-3xl sm:text-5xl">10년 후 나의 명함 만들기</h1>
            <p className="mt-3 text-sm font-bold text-white/90 sm:text-base">
              사진 촬영 → 얼굴 스타일 → 명함 내용 → 디자인 선택, 1분이면 완성!
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kdu/lion.webp" alt="" className="hidden w-28 shrink-0 drop-shadow-lg sm:block lg:w-36" />
        </div>
      </section>
      <FutureCardStudio brand="kdu" />
    </div>
  );
}
