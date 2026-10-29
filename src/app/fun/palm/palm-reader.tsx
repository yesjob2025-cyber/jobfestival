"use client";

import { useEffect, useMemo, useState } from "react";
import { CameraBox } from "@/components/fun/camera-box";
import { QrSend } from "@/components/fun/qr-send";
import { RestartButton, Spinner, Title } from "@/components/fun/ui";
import { loadCardAssets } from "@/lib/fun/assets";
import { HAND_TYPES, LINE_COLORS, LINE_TEXT, readPalm, TRAITS, type Reading } from "@/lib/fun/palm";
import { drawPalm, renderPalmResult } from "@/lib/fun/palm-draw";
import { loadHandLandmarker } from "@/lib/future-card/vision";

interface Scan {
  plain: string;
  lined: HTMLCanvasElement;
  reading: Reading;
}

export function PalmReader() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState<Scan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHandLandmarker().catch(() => {});
  }, []);

  async function onCapture(photo: HTMLCanvasElement) {
    setBusy(true);
    setError("");
    try {
      const hl = await loadHandLandmarker();
      const lm = hl.detect(photo).landmarks[0];
      if (!lm) {
        setError("손을 찾지 못했어요. 손바닥을 활짝 펴서 화면 가운데에 비춰 주세요.");
        return;
      }
      const reading = readPalm(lm);
      setScan({ plain: drawPalm(photo, lm, reading, false).toDataURL("image/jpeg", 0.9), lined: drawPalm(photo, lm, reading), reading });
    } catch {
      setError("손을 분석하지 못했어요. 인터넷 연결을 확인하고 다시 찍어 주세요.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setScan(null);
    setName("");
    window.scrollTo({ top: 0 });
  }

  if (busy) return <div className="wrap py-10"><Spinner text="손을 찾고 있어요… ✋" sub="처음 한 번은 몇 초 걸릴 수 있어요" /></div>;
  if (scan) return <Result scan={scan} name={name.trim()} onReset={reset} />;
  return (
    <div className="wrap py-8">
      <div className="mx-auto mb-6 max-w-xl">
        <label className="block">
          <span className="mb-1.5 block font-jua text-lg text-kdu-navy">이름 (선택)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={10} placeholder="결과 카드에 들어가요" className="field py-3 text-lg" />
        </label>
        {error && <p className="mt-3 rounded-xl bg-kdu-pink/10 px-4 py-3 font-bold text-kdu-pink">{error}</p>}
      </div>
      <CameraBox guide="hand" onCapture={onCapture} buttonLabel="✋ 손금 찍기 (3초 후)" />
    </div>
  );
}

function Result({ scan, name, onReset }: { scan: Scan; name: string; onReset: () => void }) {
  const t = HAND_TYPES[scan.reading.type];
  const lined = useMemo(() => scan.lined.toDataURL("image/jpeg", 0.9), [scan]);
  const [scanned, setScanned] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setScanned(true), 2600);
    return () => clearTimeout(timer);
  }, []);

  const getImage = async () => {
    await loadCardAssets(Object.values(HAND_TYPES).map((h) => h.name + h.nick + h.desc + h.jobs.join("")).join("") + JSON.stringify(LINE_TEXT) + JSON.stringify(TRAITS) + name);
    return renderPalmResult(scan.lined, scan.reading, name);
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

  return (
    <div className="wrap py-10">
      <Title sub={scanned ? t.desc : "손금을 읽고 있어요…"}>{scanned ? `${t.emoji} ${t.name} · ${t.nick}` : "🔍 손금 스캔 중"}</Title>
      <div className="mx-auto grid max-w-4xl items-start gap-6 md:grid-cols-[minmax(0,380px)_1fr]">
        <div>
          {/* 스캔 연출: 손금이 아래에서 위로 그려지며 빛줄기가 지나감 */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-kdu-navy-deep shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={scan.plain} alt="" className="absolute inset-0 h-full w-full" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lined} alt="손금이 그려진 손" className="absolute inset-0 h-full w-full animate-[palm-reveal_2.4s_ease-out_forwards]" />
            {!scanned && <div className="absolute inset-x-0 h-16 animate-[palm-beam_2.4s_ease-out_forwards] bg-gradient-to-b from-transparent via-kdu-yellow/60 to-transparent" />}
          </div>
          {scanned && (
            <ul className="mt-4 space-y-2">
              {(Object.keys(LINE_TEXT) as (keyof typeof LINE_TEXT)[]).map((id) => (
                <li key={id} className="flex items-start gap-2 text-[15px] font-semibold text-ink">
                  <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: LINE_COLORS[id] }} />
                  <span>
                    <b className="font-jua text-lg font-normal text-kdu-navy">{LINE_TEXT[id].name}</b> {LINE_TEXT[id].text[scan.reading.lines[id] - 1]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {scanned && (
          <div className="space-y-4">
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="취업 손금 결과 카드" className="mx-auto w-full max-w-sm rounded-2xl shadow-xl" />
            ) : (
              <div className="mx-auto aspect-[4/5] w-full max-w-sm animate-pulse rounded-2xl bg-white" />
            )}
            <QrSend kind="image" getImage={getImage} resetKey={scan.reading.type + name} />
            <RestartButton onClick={onReset} />
          </div>
        )}
      </div>
    </div>
  );
}
