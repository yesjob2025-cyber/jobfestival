import Link from "next/link";
import { EXPO } from "@/lib/expo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-line/80 bg-white/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-[10px] font-black text-sun">
            KMOU
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight text-navy">
              {EXPO.titleShort}
            </span>
            <span className="block text-[10px] font-bold tracking-[0.12em] text-ocean">
              {EXPO.dateShort} · {EXPO.timeLabel}
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <Link href="/program" className="btn-outline btn-sm hidden sm:inline-flex">
            행사 프로그램
          </Link>
          <Link href="/companies" className="btn-primary btn-sm">
            참여기업
          </Link>
        </nav>
      </div>
    </header>
  );
}
