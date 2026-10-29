"use client";

import { useEffect, useRef, useState } from "react";

export type Facing = "user" | "environment";

/** 카메라(+마이크) 스트림을 video 요소에 연결합니다. 화면을 떠나면 끕니다. */
/** hd: 손금처럼 잔주름이 중요할 때 더 큰 해상도로 */
export function useCamera({ facing, audio = false, hd = false }: { facing: Facing; audio?: boolean; hd?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let current: MediaStream | undefined;
    let cancelled = false;
    setReady(false);
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저에서는 카메라를 쓸 수 없습니다. (https 주소인지 확인해 주세요)");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing, width: { ideal: hd ? 1920 : 1280 }, height: { ideal: hd ? 1440 : 960 } }, audio })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        current = s;
        setStream(s);
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        const markReady = () => {
          video.play().catch(() => {});
          setReady(true);
        };
        if (video.readyState >= 1) markReady();
        else video.onloadedmetadata = markReady;
      })
      .catch((e: DOMException) => {
        if (cancelled) return;
        setError(
          e.name === "NotAllowedError"
            ? `${audio ? "카메라 · 마이크" : "카메라"} 권한이 거부되었습니다. 주소창의 권한을 허용해 주세요.`
            : "카메라를 찾을 수 없습니다.",
        );
      });

    return () => {
      cancelled = true;
      current?.getTracks().forEach((t) => t.stop());
      setStream(null);
    };
  }, [facing, audio, hd]);

  return { videoRef, stream, ready, error };
}

/** 영상 가운데를 정사각형으로 잘라 size×size 캔버스로 (전면 카메라는 거울처럼 뒤집음) */
export function snapSquare(video: HTMLVideoElement, mirrored: boolean, size: number): HTMLCanvasElement {
  const m = Math.min(video.videoWidth, video.videoHeight);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  if (mirrored) {
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, (video.videoWidth - m) / 2, (video.videoHeight - m) / 2, m, m, 0, 0, size, size);
  return canvas;
}

/**
 * 사진 파일 → 정사각형 캔버스.
 * cover: 가운데를 잘라 채움 (기본), contain: 자르지 않고 흰 여백 (스캔한 A4 처럼 길쭉한 이미지)
 */
export function fileToSquare(file: File, size: number, fit: "cover" | "contain" = "cover"): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      if (fit === "contain") {
        const k = size / Math.max(img.naturalWidth, img.naturalHeight);
        const w = img.naturalWidth * k;
        const h = img.naturalHeight * k;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      } else {
        const m = Math.min(img.naturalWidth, img.naturalHeight);
        ctx.drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, size, size);
      }
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** 3 · 2 · 1 카운트다운 후 콜백 */
export function countdown(seconds: number, onTick: (n: number) => void): Promise<void> {
  return new Promise((resolve) => {
    let n = seconds;
    onTick(n);
    const timer = setInterval(() => {
      n -= 1;
      onTick(n);
      if (n <= 0) {
        clearInterval(timer);
        resolve();
      }
    }, 1000);
  });
}
