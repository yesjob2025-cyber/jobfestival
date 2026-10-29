import type { Metadata } from "next";
import { BackLink, NotFound } from "@/components/fun/receive";
import { SaveButtons } from "@/components/fun/save-buttons";
import { FUN } from "@/lib/fun/config";
import { cardImageUrl } from "@/lib/future-card/share";

export const metadata: Metadata = {
  title: "내 결과 받기",
  robots: { index: false, follow: false },
};

/** 부스 화면의 QR 을 찍으면 열리는 페이지 — 결과 이미지를 내 휴대폰에 저장 · 공유 */
export default async function ReceiveImagePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const src = cardImageUrl(id);

  return (
    <section className="wrap max-w-2xl py-10">
      {src ? (
        <>
          <p className="text-center font-fun text-lg font-bold text-kdu-sky">{FUN.festival}</p>
          <h1 className="mt-1 text-center font-jua text-3xl text-kdu-navy-deep sm:text-4xl">내 결과가 도착했어요! 🎉</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="나의 부대행사 결과" className="mt-8 w-full rounded-2xl shadow-2xl" />
          <SaveButtons src={src} filename={`${FUN.short}-fun-${id}.jpg`} type="image/jpeg" />
          <p className="mt-4 text-center text-sm text-ink-muted">
            버튼이 안 되면 이미지를 <b>길게 눌러</b> 사진에 저장하세요.
            <br />
            {FUN.keepDays}일 뒤 자동으로 지워져요.
          </p>
        </>
      ) : (
        <NotFound />
      )}
      <BackLink />
    </section>
  );
}
