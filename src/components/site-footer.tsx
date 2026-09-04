import Link from "next/link";
import { EXPO } from "@/lib/expo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink-line bg-navy-deep text-white/75">
      <div className="wrap grid gap-8 py-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-lg font-extrabold text-white">{EXPO.title}</p>
          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 font-bold text-white/50">일시</dt>
              <dd>
                {EXPO.dateLabel} {EXPO.timeLabel}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 font-bold text-white/50">장소</dt>
              <dd>{EXPO.venue}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-12 shrink-0 font-bold text-white/50">주최</dt>
              <dd>{EXPO.host}</dd>
            </div>
          </dl>
        </div>

        <div>
          <p className="text-sm font-extrabold text-white">바로가기</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/companies" className="hover:text-white">
                참여기업 목록
              </Link>
            </li>
            <li>
              <Link href="/program" className="hover:text-white">
                행사 프로그램
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-xs font-bold text-white/50">후원 / 협찬</p>
          <p className="mt-1.5 text-xs leading-relaxed">{EXPO.sponsors.join(" · ")}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap py-5 text-xs text-white/45">
          © {EXPO.title} · {EXPO.platform}
        </div>
      </div>
    </footer>
  );
}
