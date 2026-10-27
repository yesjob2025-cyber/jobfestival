"use client";

import { useEffect, useRef, useState } from "react";
import { FACE_GUIDE, PHOTO_SIZE } from "@/lib/future-card/faces";

type Facing = "user" | "environment";

/** 1단계 — 카메라 촬영 (카메라가 없으면 사진 파일 선택) */
export function CameraCapture({ onCapture }: { onCapture: (photo: HTMLCanvasElement) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState<Facing>("user");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let cancelled = false;
    setReady(false);
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저에서는 카메라를 쓸 수 없습니다. (https 주소인지 확인해 주세요)");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        video.onloadedmetadata = () => {
          video.play().catch(() => {});
          setReady(true);
        };
      })
      .catch((e: DOMException) => {
        if (cancelled) return;
        setError(
          e.name === "NotAllowedError"
            ? "카메라 권한이 거부되었습니다. 브라우저 주소창의 카메라 권한을 허용해 주세요."
            : "카메라를 찾을 수 없습니다. 아래 ‘사진 파일 선택’을 이용해 주세요.",
        );
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const mirrored = facing === "user";

  function snap() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const m = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = PHOTO_SIZE;
    const ctx = canvas.getContext("2d")!;
    if (mirrored) {
      ctx.translate(PHOTO_SIZE, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, (video.videoWidth - m) / 2, (video.videoHeight - m) / 2, m, m, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
    setFlash(true);
    setTimeout(() => onCapture(canvas), 250);
  }

  function startCountdown() {
    if (count) return;
    let n = 3;
    setCount(n);
    const timer = setInterval(() => {
      n -= 1;
      if (n > 0) return setCount(n);
      clearInterval(timer);
      setCount(0);
      snap();
    }, 1000);
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const m = Math.min(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = PHOTO_SIZE;
      canvas
        .getContext("2d")!
        .drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
      URL.revokeObjectURL(url);
      onCapture(canvas);
    };
    img.src = url;
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-navy-deep">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-cover ${mirrored ? "-scale-x-100" : ""}`}
        />

        {/* 얼굴 가이드 원 */}
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <mask id="face-hole">
              <rect width="100" height="100" fill="white" />
              <ellipse cx={FACE_GUIDE.cx * 100} cy={FACE_GUIDE.cy * 100} rx={FACE_GUIDE.rx * 100} ry={FACE_GUIDE.ry * 100} fill="black" />
            </mask>
          </defs>
          <rect width="100" height="100" fill="rgba(6,42,92,0.45)" mask="url(#face-hole)" />
          <ellipse
            cx={FACE_GUIDE.cx * 100}
            cy={FACE_GUIDE.cy * 100}
            rx={FACE_GUIDE.rx * 100}
            ry={FACE_GUIDE.ry * 100}
            fill="none"
            stroke="#FFD200"
            strokeWidth="0.8"
            strokeDasharray="2.5 1.5"
          />
        </svg>
        <p className="absolute inset-x-0 top-4 text-center text-sm font-bold text-white drop-shadow">
          얼굴을 노란 원 안에 맞춰 주세요
        </p>

        {count > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span key={count} className="text-[9rem] font-black text-white drop-shadow-lg">
              {count}
            </span>
          </div>
        )}
        {flash && <div className="absolute inset-0 bg-white" />}

        {!ready && !error && (
          <p className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/80">
            카메라를 켜는 중…
          </p>
        )}
        {error && (
          <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm font-bold text-white">
            {error}
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
        <button type="button" onClick={startCountdown} disabled={!ready || count > 0} className="btn-sun py-4 text-lg disabled:opacity-50">
          📸 촬영하기 (3초 후)
        </button>
        <button
          type="button"
          onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
          className="btn-outline py-4"
          aria-label="전면 · 후면 카메라 전환"
        >
          🔄 카메라 전환
        </button>
      </div>

      <label className="btn-outline mt-3 w-full cursor-pointer">
        🖼️ 사진 파일 선택
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>

      <p className="mt-4 text-center text-xs text-ink-muted">
        사진은 이 기기 안에서만 처리되며 서버로 전송 · 저장되지 않습니다.
      </p>
    </div>
  );
}
