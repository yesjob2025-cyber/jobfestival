"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BOOTHS } from "@/components/fun/booths";
import { FunModeProvider, trialCount } from "@/components/fun/mode";
import { EventHero } from "@/components/fun/ui";
import { brandFun, funEvent, FUN_EVENTS } from "@/lib/fun/config";
import { SERVICE } from "@/lib/service";

/**
 * 체험판 — 부대행사마다 이 기기에서 limit 번까지. 결과가 나올 때마다 1번으로 셉니다.
 * 결과 카드에는 '잡페스티벌 체험판' 이름이 들어갑니다.
 */
export function TrialBooth({ slug, limit }: { slug: string; limit: number }) {
  const event = funEvent(slug);
  const Booth = BOOTHS[slug];
  const [used, setUsed] = useState<number | null>(null);
  // 체험 중 횟수를 넘기면 그 판은 끝까지 보게 하고, 다시 시작할 때 막습니다
  const [startedAt, setStartedAt] = useState(0);

  useEffect(() => {
    brandFun({ school: SERVICE.name, short: "JF", festival: `${SERVICE.nameEn} 체험판`, mascot: "" });
    const n = trialCount(slug);
    setUsed(n);
    setStartedAt(n);
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ slug: string; n: number }>).detail;
      if (d.slug === slug) setUsed(d.n);
    };
    window.addEventListener("jf-trial", on);
    return () => {
      brandFun(null);
      window.removeEventListener("jf-trial", on);
    };
  }, [slug]);

  if (used === null) return null;
  const left = Math.max(0, limit - used);
  const blocked = startedAt >= limit;

  return (
    <div className="min-h-screen bg-kdu-sky-pale">
      <TrialBar left={left} limit={limit} />
      <EventHero event={event} sub={event.sub} />
      {blocked ? (
        <Blocked slug={slug} limit={limit} />
      ) : (
        <FunModeProvider mode={{ kind: "trial" }}>
          <div
            // 다시 시작 버튼을 눌러 처음 화면으로 돌아왔을 때 횟수를 다시 확인
            onClickCapture={(e) => {
              const t = (e.target as HTMLElement).closest("button");
              if (t && /처음으로|다음 분|다시 하기/.test(t.textContent ?? "") && used >= limit) setStartedAt(used);
            }}
          >
            <Booth />
          </div>
        </FunModeProvider>
      )}
    </div>
  );
}

function TrialBar({ left, limit }: { left: number; limit: number }) {
  return (
    <div className="sticky top-0 z-50 border-b border-kdu-navy/10 bg-white/95 backdrop-blur">
      <div className="wrap flex min-h-12 items-center justify-between gap-3 py-2 text-sm">
        <Link href="/" className="font-extrabold text-kdu-navy">
          ← {SERVICE.name}
        </Link>
        <span className="rounded-full bg-kdu-yellow px-3 py-1 font-extrabold text-kdu-navy-deep">
          체험판 · 남은 횟수 {left}/{limit}
        </span>
        <Link href="/#contact" className="hidden font-bold text-kdu-sky underline sm:inline">
          우리 행사에 도입하기
        </Link>
      </div>
    </div>
  );
}

function Blocked({ slug, limit }: { slug: string; limit: number }) {
  const others = FUN_EVENTS.filter((e) => e.slug !== slug);
  return (
    <div className="wrap max-w-2xl py-10 text-center">
      <p className="text-6xl">🎟️</p>
      <h2 className="mt-3 font-jua text-3xl text-kdu-navy-deep">체험은 {limit}번까지예요</h2>
      <p className="mt-2 font-semibold text-ink-soft">
        마음에 드셨나요? 우리 학교 · 기관 행사에 그대로 들여올 수 있어요. 행사 이름 · 로고 · 색이 결과물에 들어가고, 참여 현황도 자동으로 집계돼요.
      </p>
      <Link href="/#contact" className="fun-btn-navy mt-6 inline-flex px-8 py-4 text-xl">
        📮 도입 문의하기
      </Link>
      <p className="mt-10 font-jua text-xl text-kdu-navy">다른 부대행사도 체험해 보세요</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {others.map((e) => (
          <Link key={e.slug} href={`/try/${e.slug}`} className="fun-chip-off">
            {e.emoji} {e.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
