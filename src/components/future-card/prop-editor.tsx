"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_PLACEMENT, type Placement } from "@/lib/future-card/faces";

const LIMIT = { move: 0.45, minScale: 0.4, maxScale: 2.6, rot: 0.9 };

function clampPlace(p: Placement): Placement {
  const c = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  return {
    dx: c(p.dx, -LIMIT.move, LIMIT.move),
    dy: c(p.dy, -LIMIT.move, LIMIT.move),
    scale: c(p.scale, LIMIT.minScale, LIMIT.maxScale),
    rot: c(p.rot, -LIMIT.rot, LIMIT.rot),
  };
}

type Pt = { x: number; y: number };

/**
 * 2단계 미리보기 — 소품을 사진 위에서 직접 맞춥니다.
 *  · 한 손가락(마우스) 끌기: 이동
 *  · 두 손가락: 크기 · 각도 (마우스 휠: 크기)
 */
export function PropEditor(props: {
  face: HTMLCanvasElement;
  place: Placement;
  onPlace: (p: Placement) => void;
  /** 소품이 있을 때만 끌기 가능 */
  editable: boolean;
  className?: string;
}) {
  const { face, place, onPlace, editable } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const placeRef = useRef(place);
  placeRef.current = place;
  const pointers = useRef(new Map<number, Pt>());
  const start = useRef<{ place: Placement; pts: Map<number, Pt> } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = face.width;
    c.height = face.height;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(face, 0, 0);
  }, [face]);

  /** 화면 좌표 → 사진 한 변 대비 비율 */
  const toUnit = (e: React.PointerEvent): Pt => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  const restart = () => {
    start.current = { place: placeRef.current, pts: new Map(pointers.current) };
  };

  function onDown(e: React.PointerEvent) {
    if (!editable) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* 일부 브라우저 · 합성 이벤트에서는 캡처가 안 돼도 그대로 진행 */
    }
    pointers.current.set(e.pointerId, toUnit(e));
    restart();
  }

  function onMove(e: React.PointerEvent) {
    if (!editable || !pointers.current.has(e.pointerId) || !start.current) return;
    pointers.current.set(e.pointerId, toUnit(e));
    const s = start.current;
    const ids = [...pointers.current.keys()].filter((id) => s.pts.has(id));
    if (ids.length === 1) {
      const a = s.pts.get(ids[0])!;
      const b = pointers.current.get(ids[0])!;
      onPlace(clampPlace({ ...s.place, dx: s.place.dx + b.x - a.x, dy: s.place.dy + b.y - a.y }));
    } else if (ids.length >= 2) {
      const [a0, a1] = [s.pts.get(ids[0])!, s.pts.get(ids[1])!];
      const [b0, b1] = [pointers.current.get(ids[0])!, pointers.current.get(ids[1])!];
      const dist = (p: Pt, q: Pt) => Math.hypot(q.x - p.x, q.y - p.y) || 1e-6;
      const ang = (p: Pt, q: Pt) => Math.atan2(q.y - p.y, q.x - p.x);
      const midA = { x: (a0.x + a1.x) / 2, y: (a0.y + a1.y) / 2 };
      const midB = { x: (b0.x + b1.x) / 2, y: (b0.y + b1.y) / 2 };
      onPlace(
        clampPlace({
          dx: s.place.dx + midB.x - midA.x,
          dy: s.place.dy + midB.y - midA.y,
          scale: s.place.scale * (dist(b0, b1) / dist(a0, a1)),
          rot: s.place.rot + ang(b0, b1) - ang(a0, a1),
        }),
      );
    }
  }

  function onUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    // 남은 손가락으로 이어서 움직여도 튀지 않도록 기준을 다시 잡습니다.
    restart();
  }

  function onWheel(e: React.WheelEvent) {
    if (!editable) return;
    const p = placeRef.current;
    onPlace(clampPlace({ ...p, scale: p.scale * (e.deltaY < 0 ? 1.06 : 1 / 1.06) }));
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onWheel={onWheel}
      aria-label="선택한 스타일 미리보기"
      role="img"
      className={`${props.className ?? ""} ${editable ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
    />
  );
}

/** 버튼으로 미세조정 */
export function PropButtons({ place, onPlace }: { place: Placement; onPlace: (p: Placement) => void }) {
  const move = (d: Partial<Placement>) =>
    onPlace(
      clampPlace({
        dx: place.dx + (d.dx ?? 0),
        dy: place.dy + (d.dy ?? 0),
        scale: place.scale * (d.scale ?? 1),
        rot: place.rot + (d.rot ?? 0),
      }),
    );
  const btn = "btn-outline btn-sm py-3 text-sm";
  const STEP = 0.015;
  return (
    <div className="grid grid-cols-4 gap-2">
      <button type="button" className={btn} onClick={() => move({ dy: -STEP })}>
        ▲ 위로
      </button>
      <button type="button" className={btn} onClick={() => move({ dy: STEP })}>
        ▼ 아래로
      </button>
      <button type="button" className={btn} onClick={() => move({ dx: -STEP })}>
        ◀ 왼쪽
      </button>
      <button type="button" className={btn} onClick={() => move({ dx: STEP })}>
        ▶ 오른쪽
      </button>
      <button type="button" className={btn} onClick={() => move({ scale: 1 / 1.06 })}>
        － 작게
      </button>
      <button type="button" className={btn} onClick={() => move({ scale: 1.06 })}>
        ＋ 크게
      </button>
      <button type="button" className={btn} onClick={() => move({ rot: -0.06 })}>
        ↺ 돌리기
      </button>
      <button type="button" className={btn} onClick={() => move({ rot: 0.06 })}>
        ↻ 돌리기
      </button>
      <button type="button" className={`${btn} col-span-4`} onClick={() => onPlace(DEFAULT_PLACEMENT)}>
        ↩︎ 처음 위치로
      </button>
    </div>
  );
}
