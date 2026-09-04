"use client";

import Link from "next/link";
import { useState } from "react";
import { EXPO } from "@/lib/expo";

/**
 * 메인 포스터.
 *  public/poster.jpg (또는 .png/.jpeg/.webp) 파일이 있으면 실제 포스터 이미지를,
 *  없으면 아래 디자인 버전을 보여줍니다. 클릭하면 참여기업 목록으로 이동합니다.
 */
const CANDIDATES = ["/poster.jpg", "/poster.png", "/poster.jpeg", "/poster.webp"];

export function PosterBoard() {
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const src = idx < CANDIDATES.length ? CANDIDATES[idx] : null;

  return (
    <Link
      href="/companies"
      aria-label="참여기업 목록 보기"
      className="group relative block overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgba(6,42,92,0.7)] ring-1 ring-navy/10 transition hover:-translate-y-1"
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${EXPO.title} 포스터`}
          className={`w-full ${loaded ? "block" : "hidden"}`}
          onLoad={() => setLoaded(true)}
          onError={() => setIdx((i) => i + 1)}
        />
      )}

      {!loaded && <PosterArt />}

      <span className="flex items-center justify-center gap-2 bg-navy-deep px-4 py-4 text-sm font-extrabold text-white">
        포스터를 클릭하면 참여기업 목록으로 이동합니다
        <span className="transition group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}

/** 실제 포스터 파일이 없을 때 표시되는 디자인 버전 */
function PosterArt() {
  return (
    <div className="relative aspect-[210/297] w-full overflow-hidden bg-gradient-to-b from-navy-deep via-navy to-ocean">
      <div className="relative z-10 flex h-full flex-col px-[6%] py-[5%] text-white">
        <div className="flex items-start justify-between text-[0.55rem] font-bold leading-tight sm:text-xs">
          <span>
            국립
            <br />
            <span className="text-[0.85em] tracking-tight">한국해양대학교</span>
          </span>
          <span className="text-right text-[0.9em] opacity-80">
            글로벌 성장큐레이션
            <br />
            ABCDE 플랫폼
          </span>
        </div>

        <div className="mt-[8%] text-center">
          <p className="text-[3.2vw] font-extrabold tracking-tight sm:text-xl">
            2026 <span className="text-sun">국립</span>한국해양대학교
          </p>
          <p className="mt-[2%] text-[13vw] font-black leading-[0.9] tracking-tighter text-sun drop-shadow-[0_4px_0_rgba(6,42,92,0.35)] sm:text-7xl">
            KMOU
          </p>
          <p className="mt-[2%] text-[9vw] font-black leading-none tracking-tight drop-shadow-[0_3px_0_rgba(6,42,92,0.35)] sm:text-5xl">
            취업박람회
          </p>

          <p className="mt-[7%] text-[4.4vw] font-extrabold sm:text-2xl">
            2026. <span className="text-sun">9. 10.</span>(목) 10:00~17:00
          </p>
          <p className="mt-[1.5%] text-[2.9vw] font-semibold text-white/85 sm:text-base">
            도서관 신관 1층 및 4층 라이브러리홀
          </p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-[2%] text-navy sm:grid-cols-4">
          {[
            { t: "부스 운영", d: "35여개 부스" },
            { t: "채용설명회", d: "4개사 진행" },
            { t: "동문 멘토링", d: "REAL 취업 노하우" },
            { t: "이벤트", d: "퍼스널컬러 외" },
          ].map((b) => (
            <div key={b.t} className="rounded-lg bg-white/95 p-[4%] text-center">
              <p className="text-[2.6vw] font-extrabold leading-tight text-ocean sm:text-sm">
                {b.t}
              </p>
              <p className="mt-1 text-[2.1vw] leading-tight text-ink-soft sm:text-xs">{b.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-[3%] text-center text-[2.1vw] font-semibold text-white/70 sm:text-xs">
          주최/주관 국립한국해양대학교 학생처 학생성장지원실
        </p>
      </div>

      <svg
        aria-hidden
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-[16%] h-[26%] w-full opacity-40"
      >
        <path d="M0 80 Q 60 30 120 70 T 260 60 T 400 80 V160 H0 Z" fill="#3E9BE0" />
        <path d="M0 110 Q 80 60 160 100 T 320 90 T 400 110 V160 H0 Z" fill="#9ED8F5" opacity="0.7" />
      </svg>
    </div>
  );
}
