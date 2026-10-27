import type { Metadata } from "next";
import { EXPO } from "@/lib/expo";
import { futureYear, KMOU_BRAND } from "@/lib/future-card/brand";
import { FutureCardStudio } from "@/components/future-card/studio";

const FUTURE_YEAR = futureYear(KMOU_BRAND);

export const metadata: Metadata = {
  title: "미래 명함 만들기",
  description: `${EXPO.title} 부스 이벤트 — 사진을 찍고 ${FUTURE_YEAR}년, 10년 후 나의 명함을 만들어 보세요.`,
};

export default function FutureCardPage() {
  return (
    <>
      <section className="border-b border-ink-line bg-navy text-white">
        <div className="wrap py-8 sm:py-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sun">Future Card {FUTURE_YEAR}</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">10년 후 나의 명함 만들기</h1>
          <p className="mt-2 text-sm text-white/75">
            사진 촬영 → 얼굴 스타일 → 명함 내용 → 디자인 선택, 1분이면 완성!
          </p>
        </div>
      </section>
      <FutureCardStudio brand="kmou" />
    </>
  );
}
