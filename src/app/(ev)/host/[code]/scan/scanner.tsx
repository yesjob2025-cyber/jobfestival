"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Shell } from "@/components/ev/ui";
import type { ScanResult, Stats } from "@/lib/ev/service";
import { kst, STAGE_LABEL, tokenFromQr, type PublicEvent, type Stage } from "@/lib/ev/shared";

type Mode = "in" | "out";
type Facing = "environment" | "user";
type Shown = ScanResult & { at: number };

const MODE = {
  in: { label: "입장", color: "#1F9D55", emoji: "🟢" },
  out: { label: "퇴장", color: "#E8590C", emoji: "🟠" },
} as const;

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
      if (m === "in" || m === "out") setMode(m);
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
        const r = await api<ScanResult>(`/api/ev/${ev.code}/scan`, { kind: modeRef.current, ...by });
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

  const m = MODE[mode];
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
          <ManualSearch code={ev.code} mode={mode} onPick={(id) => submit({ id })} />
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

/** 카메라 QR 읽기 — BarcodeDetector 가 있으면 그걸, 없으면 jsQR */
function Camera({ onCode, frameColor, result }: { onCode: (t: string) => void; frameColor: string; result: Shown | null }) {
  const video = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState<Facing>("environment");
  const [error, setError] = useState("");
  const [on, setOn] = useState(true);
  const cb = useRef(onCode);
  cb.current = onCode;

  useEffect(() => {
    if (!on) return;
    let stream: MediaStream | undefined;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    setError("");

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      } catch (e) {
        setError((e as DOMException).name === "NotAllowedError" ? "카메라 권한을 허용해 주세요 (주소창 왼쪽 자물쇠 아이콘)" : "카메라를 찾을 수 없어요 — 아래 수동 찾기를 써 주세요");
        return;
      }
      if (stop) return stream.getTracks().forEach((t) => t.stop());
      const v = video.current!;
      v.srcObject = stream;
      await v.play().catch(() => {});

      type Detector = { detect: (s: CanvasImageSource) => Promise<{ rawValue: string }[]> };
      const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
      let detector: Detector | null = null;
      try {
        detector = BD ? new BD({ formats: ["qr_code"] }) : null;
      } catch {
        detector = null;
      }
      const jsQR = detector ? null : (await import("jsqr")).default;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      const tick = async () => {
        if (stop) return;
        if (v.readyState >= 2 && v.videoWidth) {
          try {
            if (detector) {
              const found = await detector.detect(v);
              if (found[0]?.rawValue) cb.current(found[0].rawValue);
            } else if (jsQR) {
              const k = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
              canvas.width = Math.round(v.videoWidth * k);
              canvas.height = Math.round(v.videoHeight * k);
              ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
              const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const found = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
              if (found?.data) cb.current(found.data);
            }
          } catch {}
        }
        timer = setTimeout(tick, 120);
      };
      tick();
    })();

    return () => {
      stop = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing, on]);

  const tone = result ? (result.ok ? (result.repeat ? "#F2B600" : "#1F9D55") : "#D6334C") : null;
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black">
        <video ref={video} playsInline muted className={`h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`} />
        {/* 조준 틀 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="aspect-square w-[55%] rounded-3xl border-[6px] border-dashed opacity-90" style={{ borderColor: frameColor }} />
        </div>
        {error && <p className="absolute inset-0 flex items-center justify-center px-8 text-center font-bold text-white">{error}</p>}
        {!on && <p className="absolute inset-0 flex items-center justify-center font-bold text-white">카메라 꺼짐</p>}
        {result && tone && (
          <div className="absolute inset-x-3 bottom-3 rounded-2xl p-4 text-white shadow-2xl" style={{ background: tone }} role="status" aria-live="assertive">
            <p className="text-2xl font-extrabold">
              {result.ok ? (result.repeat ? "⚠️ " : "✅ ") : "❌ "}
              {result.message}
            </p>
            {result.name && <p className="mt-1 text-3xl font-extrabold">{result.name}</p>}
            {result.detail && <p className="mt-1 text-base font-bold opacity-95">{result.detail}</p>}
            {result.stage && result.repeat && <p className="mt-1 text-sm opacity-90">현재 상태: {STAGE_LABEL[result.stage as Stage]}</p>}
          </div>
        )}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" className="btn-outline" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}>
          🔄 카메라 전환
        </button>
        <button type="button" className="btn-outline" onClick={() => setOn((o) => !o)}>
          {on ? "⏸ 카메라 끄기" : "▶️ 카메라 켜기"}
        </button>
      </div>
    </div>
  );
}

/** USB · 블루투스 바코드 스캐너 (키보드처럼 글자를 넣고 Enter) */
function WedgeInput({ onCode }: { onCode: (t: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form
      className="mt-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) onCode(v.trim());
        setV("");
      }}
    >
      <label className="block text-xs font-bold text-ink-muted">
        바코드 스캐너 기기를 쓰면 여기를 누른 뒤 스캔하세요
        <input className="field mt-1" value={v} onChange={(e) => setV(e.target.value)} placeholder="스캐너 입력 칸" autoComplete="off" />
      </label>
    </form>
  );
}

interface Found {
  id: string;
  name: string;
  phone4: string;
  detail: string;
  stage: Stage;
}

/** QR 이 없을 때 — 이름 또는 휴대폰 뒷자리 4개로 찾아 처리 */
function ManualSearch({ code, mode, onPick }: { code: string; mode: Mode; onPick: (id: string) => void }) {
  const [term, setTerm] = useState("");
  const [list, setList] = useState<Found[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!term.trim()) return;
    setLoading(true);
    try {
      setList(await api<Found[]>(`/api/ev/${code}/search?q=${encodeURIComponent(term.trim())}`));
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card p-4">
      <h3 className="font-extrabold text-ink">🔎 QR 이 없을 때 — 직접 찾기</h3>
      <form onSubmit={search} className="mt-2 flex gap-2">
        <input className="field" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="이름 또는 휴대폰 뒷자리 4개" aria-label="이름 또는 휴대폰 뒷자리" />
        <button type="submit" className="btn-primary shrink-0" disabled={loading}>
          찾기
        </button>
      </form>
      {list && (
        <ul className="mt-3 divide-y divide-ink-line">
          {list.length === 0 && <li className="py-3 text-center text-sm text-ink-muted">찾지 못했어요 — 현장 등록을 해 주세요</li>}
          {list.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 py-2.5">
              <span className="min-w-0">
                <b className="text-ink">{a.name}</b> <span className="text-sm text-ink-muted">· {a.phone4}</span>
                <span className="block truncate text-xs text-ink-muted">
                  {a.detail ? `${a.detail} · ` : ""}
                  {STAGE_LABEL[a.stage]}
                </span>
              </span>
              <button
                type="button"
                className="shrink-0 rounded-xl px-4 py-2 text-sm font-extrabold text-white"
                style={{ background: MODE[mode].color }}
                onClick={() => {
                  onPick(a.id);
                  setList(null);
                  setTerm("");
                }}
              >
                {MODE[mode].label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** 처리 결과 소리 (성공 · 중복 · 오류) + 진동 */
function beep(kind: "ok" | "repeat" | "bad") {
  try {
    navigator.vibrate?.(kind === "ok" ? 80 : [60, 60, 60]);
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = (beep as unknown as { ctx?: AudioContext }).ctx ?? new Ctx();
    (beep as unknown as { ctx?: AudioContext }).ctx = ctx;
    const tones = kind === "ok" ? [880, 1320] : kind === "repeat" ? [660, 660] : [220, 180];
    tones.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = kind === "bad" ? "square" : "sine";
      g.gain.value = 0.12;
      o.connect(g).connect(ctx.destination);
      const t = ctx.currentTime + i * 0.12;
      o.start(t);
      o.stop(t + 0.1);
    });
  } catch {}
}
