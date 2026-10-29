import Link from "next/link";
import { Confetti } from "@/components/kdu/confetti";
import type { FunEvent } from "@/lib/fun/config";

/** 이벤트 페이지 위쪽 띠 */
export function EventHero({ event, sub }: { event: FunEvent; sub: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-kdu-sky to-[#3EC3FE] text-white">
      <Confetti />
      <div className="wrap relative flex items-center gap-4 py-6 sm:py-8">
        <span className="text-5xl sm:text-6xl">{event.emoji}</span>
        <div>
          <h1 className="kdu-3d font-jua text-3xl sm:text-5xl">{event.name}</h1>
          <p className="mt-2 text-sm font-bold text-white/90 sm:text-base">{sub}</p>
        </div>
      </div>
    </section>
  );
}

/** 이벤트 카드 (부대행사 메인) */
export function EventTile({ event }: { event: FunEvent }) {
  return (
    <Link
      href={`/fun/${event.slug}`}
      className="kdu-card flex flex-col items-center gap-2 p-6 text-center transition hover:-translate-y-1 hover:shadow-[0_14px_0_-2px_rgba(11,42,120,0.25)]"
    >
      <span className="text-6xl">{event.emoji}</span>
      <span className="font-jua text-2xl text-kdu-navy-deep">{event.name}</span>
      <span className="text-sm font-semibold text-ink-soft break-keep">{event.desc}</span>
      <span className="mt-1 text-xs font-bold text-kdu-sky">{event.camera ? "📷 부스 태블릿" : "📱 내 폰으로도 가능"}</span>
    </Link>
  );
}

export function Title({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-6 text-center">
      <h2 className="font-jua text-3xl text-kdu-navy-deep sm:text-4xl">{children}</h2>
      {sub && <p className="mt-2 text-sm font-semibold text-ink-soft">{sub}</p>}
    </div>
  );
}

export function Spinner({ text, sub }: { text: string; sub?: string }) {
  return (
    <div className="mx-auto flex aspect-square max-w-md flex-col items-center justify-center gap-4 rounded-3xl bg-white text-center">
      <span className="h-14 w-14 animate-spin rounded-full border-[6px] border-kdu-sky/30 border-t-kdu-sky" />
      <p className="font-jua text-2xl text-kdu-navy">{text}</p>
      {sub && <p className="text-sm text-ink-muted">{sub}</p>}
    </div>
  );
}

/** 결과 화면 아래 — 처음부터 (다음 분) */
export function RestartButton({ onClick, label = "🙋 다음 분 시작하기 (처음으로)" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="fun-btn-yellow w-full py-4 text-xl">
      {label}
    </button>
  );
}

/** 칩 모양 선택지 (프레임 · 배경 · 옷 색 등) */
export function Options<T extends string>({ title, items, value, onPick }: { title: string; items: readonly { id: T; name: string }[]; value: T; onPick: (v: T) => void }) {
  return (
    <div>
      <p className="mb-2 font-jua text-xl text-kdu-navy">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <button key={it.id} type="button" onClick={() => onPick(it.id)} className={it.id === value ? "fun-chip-on" : "fun-chip-off"} aria-pressed={it.id === value}>
            {it.name}
          </button>
        ))}
      </div>
    </div>
  );
}
