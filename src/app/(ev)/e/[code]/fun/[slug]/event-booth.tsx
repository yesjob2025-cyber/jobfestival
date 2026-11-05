"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BOOTHS } from "@/components/fun/booths";
import { FunFonts } from "@/components/fun/fun-fonts";
import { FunModeProvider } from "@/components/fun/mode";
import { EventHero } from "@/components/fun/ui";
import { beep, Camera, ManualSearch, type Shown } from "@/components/ev/qr-camera";
import { api } from "@/components/ev/ui";
import type { ScanResult } from "@/lib/ev/service";
import { themeVars, tokenFromQr, type PublicEvent } from "@/lib/ev/shared";
import { brandFun, funEvent } from "@/lib/fun/config";

/**
 * 행사 부스 태블릿 — 결과 카드 · 영상에 행사 이름 · 로고가 들어가고, 결과가 나올 때마다 체험 수가 기록됩니다.
 * 위쪽 ‘스탬프’ 버튼으로 참가자 입장 QR 을 찍어 이 부스 스탬프를 줍니다.
 */
export function EventBooth({ event: ev, slug }: { event: PublicEvent; slug: string }) {
  const booth = funEvent(slug);
  const Booth = BOOTHS[slug];
  const [ready, setReady] = useState(false);
  const [stampOpen, setStampOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    brandFun({
      school: ev.hostOrg || ev.name,
      short: ev.short || ev.name.slice(0, 4),
      festival: ev.name,
      year: Number(ev.startsOn.slice(0, 4)),
      mascot: ev.logo,
    });
    setReady(true);
    return () => brandFun(null);
  }, [ev]);

  return (
    <div className="min-h-screen bg-kdu-sky-pale" style={themeVars(ev.color) as React.CSSProperties}>
      <FunFonts />
      <div className="sticky top-0 z-50 border-b border-kdu-navy/10 bg-white/95 backdrop-blur">
        <div className="wrap flex min-h-14 items-center gap-3 py-2">
          <a href={`/e/${ev.code}`} className="flex min-w-0 flex-1 items-center gap-2">
            {ev.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ev.logo} alt="" className="h-9 w-auto rounded-lg" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-kdu-navy text-xs font-bold text-white">{(ev.short || ev.name).slice(0, 3)}</span>
            )}
            <span className="truncate font-jua text-lg text-kdu-navy">{ev.name}</span>
          </a>
          <button type="button" onClick={() => setStampOpen(true)} className="shrink-0 rounded-xl bg-kdu-navy px-4 py-2.5 font-extrabold text-white shadow">
            🎫 스탬프{count ? ` ${count}` : ""}
          </button>
        </div>
      </div>
      <EventHero event={booth} sub={booth.sub} />
      {ready && (
        <FunModeProvider mode={{ kind: "event", code: ev.code }}>
          <Booth />
        </FunModeProvider>
      )}
      {stampOpen && <StampModal ev={ev} slug={slug} onClose={() => setStampOpen(false)} onStamped={() => setCount((n) => n + 1)} />}
    </div>
  );
}

function StampModal({ ev, slug, onClose, onStamped }: { ev: PublicEvent; slug: string; onClose: () => void; onStamped: () => void }) {
  const booth = funEvent(slug);
  const [shown, setShown] = useState<Shown | null>(null);
  const busy = useRef(false);
  const last = useRef<{ token: string; at: number } | null>(null);

  const submit = useCallback(
    async (by: { token?: string; id?: string }) => {
      if (busy.current) return;
      busy.current = true;
      try {
        const r = await api<ScanResult>(`/api/ev/${ev.code}/scan`, { kind: "stamp", booth: slug, ...by });
        setShown({ ...r, at: Date.now() });
        beep(r.ok && !r.repeat ? "ok" : r.ok ? "repeat" : "bad");
        if (r.ok && !r.repeat) onStamped();
      } catch (e) {
        setShown({ ok: false, message: e instanceof Error ? e.message : "처리하지 못했어요", at: Date.now() });
        beep("bad");
      } finally {
        busy.current = false;
      }
    },
    [ev.code, slug, onStamped],
  );

  const onCode = useCallback(
    (text: string) => {
      const token = tokenFromQr(text);
      if (!token) return;
      const now = Date.now();
      if (last.current && last.current.token === token && now - last.current.at < 4000) return;
      last.current = { token, at: now };
      submit({ token });
    },
    [submit],
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal aria-label="스탬프 찍기">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5" style={{ ["--ev" as string]: ev.color }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-jua text-2xl text-kdu-navy-deep">
            {booth.emoji} {booth.name} 스탬프
          </h2>
          <button type="button" onClick={onClose} className="rounded-xl bg-ink-bg px-4 py-2 font-bold text-ink">
            닫기
          </button>
        </div>
        <p className="mb-3 text-sm text-ink-muted">참가자 휴대폰의 입장 QR 을 카메라에 비춰 주세요.</p>
        <Camera onCode={onCode} frameColor="#7A3FD0" result={shown} />
        <div className="mt-3">
          <ManualSearch code={ev.code} label="스탬프" color="#7A3FD0" onPick={(id) => submit({ id })} />
        </div>
      </div>
    </div>
  );
}
