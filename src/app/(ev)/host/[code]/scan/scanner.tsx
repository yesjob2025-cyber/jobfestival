"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Shell } from "@/components/ev/ui";
import { beep, Camera, ManualSearch, WedgeInput, type Shown } from "@/components/ev/qr-camera";
import type { ScanResult, Stats } from "@/lib/ev/service";
import { FUN_EVENTS } from "@/lib/fun/config";
import { kst, STAGE_LABEL, tokenFromQr, type PublicEvent, type Stage } from "@/lib/ev/shared";

/** in · out · stamp:{부스 slug} */
type Mode = string;

const MODE: Record<string, { label: string; color: string; emoji: string }> = {
  in: { label: "입장", color: "#1F9D55", emoji: "🟢" },
  out: { label: "퇴장", color: "#E8590C", emoji: "🟠" },
};

function modeInfo(m: Mode) {
  if (MODE[m]) return MODE[m];
  const e = FUN_EVENTS.find((x) => `stamp:${x.slug}` === m);
  return e ? { label: `${e.name} 스탬프`, color: "#7A3FD0", emoji: e.emoji } : MODE.in;
}

/**
 * 입장 · 퇴장 스캐너 — 카메라로 티켓 QR 을 읽거나(휴대폰 · 태블릿 · 노트북),
 * USB 바코드 스캐너(키보드처럼 입력)로 읽거나, 이름 · 번호 뒷자리로 찾아 처리합니다.
 */
export function Scanner({ event: ev, role }: { event: PublicEvent; role: "admin" | "staff" }) {
  const router = useRouter();
  const [mode, setModeState] = useState<Mode>("in");
  const [shown, setShown] = useState<Shown | null>(null);
  const [log, setLog] = useState<Shown[]>([]);
  const [counts, setCounts] = useState<Stats | null>(null);
  const busy = useRef(false);
  const last = useRef<{ token: string; at: number } | null>(null);
  const modeRef = useRef<Mode>("in");

  useEffect(() => {
    try {
      const m = localStorage.getItem(`ev-scan-mode-${ev.code}`);
      if (m === "in" || m === "out" || (m?.startsWith("stamp:") && ev.booths.includes(m.slice(6)))) setMode(m);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev.code]);

  function setMode(m: Mode) {
    modeRef.current = m;
    setModeState(m);
    last.current = null;
    try {
      localStorage.setItem(`ev-scan-mode-${ev.code}`, m);
    } catch {}
  }

  const loadCounts = useCallback(() => api<Stats>(`/api/ev/${ev.code}/stats`).then(setCounts).catch(() => {}), [ev.code]);
  useEffect(() => {
    loadCounts();
    const t = setInterval(loadCounts, 15_000);
    return () => clearInterval(t);
  }, [loadCounts]);

  const submit = useCallback(
    async (by: { token?: string; id?: string }) => {
      if (busy.current) return;
      busy.current = true;
      try {
        const m = modeRef.current;
        const body = m.startsWith("stamp:") ? { kind: "stamp", booth: m.slice(6), ...by } : { kind: m, ...by };
        const r = await api<ScanResult>(`/api/ev/${ev.code}/scan`, body);
        show(r);
        loadCounts();
      } catch (e) {
        show({ ok: false, message: e instanceof Error ? e.message : "처리하지 못했어요" });
      } finally {
        busy.current = false;
      }
    },
    [ev.code, loadCounts],
  );

  function show(r: ScanResult) {
    const s = { ...r, at: Date.now() };
    setShown(s);
    setLog((l) => [s, ...l].slice(0, 12));
    beep(r.ok && !r.repeat ? "ok" : r.ok ? "repeat" : "bad");
  }

  // 결과 카드는 3초 뒤 사라짐
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShown((s) => (s === shown ? null : s)), 3000);
    return () => clearTimeout(t);
  }, [shown]);

  /** QR · 바코드 글자 하나 들어옴 (같은 티켓은 4초 안에 다시 처리하지 않음) */
  const onCode = useCallback(
    (text: string) => {
      const token = tokenFromQr(text);
      if (!token) return show({ ok: false, message: "행사 티켓 QR 이 아니에요" });
      const now = Date.now();
      if (last.current && last.current.token === token && now - last.current.at < 4000) return;
      last.current = { token, at: now };
      submit({ token });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [submit],
  );

  const m = modeInfo(mode);
  return (
    <Shell
      wide
      color={ev.color}
      title={`${m.emoji} ${m.label} 스캐너`}
      sub={ev.name}
      right={
        <div className="flex shrink-0 gap-2">
          {role === "admin" && (
            <a href={`/host/${ev.code}`} className="rounded-lg bg-white/15 px-3 py-2 text-sm font-bold">
              관리
            </a>
          )}
          <button
            type="button"
            className="rounded-lg bg-white/15 px-3 py-2 text-sm font-bold"
            onClick={async () => {
              await api(`/api/ev/${ev.code}/logout`, {});
              router.refresh();
            }}
          >
            로그아웃
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {(["in", "out"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setMode(k)}
            className={`rounded-2xl border-4 py-4 text-xl font-extrabold transition ${mode === k ? "text-white" : "border-ink-line bg-white text-ink-muted"}`}
            style={mode === k ? { background: MODE[k].color, borderColor: MODE[k].color } : undefined}
            aria-pressed={mode === k}
          >
            {MODE[k].emoji} {MODE[k].label} 처리
          </button>
        ))}
      </div>

      {ev.booths.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="self-center text-xs font-bold text-ink-muted">부스 스탬프:</span>
          {ev.booths.map((b) => {
            const k = `stamp:${b}`;
            const info = modeInfo(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => setMode(k)}
                aria-pressed={mode === k}
                className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold ${mode === k ? "border-[#7A3FD0] bg-[#7A3FD0] text-white" : "border-ink-line bg-white text-ink-soft"}`}
              >
                {info.emoji} {FUN_EVENTS.find((e) => e.slug === b)?.name}
              </button>
            );
          })}
        </div>
      )}

      {counts && (
        <p className="mt-3 rounded-xl bg-white px-4 py-2.5 text-center text-sm font-bold text-ink-soft">
          등록 {counts.total} · 입장 {counts.entered} · <span className="text-ink">지금 안 {counts.inside}</span> · 퇴장 {counts.exited} · 설문 {counts.surveyed}
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <Camera onCode={onCode} frameColor={m.color} result={shown} />
          <WedgeInput onCode={onCode} />
        </div>
        <div className="space-y-4">
          <ManualSearch code={ev.code} label={m.label} color={m.color} onPick={(id) => submit({ id })} />
          <section className="card p-4">
            <h3 className="mb-2 font-extrabold text-ink">최근 처리 (이 기기)</h3>
            {log.length ? (
              <ul className="divide-y divide-ink-line text-sm">
                {log.map((r) => (
                  <li key={r.at} className="flex items-center justify-between gap-2 py-2">
                    <span className="min-w-0 truncate">
                      <span className="mr-1.5">{r.ok ? (r.repeat ? "🟡" : "✅") : "❌"}</span>
                      <b>{r.name ?? ""}</b> <span className="text-ink-muted">{r.message}</span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-ink-muted">{kst(new Date(r.at), { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-center text-sm text-ink-muted">아직 없어요</p>
            )}
          </section>
          <a href={`/host/${ev.code}/onsite`} className="block rounded-2xl border-2 border-dashed border-ink-line bg-white p-4 text-center font-bold text-ink-soft hover:border-[var(--ev)]">
            📝 사전등록 안 한 분 → 현장 등록
          </a>
        </div>
      </div>
    </Shell>
  );
}
