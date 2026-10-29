"use client";

import { useEffect, useMemo, useState } from "react";
import { QrSend } from "@/components/fun/qr-send";
import { RestartButton, Title } from "@/components/fun/ui";
import { countdown, snapSquare, useCamera, type Facing } from "@/components/fun/use-camera";
import { loadCardAssets } from "@/lib/fun/assets";
import { BACKS, FOUR_FILTERS, FRAMES, renderFourCut, type BackId, type FrameId, type Shot } from "@/lib/fun/four-cut";
import type { FilterId } from "@/lib/future-card/faces";
import { preloadVision, preparePhoto } from "@/lib/future-card/vision";

const SHOTS = 4;
const WAIT = 5;

export function FourCutBooth() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [shooting, setShooting] = useState(false);
  const [frame, setFrame] = useState<FrameId>("sky");
  const [back, setBack] = useState<BackId>("original");
  const [filter, setFilter] = useState<FilterId>("natural");
  const [session, setSession] = useState(0);
  const done = shots.length === SHOTS && !shooting;

  function reset() {
    setShots([]);
    setFrame("sky");
    setBack("original");
    setFilter("natural");
    setSession((n) => n + 1);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="wrap py-8">
      {!done ? (
        <Shooter
          key={session}
          shots={shots}
          shooting={shooting}
          setShooting={setShooting}
          onShot={(s) => setShots((prev) => [...prev, s])}
          onCutout={(i, c) => setShots((prev) => prev.map((s, k) => (k === i ? { ...s, cutout: c } : s)))}
        />
      ) : (
        <Editor
          shots={shots}
          frame={frame}
          back={back}
          filter={filter}
          setFrame={setFrame}
          setBack={setBack}
          setFilter={setFilter}
          onRetake={() => setShots([])}
          onReset={reset}
        />
      )}
    </div>
  );
}

function Shooter(props: {
  shots: Shot[];
  shooting: boolean;
  setShooting: (b: boolean) => void;
  onShot: (s: Shot) => void;
  onCutout: (i: number, c: HTMLCanvasElement | null) => void;
}) {
  const [facing, setFacing] = useState<Facing>("user");
  const { videoRef, ready, error } = useCamera({ facing });
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    preloadVision().catch(() => {});
  }, []);

  async function run() {
    props.setShooting(true);
    for (let i = 0; i < SHOTS; i++) {
      await countdown(WAIT, setCount);
      const video = videoRef.current;
      if (!video?.videoWidth) break;
      const original = snapSquare(video, facing === "user", 720);
      setFlash(true);
      setTimeout(() => setFlash(false), 180);
      props.onShot({ original, cutout: null });
      // 배경 제거는 다음 컷을 찍는 동안 뒤에서
      preparePhoto(original).then((p) => props.onCutout(i, p.cutout ? p.photo : null));
    }
    props.setShooting(false);
  }

  return (
    <div className="mx-auto max-w-xl">
      <Title sub={props.shooting ? `${props.shots.length + 1}번째 컷 — 포즈를 바꿔 보세요!` : "버튼을 누르면 5초마다 한 컷씩 네 번 찍혀요"}>
        {props.shooting ? `📸 ${Math.min(props.shots.length + 1, SHOTS)} / ${SHOTS}` : "네 컷을 찍어요!"}
      </Title>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-kdu-navy-deep">
        <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${facing === "user" ? "-scale-x-100" : ""}`} />
        {count > 0 && props.shooting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9rem] font-black text-white drop-shadow-lg">{count}</span>
          </div>
        )}
        {flash && <div className="absolute inset-0 bg-white" />}
        {!ready && !error && <p className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/80">카메라를 켜는 중…</p>}
        {error && <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm font-bold text-white">{error}</p>}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: SHOTS }, (_, i) => (
          <div key={i} className="aspect-square overflow-hidden rounded-xl border-2 border-dashed border-kdu-navy/30 bg-white">
            {props.shots[i] && <ShotThumb canvas={props.shots[i].original} />}
          </div>
        ))}
      </div>

      {!props.shooting && (
        <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
          <button type="button" onClick={run} disabled={!ready} className="fun-btn-yellow py-5 text-2xl disabled:opacity-50">
            📸 네컷 촬영 시작
          </button>
          <button type="button" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))} className="fun-btn-white px-4 py-4">
            🔄 전환
          </button>
        </div>
      )}
    </div>
  );
}

function ShotThumb({ canvas }: { canvas: HTMLCanvasElement }) {
  const url = useMemo(() => canvas.toDataURL("image/jpeg", 0.7), [canvas]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-full w-full object-cover" />;
}

function Editor(props: {
  shots: Shot[];
  frame: FrameId;
  back: BackId;
  filter: FilterId;
  setFrame: (f: FrameId) => void;
  setBack: (b: BackId) => void;
  setFilter: (f: FilterId) => void;
  onRetake: () => void;
  onReset: () => void;
}) {
  const { shots, frame, back, filter } = props;
  const [url, setUrl] = useState("");
  const cutoutsReady = shots.every((s) => s.cutout);
  const key = `${frame}-${back}-${filter}-${cutoutsReady}`;

  useEffect(() => {
    let alive = true;
    loadCardAssets("Fun Fun 네컷").then(() => {
      if (alive) setUrl(renderFourCut(shots, frame, back, filter, 0.5).toDataURL("image/jpeg", 0.85));
    });
    return () => {
      alive = false;
    };
  }, [shots, frame, back, filter]);

  const getImage = async () => {
    await loadCardAssets("Fun Fun 네컷");
    return renderFourCut(shots, frame, back, filter, 1);
  };

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-8 md:grid-cols-[minmax(0,380px)_1fr]">
      <div>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="네컷 사진 미리보기" className="w-full rounded-2xl shadow-2xl" />
        ) : (
          <div className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-white" />
        )}
      </div>
      <div className="space-y-6">
        <Options title="🖼️ 프레임" items={FRAMES} value={frame} onPick={(v) => props.setFrame(v as FrameId)} />
        <Options title="🌈 배경" items={BACKS} value={back} onPick={(v) => props.setBack(v as BackId)} />
        {back !== "original" && !cutoutsReady && <p className="text-sm font-bold text-kdu-sky">배경을 지우는 중이에요… 잠시만요!</p>}
        <Options title="🎨 필터" items={FOUR_FILTERS} value={filter} onPick={(v) => props.setFilter(v as FilterId)} />
        <QrSend kind="image" getImage={getImage} resetKey={key} />
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={props.onRetake} className="fun-btn-white py-4 text-xl">
            📸 다시 찍기
          </button>
          <RestartButton onClick={props.onReset} label="🙋 다음 분 (처음으로)" />
        </div>
      </div>
    </div>
  );
}

function Options<T extends string>({ title, items, value, onPick }: { title: string; items: readonly { id: T; name: string }[]; value: T; onPick: (v: T) => void }) {
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
