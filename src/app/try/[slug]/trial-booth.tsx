"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BOOTHS } from "@/components/fun/booths";
import { FunModeProvider } from "@/components/fun/mode";
import { EventHero } from "@/components/fun/ui";
import { brandFun, funEvent } from "@/lib/fun/config";
import { SERVICE } from "@/lib/service";

/**
 * 체험판 — 횟수 제한 없이 해 볼 수 있어요.
 * 결과 카드에는 '잡페스티벌 체험판' 이름이 들어갑니다.
 */
export function TrialBooth({ slug }: { slug: string }) {
  const event = funEvent(slug);
  const Booth = BOOTHS[slug];
  const [ready, setReady] = useState(false);

  useEffect(() => {
    brandFun({ school: SERVICE.name, short: "JF", festival: `${SERVICE.nameEn} 체험판`, mascot: "" });
    setReady(true);
    return () => brandFun(null);
  }, [slug]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-kdu-sky-pale">
      <TrialBar />
      <EventHero event={event} sub={event.sub} />
      <FunModeProvider mode={{ kind: "trial" }}>
        <Booth />
      </FunModeProvider>
    </div>
  );
}

function TrialBar() {
  return (
    <div className="sticky top-0 z-50 border-b border-kdu-navy/10 bg-white/95 backdrop-blur">
      <div className="wrap flex min-h-12 items-center justify-between gap-3 py-2 text-sm">
        <Link href="/" className="font-extrabold text-kdu-navy">
          ← {SERVICE.name}
        </Link>
        <span className="rounded-full bg-kdu-yellow px-3 py-1 font-extrabold text-kdu-navy-deep">체험판</span>
        <Link href="/#contact" className="hidden font-bold text-kdu-sky underline sm:inline">
          우리 행사에 도입하기
        </Link>
      </div>
    </div>
  );
}
