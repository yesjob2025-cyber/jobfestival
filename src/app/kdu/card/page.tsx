import type { Metadata } from "next";
import Link from "next/link";
import { cardImageUrl } from "@/lib/future-card/share";
import { SaveButtons } from "./save-buttons";

export const metadata: Metadata = {
  title: "내 미래 명함 받기",
  robots: { index: false, follow: false },
};

/** 부스 화면의 QR 을 찍으면 열리는 페이지 — 내 휴대폰에 명함 저장 · 공유 */
export default async function ReceiveCardPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const src = cardImageUrl(id);

  return (
    <section className="wrap max-w-2xl py-10">
      {src ? (
        <>
          <p className="text-center font-jua text-lg text-kdu-sky">Fun Fun Job Festival</p>
          <h1 className="mt-1 text-center font-jua text-3xl text-kdu-navy-deep sm:text-4xl">10년 후 나의 명함이 도착했어요! 🎉</h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="나의 미래 명함" className="mt-8 w-full rounded-2xl shadow-2xl" />
          <SaveButtons src={src} />
          <p className="mt-4 text-center text-sm text-ink-muted">
            버튼이 안 되면 명함 이미지를 <b>길게 눌러</b> 사진에 저장하세요.
            <br />
            명함 이미지는 3일 뒤 자동으로 지워져요.
          </p>
        </>
      ) : (
        <div className="kdu-card p-8 text-center">
          <p className="font-jua text-2xl text-kdu-navy-deep">명함을 찾을 수 없어요 😢</p>
          <p className="mt-2 text-sm text-ink-muted">QR 코드를 다시 찍거나, 3일이 지나 지워졌는지 확인해 주세요.</p>
        </div>
      )}
      <div className="mt-8 text-center">
        <Link href="/kdu" className="font-jua text-lg text-kdu-navy underline underline-offset-4">
          Fun Fun Job Festival 안내 보기 →
        </Link>
      </div>
    </section>
  );
}
