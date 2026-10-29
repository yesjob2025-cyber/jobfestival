"use client";

import { useState } from "react";
import { countdown, fileToSquare, snapSquare, useCamera, type Facing } from "./use-camera";

/** 촬영 화면의 가이드 모양 */
export type Guide = "face" | "bust" | "hand" | "none";

const GUIDE_TEXT: Record<Guide, string> = {
  face: "얼굴을 노란 원 안에 맞춰 주세요",
  bust: "머리부터 어깨까지 선 안에 맞춰 주세요",
  hand: "손바닥을 활짝 펴서 손 모양에 맞춰 주세요",
  none: "",
};

/**
 * 정사각형 사진 한 장을 찍는 공통 화면 — 3초 카운트다운, 카메라 전환, 사진 파일 선택.
 */
export function CameraBox(props: {
  guide: Guide;
  onCapture: (photo: HTMLCanvasElement) => void;
  size?: number;
  defaultFacing?: Facing;
  buttonLabel?: string;
  note?: string;
}) {
  const size = props.size ?? 720;
  const [facing, setFacing] = useState<Facing>(props.defaultFacing ?? "user");
  const { videoRef, ready, error } = useCamera({ facing });
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const mirrored = facing === "user";

  async function shoot() {
    if (count) return;
    await countdown(3, setCount);
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const shot = snapSquare(video, mirrored, size);
    setFlash(true);
    setTimeout(() => props.onCapture(shot), 200);
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-kdu-navy-deep">
        <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${mirrored ? "-scale-x-100" : ""}`} />
        <GuideOverlay guide={props.guide} />
        {props.guide !== "none" && (
          <p className="absolute inset-x-0 top-4 text-center text-sm font-bold text-white drop-shadow">{GUIDE_TEXT[props.guide]}</p>
        )}
        {count > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9rem] font-black text-white drop-shadow-lg">{count}</span>
          </div>
        )}
        {flash && <div className="absolute inset-0 bg-white" />}
        {!ready && !error && (
          <p className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/80">카메라를 켜는 중…</p>
        )}
        {error && (
          <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm font-bold text-white">{error}</p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
        <button type="button" onClick={shoot} disabled={!ready || count > 0} className="fun-btn-yellow py-4 text-xl disabled:opacity-50">
          {props.buttonLabel ?? "📸 촬영하기 (3초 후)"}
        </button>
        <button
          type="button"
          onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
          className="fun-btn-white px-4 py-4"
          aria-label="전면 · 후면 카메라 전환"
        >
          🔄 전환
        </button>
      </div>
      <label className="fun-btn-white mt-3 w-full cursor-pointer py-3">
        🖼️ 사진 파일 선택
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) props.onCapture(await fileToSquare(f, size));
          }}
        />
      </label>
      <p className="mt-4 text-center text-xs text-ink-muted">
        {props.note ?? "사진은 이 기기 안에서만 처리됩니다. ‘휴대폰으로 받기’를 누를 때만 결과 이미지가 서버에 3일간 보관됩니다."}
      </p>
    </div>
  );
}

/** 촬영 가이드 (얼굴 원 · 상반신 · 손바닥) — 바깥은 어둡게 */
export function GuideOverlay({ guide }: { guide: Guide }) {
  if (guide === "none") return null;
  const shape =
    guide === "face" ? (
      <ellipse cx="50" cy="50" rx="27" ry="36" />
    ) : guide === "bust" ? (
      <path d="M50 12 C 66 12 72 26 72 38 C 72 52 64 60 58 63 L 58 68 C 74 71 90 78 94 100 L 6 100 C 10 78 26 71 42 68 L 42 63 C 36 60 28 52 28 38 C 28 26 34 12 50 12 Z" />
    ) : (
      <path d="M34 92 C 24 84 18 70 16 58 C 14 50 20 47 24 52 L 30 62 L 30 24 C 30 18 38 18 38 24 L 38 50 L 40 16 C 40 9 49 9 49 16 L 49 49 L 52 18 C 52 11 61 11 61 18 L 60 51 L 65 28 C 66 21 75 22 74 29 L 70 62 C 69 76 66 86 60 92 Z" />
    );
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <mask id={`guide-${guide}`}>
          <rect width="100" height="100" fill="white" />
          <g fill="black">{shape}</g>
        </mask>
      </defs>
      <rect width="100" height="100" fill="rgba(11,42,120,0.45)" mask={`url(#guide-${guide})`} />
      <g fill="none" stroke="#FFD21E" strokeWidth="0.8" strokeDasharray="2.5 1.5">
        {shape}
      </g>
    </svg>
  );
}
