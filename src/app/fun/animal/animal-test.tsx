"use client";

import { useEffect, useMemo, useState } from "react";
import { CameraBox } from "@/components/fun/camera-box";
import { QrSend } from "@/components/fun/qr-send";
import { RestartButton, Spinner, Title } from "@/components/fun/ui";
import { ANIMALS, classify, featuresOf, type Animal } from "@/lib/fun/animal";
import { decorateFace, faceBox, renderAnimalResult, type FaceBox } from "@/lib/fun/animal-draw";
import { loadCardAssets } from "@/lib/fun/assets";
import { loadFaceLandmarker, preloadVision, preparePhoto } from "@/lib/future-card/vision";

interface Result {
  face: HTMLCanvasElement;
  ranking: { animal: Animal; pct: number }[];
  box: FaceBox;
}

export function AnimalTest() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
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
        setError("얼굴을 찾지 못했어요. 정면을 보고 다시 찍어 주세요.");
        return;
      }
      const ranking = classify(featuresOf(lm));
      setResult({ face: decorateFace(prepared.photo, lm, ranking[0].animal.id), ranking, box: faceBox(lm) });
    } catch {
      setError("얼굴을 분석하지 못했어요. 인터넷 연결을 확인하고 다시 찍어 주세요.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setName("");
    window.scrollTo({ top: 0 });
  }

  if (busy) return <div className="wrap py-10"><Spinner text="얼굴을 분석하고 있어요… 🔍" sub="눈매 · 얼굴형을 재는 중" /></div>;
  if (result) return <ResultView result={result} name={name.trim()} onReset={reset} />;
  return (
    <div className="wrap py-8">
      <div className="mx-auto mb-6 max-w-xl">
        <label className="block">
          <span className="mb-1.5 block font-jua text-lg text-kdu-navy">이름 (선택)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={10} placeholder="결과 카드에 들어가요" className="field py-3 text-lg" />
        </label>
        {error && <p className="mt-3 rounded-xl bg-kdu-pink/10 px-4 py-3 font-bold text-kdu-pink">{error}</p>}
      </div>
      <CameraBox guide="face" onCapture={onCapture} />
    </div>
  );
}

function ResultView({ result, name, onReset }: { result: Result; name: string; onReset: () => void }) {
  const top = result.ranking[0].animal;
  const partner = ANIMALS[top.partner];
  const [url, setUrl] = useState("");
  const getImage = async () => {
    await loadCardAssets(Object.values(ANIMALS).map((a) => a.name + a.desc + a.keywords.join("") + a.jobs.join("")).join("") + name);
    return renderAnimalResult(result.face, result.box, result.ranking, partner, name);
  };
  const key = useMemo(() => top.id + name, [top, name]);
  useEffect(() => {
    let alive = true;
    getImage().then((c) => alive && setUrl(c.toDataURL("image/jpeg", 0.9)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, result]);

  return (
    <div className="wrap py-10">
      <Title sub={top.desc}>
        {top.emoji} {top.name} {result.ranking[0].pct}%
      </Title>
      <div className="mx-auto grid max-w-4xl items-start gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="동물상 결과 카드" className="w-full rounded-2xl shadow-2xl" />
        ) : (
          <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-white" />
        )}
        <div className="space-y-4">
          <QrSend kind="image" getImage={getImage} resetKey={key} />
          <RestartButton onClick={onReset} />
          <p className="text-center text-xs text-ink-muted">얼굴 비율만 재서 재미로 보는 결과예요. 사진은 이 기기에서만 처리돼요.</p>
        </div>
      </div>
    </div>
  );
}
