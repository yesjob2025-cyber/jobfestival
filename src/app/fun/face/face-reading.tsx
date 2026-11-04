"use client";

import { useEffect, useMemo, useState } from "react";
import { CameraBox } from "@/components/fun/camera-box";
import { QrSend } from "@/components/fun/qr-send";
import { RestartButton, Spinner, Title } from "@/components/fun/ui";
import { loadCardAssets } from "@/lib/fun/assets";
import { LUCKS, measureFace, PEAK, readFace, TYPES, type LuckId, type Reading } from "@/lib/fun/face-reading";
import { chartFace, renderFaceResult } from "@/lib/fun/face-reading-draw";
import { loadFaceLandmarker, preloadVision, preparePhoto } from "@/lib/future-card/vision";

interface Scan {
  plain: string;
  chart: HTMLCanvasElement;
  reading: Reading;
}

export function FaceReading() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState<Scan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    preloadVision().catch(() => {});
    loadFaceLandmarker().catch(() => {});
  }, []);

  async function onCapture(photo: HTMLCanvasElement) {
    setBusy(true);
    setError("");
    try {
      const [prepared, landmarker] = await Promise.all([preparePhoto(photo), loadFaceLandmarker()]);
      const lm = landmarker.detect(photo).faceLandmarks[0];
      if (!lm) {
        setError("얼굴을 찾지 못했어요. 정면을 보고 앞머리를 살짝 넘긴 뒤 다시 찍어 주세요.");
        return;
      }
      const reading = readFace(measureFace(lm));
      setScan({ plain: chartFace(prepared.photo, lm, false).toDataURL("image/jpeg", 0.9), chart: chartFace(prepared.photo, lm), reading });
    } catch {
      setError("얼굴을 분석하지 못했어요. 인터넷 연결을 확인하고 다시 찍어 주세요.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setScan(null);
    setName("");
    window.scrollTo({ top: 0 });
  }

  if (busy) return <div className="wrap py-10"><Spinner text="관상을 보고 있어요… 🧿" sub="이마 · 눈 · 코 · 입 · 턱을 재는 중" /></div>;
  if (scan) return <Result scan={scan} name={name.trim()} onReset={reset} />;
  return (
    <div className="wrap py-8">
      <div className="mx-auto mb-6 max-w-xl">
        <label className="block">
          <span className="mb-1.5 block font-jua text-lg text-kdu-navy">이름 (선택)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={10} placeholder="결과 카드에 들어가요" className="field py-3 text-lg" />
        </label>
        <p className="mt-3 rounded-xl bg-white/80 px-4 py-3 text-sm font-semibold text-ink-soft">
          💡 정면을 보고, 이마가 보이게 앞머리를 살짝 넘기면 더 정확해요. 웃는 얼굴도 OK!
        </p>
        {error && <p className="mt-3 rounded-xl bg-kdu-pink/10 px-4 py-3 font-bold text-kdu-pink">{error}</p>}
      </div>
      <CameraBox guide="face" onCapture={onCapture} buttonLabel="🧿 관상 보기 (3초 후)" />
    </div>
  );
}

function Result({ scan, name, onReset }: { scan: Scan; name: string; onReset: () => void }) {
  const r = scan.reading;
  const t = TYPES[r.type];
  const chart = useMemo(() => scan.chart.toDataURL("image/jpeg", 0.9), [scan]);
  const [scanned, setScanned] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setScanned(true), 2600);
    return () => clearTimeout(timer);
  }, []);

  const getImage = async () => {
    await loadCardAssets(
      Object.values(TYPES).map((x) => x.name + x.desc + x.jobs.join("")).join("") +
        r.parts.map((p) => p.part + p.shape + p.text).join("") +
        Object.values(PEAK).map((p) => p.name + p.age).join("") +
        "취업운점전성기관상★☆" + name,
    );
    return renderFaceResult(scan.chart, r, name);
  };
  useEffect(() => {
    if (!scanned) return;
    let alive = true;
    getImage().then((c) => alive && setUrl(c.toDataURL("image/jpeg", 0.9)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanned, name]);

  const peak = PEAK[r.peak];
  return (
    <div className="wrap py-10">
      <Title sub={scanned ? t.desc : "삼정 · 부위 7곳을 재고 있어요…"}>{scanned ? `${t.emoji} ${t.name}` : "🔍 관상 스캔 중"}</Title>
      <div className="mx-auto grid max-w-5xl items-start gap-6 md:grid-cols-[minmax(0,420px)_1fr]">
        <div className="md:sticky md:top-20">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-kdu-navy-deep shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={scan.plain} alt="" className="absolute inset-0 h-full w-full" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={chart} alt="관상도가 그려진 얼굴" className="absolute inset-0 h-full w-full animate-[face-reveal_2.4s_ease-out_forwards]" />
            {!scanned && <div className="absolute inset-x-0 h-16 animate-[face-beam_2.4s_ease-out_forwards] bg-gradient-to-b from-transparent via-kdu-yellow/60 to-transparent" />}
          </div>
          {scanned && (
            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="font-jua text-xl text-kdu-navy">⏳ 삼정으로 본 전성기 — {peak.age} {peak.name}</p>
              <p className="mt-1 text-sm font-semibold text-ink-soft break-keep">{peak.text}</p>
              <div className="mt-3 flex h-8 overflow-hidden rounded-full text-xs font-extrabold text-white">
                {(["upper", "middle", "lower"] as const).map((k, i) => (
                  <span
                    key={k}
                    className="flex items-center justify-center"
                    style={{ width: `${r.thirds[k] * 100}%`, background: k === r.peak ? "#F08C00" : ["#5B8FD6", "#3E6FC0", "#2A55A8"][i] }}
                  >
                    {["상정 · 초년", "중정 · 중년", "하정 · 말년"][i]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {scanned && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-white p-4">
              <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full text-white" style={{ background: t.color }}>
                <span className="font-fun text-3xl font-bold">{r.score}</span>
                <span className="text-xs font-bold">취업운</span>
              </div>
              <div>
                <p className="font-jua text-xl text-kdu-navy">어울리는 직무</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {t.jobs.map((j) => (
                    <span key={j} className="rounded-full bg-kdu-sky-pale px-3 py-1 text-sm font-bold text-kdu-navy-deep">
                      💼 {j}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <ul className="space-y-2.5">
              {r.parts.map((p, i) => (
                <li
                  key={p.id}
                  className="animate-[fade-up_0.5s_ease-out_both] rounded-2xl border-l-8 bg-white p-4 shadow-sm"
                  style={{ borderColor: TYPES[p.luck].color, animationDelay: `${i * 0.12}s` }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-jua text-xl text-kdu-navy-deep">
                      {p.part} <span className="text-sm text-ink-muted">· {p.term}({p.hanja})</span>
                    </p>
                    <span className="text-sm font-bold text-[#F5B800]">
                      {"★".repeat(p.stars)}
                      {"☆".repeat(5 - p.stars)} <span className="text-xs text-ink-muted">{LUCKS[p.luck].name}</span>
                    </span>
                  </div>
                  <p className="mt-1 font-extrabold text-ink">{p.shape}</p>
                  <p className="text-[15px] text-ink-soft break-keep">{p.text}</p>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl bg-white p-4">
              <p className="mb-2 font-jua text-xl text-kdu-navy">📊 나의 직장운</p>
              <ul className="space-y-1.5">
                {(Object.keys(LUCKS) as LuckId[]).map((k) => (
                  <li key={k} className="grid grid-cols-[110px_1fr_40px] items-center gap-2 text-sm font-bold">
                    <span>
                      {LUCKS[k].emoji} {LUCKS[k].name}
                    </span>
                    <span className="h-3 overflow-hidden rounded-full bg-kdu-sky-pale">
                      <span className="block h-full rounded-full" style={{ width: `${r.lucks[k]}%`, background: TYPES[k].color }} />
                    </span>
                    <span className="text-right tabular-nums">{r.lucks[k]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="취업 관상 결과 카드" className="mx-auto w-full max-w-sm rounded-2xl shadow-xl" />
            ) : (
              <div className="mx-auto aspect-[4/5] w-full max-w-sm animate-pulse rounded-2xl bg-white" />
            )}
            <QrSend kind="image" getImage={getImage} resetKey={r.type + name} />
            <RestartButton onClick={onReset} />
            <p className="text-center text-xs text-ink-muted">얼굴 비율만 재서 재미로 보는 관상이에요. 사진은 이 기기에서만 처리돼요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
