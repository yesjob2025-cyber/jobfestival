import type { Metadata } from "next";
import Link from "next/link";
import { FUN } from "@/lib/fun/config";

export const metadata: Metadata = {
  title: {
    default: `부대행사 | ${FUN.festival}`,
    template: `%s | ${FUN.festival} 부대행사`,
  },
  description: `${FUN.school} ${FUN.festival} 부대행사 — 미래 명함, 취업 타로, 손금, 네컷 사진, 이력서 사진, 1분 자기소개, 동물상, 직무 유형 테스트`,
};

/** 부대행사 공통 머리글 · 바닥글 (경동대 포스터 스타일) */
export default function FunLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Gaegu:wght@700&family=Jua&display=swap"
      />
      <div className="flex min-h-screen flex-col bg-kdu-sky-pale">
        <header className="sticky top-0 z-50 border-b border-kdu-navy/10 bg-white/90 backdrop-blur">
          <div className="wrap flex min-h-14 items-center gap-2.5 py-2">
            <Link href="/fun" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-kdu-navy font-fun text-xs font-bold text-kdu-yellow">
                {FUN.short}
              </span>
              <span className="font-fun text-[15px] font-bold text-kdu-navy sm:text-lg">
                {FUN.festival} <span className="font-jua font-normal text-kdu-sky">부대행사</span>
              </span>
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-kdu-navy-deep py-6 text-center text-xs text-white/70">
          {FUN.school} · {FUN.festival} {FUN.year}
        </footer>
      </div>
    </>
  );
}
