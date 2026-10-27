// ─────────────────────────────────────────────────────────────
// 미래 명함 — 배경 제거 · 얼굴 위치 찾기 (기기 안에서 실행)
//
// Google MediaPipe 의 작은 모델 두 개를 브라우저에서 돌립니다. 사진은 서버로 가지 않습니다.
//  · 배경 제거  public/models/selfie_segmenter.tflite
//  · 얼굴 위치  public/models/blaze_face_short_range.tflite (소품을 눈 · 머리 위치에 맞춤)
// 실행 파일(wasm)은 scripts/copy-mediapipe.mjs 가 public/mediapipe 에 복사해 둡니다.
// ─────────────────────────────────────────────────────────────

import type { FaceDetector, ImageSegmenter } from "@mediapipe/tasks-vision";
import { DEFAULT_GEOM, type FaceGeom } from "./faces";

interface Models {
  segmenter: ImageSegmenter;
  detector: FaceDetector;
}

let loading: Promise<Models> | null = null;

/** 촬영 화면이 열릴 때 미리 불러 두면 찍은 직후 바로 처리됩니다. */
export function preloadVision(): Promise<Models> {
  loading ??= (async () => {
    const { FilesetResolver, FaceDetector, ImageSegmenter } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks("/mediapipe");
    const [segmenter, detector] = await Promise.all([
      ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "/models/selfie_segmenter.tflite", delegate: "CPU" },
        runningMode: "IMAGE",
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      }),
      FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "/models/blaze_face_short_range.tflite", delegate: "CPU" },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.5,
      }),
    ]);
    return { segmenter, detector };
  })();
  // 실패하면 다음 촬영 때 다시 시도
  loading.catch(() => (loading = null));
  return loading;
}

export interface PreparedPhoto {
  /** 배경을 지운(투명) 정사각형 사진 */
  photo: HTMLCanvasElement;
  geom: FaceGeom;
  /** 배경 제거 성공 여부 — 실패하면 원본 사진 그대로 */
  cutout: boolean;
  /** 얼굴을 찾았는지 — 못 찾으면 가이드 원 기준 위치 */
  faceFound: boolean;
}

export async function preparePhoto(src: HTMLCanvasElement): Promise<PreparedPhoto> {
  let models: Models;
  try {
    models = await preloadVision();
  } catch {
    return { photo: src, geom: DEFAULT_GEOM, cutout: false, faceFound: false };
  }

  const geom = detectFace(models.detector, src);
  const photo = removeBackground(models.segmenter, src);
  return { photo: photo ?? src, geom: geom ?? DEFAULT_GEOM, cutout: !!photo, faceFound: !!geom };
}

function removeBackground(segmenter: ImageSegmenter, src: HTMLCanvasElement): HTMLCanvasElement | null {
  const size = src.width;
  const result = segmenter.segment(src);
  try {
    const masks = result.confidenceMasks;
    if (!masks?.length) return null;
    // 모델에 따라 [배경, 사람] 또는 [사람] 한 장 — 사람 확률이 담긴 마지막 장을 씁니다.
    const mask = masks[masks.length - 1];
    const conf = mask.getAsFloat32Array();
    const mw = mask.width;
    const mh = mask.height;

    // 경계를 또렷하게 하되 머리카락 쪽은 살짝 부드럽게
    const alpha = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      const my = Math.min(mh - 1, Math.floor((y / size) * mh));
      for (let x = 0; x < size; x++) {
        const mx = Math.min(mw - 1, Math.floor((x / size) * mw));
        alpha[y * size + x] = smoothstep(0.35, 0.65, conf[my * mw + mx]);
      }
    }
    const soft = blurAlpha(alpha, size, 2);

    const out = document.createElement("canvas");
    out.width = out.height = size;
    const ctx = out.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(src, 0, 0);
    const img = ctx.getImageData(0, 0, size, size);
    for (let p = 0; p < soft.length; p++) img.data[p * 4 + 3] = Math.round(soft[p] * 255);
    ctx.putImageData(img, 0, 0);
    return out;
  } finally {
    result.close();
  }
}

function detectFace(detector: FaceDetector, src: HTMLCanvasElement): FaceGeom | null {
  const size = src.width;
  const face = detector.detect(src).detections[0];
  const box = face?.boundingBox;
  const kp = face?.keypoints;
  if (!box || !kp || kp.length < 4) return null;

  // 키포인트: 0·1 눈, 2 코끝, 3 입 (0~1 비율)
  const [a, b] = kp[0].x < kp[1].x ? [kp[0], kp[1]] : [kp[1], kp[0]];
  const eyeY = (a.y + b.y) / 2;
  return {
    cx: (a.x + b.x) / 2,
    eyeY,
    eyeDist: Math.hypot(b.x - a.x, b.y - a.y),
    roll: Math.atan2(b.y - a.y, b.x - a.x),
    top: box.originY / size,
    width: box.width / size,
    noseY: kp[2].y,
    mouthY: kp[3].y,
  };
}

function smoothstep(e0: number, e1: number, v: number) {
  const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function blurAlpha(src: Float32Array, size: number, r: number): Float32Array {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const win = r * 2 + 1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += src[y * size + Math.min(size - 1, Math.max(0, x + k))];
      tmp[y * size + x] = s / win;
    }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += tmp[Math.min(size - 1, Math.max(0, y + k)) * size + x];
      out[y * size + x] = s / win;
    }
  }
  return out;
}
