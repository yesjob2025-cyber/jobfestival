import type { Metadata } from "next";
import Link from "next/link";
import { KDU_EXPO } from "@/lib/kdu";

export const metadata: Metadata = {
  title: {
    default: KDU_EXPO.title,
    template: `%s | 경동대 Fun Fun Job Festival`,
  },
  description: `${KDU_EXPO.catchphrase} ${KDU_EXPO.dateLabel} ${KDU_EXPO.timeLabel} · ${KDU_EXPO.venue}. 기업채용관 · 이벤트관 · 미래 명함 만들기.`,
  openGraph: {
    title: KDU_EXPO.title,
    description: `${KDU_EXPO.dateLabel} ${KDU_EXPO.timeLabel} · ${KDU_EXPO.venue}`,
    siteName: "경동대학교 Fun Fun Job Festival",
    images: ["/kdu/poster.jpg"],
    locale: "ko_KR",
    type: "website",
  },
};

/** 경동대 Fun Fun Job Festival 페이지 공통 머리글 · 바닥글 */
export default function KduLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Gaegu:wght@700&family=Jua&display=swap"
      />
      <div className="flex min-h-screen flex-col bg-kdu-sky-pale">
        <KduHeader />
        <main className="flex-1">{children}</main>
        <KduFooter />
      </div>
    </>
  );
}

function KduHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-kdu-navy/10 bg-white/90 backdrop-blur">
      <div className="wrap flex min-h-16 items-center justify-between gap-3 py-2.5">
        <Link href="/kdu" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kdu-navy font-fun text-sm font-bold text-kdu-yellow">
            KDU
          </span>
          <span className="leading-tight">
            <span className="block font-fun text-[15px] font-bold text-kdu-navy sm:text-lg">Fun Fun Job Festival</span>
            <span className="hidden text-[11px] font-bold text-kdu-sky sm:block">
              {KDU_EXPO.school} · 10.28 WED · {KDU_EXPO.timeLabel}
            </span>
          </span>
        </Link>
        <Link
          href="/kdu/future-card"
          className="btn btn-sm shrink-0 bg-kdu-yellow px-4 py-2.5 text-sm text-kdu-navy-deep shadow-[0_3px_0_#0B2A78] hover:bg-sun-deep"
        >
          📸 미래 명함<span className="hidden sm:inline"> 만들기</span>
        </Link>
      </div>
    </header>
  );
}

function KduFooter() {
  return (
    <footer className="bg-kdu-navy-deep text-white">
      <div className="wrap flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="font-hand text-2xl leading-snug sm:text-3xl">
          <p className="text-white/90">{KDU_EXPO.closing[0]}</p>
          <p className="mt-1">
            <span className="text-kdu-yellow">경동대</span>에서 당신의 미래를{" "}
            <span className="text-kdu-yellow">Fun Fun</span>하게!
          </p>
        </div>
        <div className="sm:text-right">
          <p className="font-jua text-3xl">{KDU_EXPO.school}</p>
          <p className="text-xs font-bold tracking-wider text-white/70">{KDU_EXPO.schoolEn}</p>
          <p className="mt-1 text-sm text-white/80">{KDU_EXPO.hostUnit}</p>
        </div>
      </div>
    </footer>
  );
}
