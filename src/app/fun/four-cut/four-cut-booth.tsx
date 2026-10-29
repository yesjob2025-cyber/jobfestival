"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QrSend } from "@/components/fun/qr-send";
import { Options, RestartButton, Title } from "@/components/fun/ui";
import { countdown, snapSquare, useCamera, type Facing } from "@/components/fun/use-camera";
import { loadCardAssets } from "@/lib/fun/assets";
import { BACKS, FOUR_FILTERS, FOUR_H, FOUR_W, FRAMES, renderFourCut, type BackId, type FrameId, type Shot } from "@/lib/fun/four-cut";
import { drawStickers, STICKER_TEXT, STICKERS, hitSticker, stickerExtent, stickerThumb, type Placed } from "@/lib/fun/stickers";
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
  const [stickers, setStickers] = useState<Placed[]>([]);
  const done = shots.length === SHOTS && !shooting;

  function reset() {
    setShots([]);
    setFrame("sky");
    setBack("original");
    setFilter("natural");
    setStickers([]);
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
          stickers={stickers}
          setStickers={setStickers}
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
  stickers: Placed[];
  setStickers: (s: Placed[] | ((prev: Placed[]) => Placed[])) => void;
  onRetake: () => void;
  onReset: () => void;
}) {
  const { shots, frame, back, filter, stickers } = props;
  const [url, setUrl] = useState("");
  const cutoutsReady = shots.every((s) => s.cutout);
  const key = `${frame}-${back}-${filter}-${cutoutsReady}-${JSON.stringify(stickers)}`;

  useEffect(() => {
    let alive = true;
    // 스티커는 위에 따로 겹쳐 그리므로 바탕은 스티커 없이 (끌 때마다 네 컷을 다시 그리지 않게)
    loadCardAssets("Fun Fun 네컷" + STICKER_TEXT).then(() => {
      if (alive) setUrl(renderFourCut(shots, frame, back, filter, 0.5).toDataURL("image/jpeg", 0.85));
    });
    return () => {
      alive = false;
    };
  }, [shots, frame, back, filter]);

  const getImage = async () => {
    await loadCardAssets("Fun Fun 네컷" + STICKER_TEXT);
    return renderFourCut(shots, frame, back, filter, 1, stickers);
  };

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-8 md:grid-cols-[minmax(0,380px)_1fr]">
      <div className="md:sticky md:top-20">
        {url ? (
          <StickerBoard url={url} stickers={stickers} setStickers={props.setStickers} />
        ) : (
          <div className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-white" />
        )}
      </div>
      <div className="space-y-6">
        <StickerPicker
          onAdd={(id) =>
            props.setStickers((prev) => [
              ...prev,
              // 가운데 근처에 조금씩 흩어서
              { uid: Date.now(), id, x: 600 + ((prev.length * 137) % 400) - 200, y: 820 + ((prev.length * 211) % 500) - 250, scale: 1, rot: 0 },
            ])
          }
          count={stickers.length}
          onClear={() => props.setStickers([])}
        />
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

/** 스티커 고르기 */
function StickerPicker({ onAdd, count, onClear }: { onAdd: (id: string) => void; count: number; onClear: () => void }) {
  const [thumbs, setThumbs] = useState<{ id: string; name: string; url: string }[]>([]);
  useEffect(() => {
    loadCardAssets(STICKER_TEXT)
      .then(() => setThumbs(STICKERS.filter((s) => !s.text).map((s) => ({ id: s.id, name: s.name, url: stickerThumb(s.id) }))))
      .catch((e) => console.error("sticker thumbs:", e));
  }, []);
  return (
    <section>
      <div className="mb-2 flex items-end justify-between gap-3">
        <h3 className="font-jua text-xl text-kdu-navy">✨ 스티커 꾸미기</h3>
        {count > 0 && (
          <button type="button" onClick={onClear} className="text-sm font-bold text-kdu-pink underline">
            스티커 모두 지우기
          </button>
        )}
      </div>
      <p className="mb-3 text-sm text-ink-muted">누르면 사진에 붙어요 · 끌어서 옮기고, 두 손가락으로 크기 · 각도를 바꿔요</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {STICKERS.filter((t) => t.text).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onAdd(t.id)}
            className="rounded-full border-2 border-white px-4 py-2 font-jua text-lg shadow-md transition active:scale-95"
            style={{ background: t.text!.bg, color: t.text!.fg, outline: t.text!.bg === "#ffffff" ? "2px solid #E4457A" : undefined }}
            aria-label={`${t.name} 스티커 붙이기`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-9">
        {thumbs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onAdd(t.id)}
            className="aspect-square rounded-xl border-2 border-ink-line bg-white p-1 transition hover:border-kdu-sky active:scale-95"
            aria-label={`${t.name} 스티커 붙이기`}
            title={t.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.url} alt="" className="h-full w-full" />
          </button>
        ))}
      </div>
    </section>
  );
}

/** 미리보기 위에서 스티커 옮기기 · 크기 · 회전 · 지우기 */
function StickerBoard(props: { url: string; stickers: Placed[]; setStickers: (s: Placed[] | ((prev: Placed[]) => Placed[])) => void }) {
  const { stickers, setStickers } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sel, setSel] = useState<number | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ start: Placed; dist: number; angle: number; cx: number; cy: number } | null>(null);
  const selected = stickers.find((s) => s.uid === sel) ?? null;

  // 새로 붙인 스티커는 바로 고른 상태로
  const lastUid = stickers[stickers.length - 1]?.uid;
  useEffect(() => {
    if (lastUid) setSel(lastUid);
  }, [lastUid]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.scale(c.width / FOUR_W, c.height / FOUR_H);
    drawStickers(ctx, stickers);
    if (selected) {
      ctx.translate(selected.x, selected.y);
      ctx.rotate(selected.rot);
      const { hw, hh } = stickerExtent(selected.id);
      const w = hw * selected.scale + 14;
      const h = hh * selected.scale + 14;
      ctx.setLineDash([18, 12]);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#FFD21E";
      ctx.strokeRect(-w, -h, w * 2, h * 2);
    }
    ctx.restore();
  }, [stickers, selected]);

  const toLocal = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * FOUR_W, y: ((e.clientY - rect.top) / rect.height) * FOUR_H };
  };
  const update = (uid: number, patch: Partial<Placed>) => setStickers((prev) => prev.map((s) => (s.uid === uid ? { ...s, ...patch } : s)));
  const clampScale = (v: number) => Math.min(4, Math.max(0.3, v));

  function startGesture() {
    const target = stickers.find((s) => s.uid === sel);
    const pts = [...pointers.current.values()];
    if (!target || !pts.length) return (gesture.current = null);
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const [a, b] = pts;
    gesture.current = {
      start: target,
      cx,
      cy,
      dist: b ? Math.hypot(b.x - a.x, b.y - a.y) : 0,
      angle: b ? Math.atan2(b.y - a.y, b.x - a.x) : 0,
    };
  }

  function onDown(e: React.PointerEvent) {
    const p = toLocal(e);
    if (pointers.current.size === 0) {
      // 맨 위 스티커부터 맞았는지 확인
      const hit = [...stickers].reverse().find((s) => hitSticker(s, p.x, p.y));
      setSel(hit?.uid ?? null);
      if (!hit) return;
      pointers.current.set(e.pointerId, p);
      (e.target as Element).setPointerCapture(e.pointerId);
      gesture.current = { start: hit, cx: p.x, cy: p.y, dist: 0, angle: 0 };
      return;
    }
    if (!sel) return;
    pointers.current.set(e.pointerId, p);
    (e.target as Element).setPointerCapture(e.pointerId);
    startGesture();
  }

  function onMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, toLocal(e));
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const patch: Partial<Placed> = { x: g.start.x + cx - g.cx, y: g.start.y + cy - g.cy };
    if (pts.length >= 2 && g.dist > 0) {
      const [a, b] = pts;
      patch.scale = clampScale((g.start.scale * Math.hypot(b.x - a.x, b.y - a.y)) / g.dist);
      patch.rot = g.start.rot + Math.atan2(b.y - a.y, b.x - a.x) - g.angle;
    }
    update(g.start.uid, patch);
  }

  function onUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    // 손가락 하나가 남으면 그 자리에서 다시 끌기 시작
    if (pointers.current.size) startGesture();
    else gesture.current = null;
  }

  function onWheel(e: React.WheelEvent) {
    if (!selected) return;
    update(selected.uid, { scale: clampScale(selected.scale * (e.deltaY < 0 ? 1.08 : 1 / 1.08)) });
  }

  const btn = "fun-btn-white px-2 py-2.5 text-base disabled:opacity-40";
  return (
    <div>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={props.url} alt="네컷 사진 미리보기" className="w-full rounded-2xl shadow-2xl" />
        <canvas
          ref={canvasRef}
          width={600}
          height={900}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onWheel={onWheel}
          aria-label="스티커 꾸미기 영역"
        />
      </div>
      {stickers.length > 0 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          <button type="button" disabled={!selected} className={btn} onClick={() => selected && update(selected.uid, { scale: clampScale(selected.scale / 1.15) })}>
            ➖
          </button>
          <button type="button" disabled={!selected} className={btn} onClick={() => selected && update(selected.uid, { scale: clampScale(selected.scale * 1.15) })}>
            ➕
          </button>
          <button type="button" disabled={!selected} className={btn} onClick={() => selected && update(selected.uid, { rot: selected.rot - Math.PI / 12 })}>
            ↶ 회전
          </button>
          <button type="button" disabled={!selected} className={btn} onClick={() => selected && update(selected.uid, { rot: selected.rot + Math.PI / 12 })}>
            회전 ↷
          </button>
          <button
            type="button"
            disabled={!selected}
            className={`${btn} text-kdu-pink`}
            onClick={() => {
              if (!selected) return;
              setStickers((prev) => prev.filter((s) => s.uid !== selected.uid));
              setSel(null);
            }}
          >
            🗑️
          </button>
        </div>
      )}
      {stickers.length > 0 && <p className="mt-2 text-center text-xs text-ink-muted">스티커를 눌러 고른 뒤 버튼으로 크기 · 각도 조절, 🗑️ 로 지우기</p>}
    </div>
  );
}
