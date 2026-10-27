// ─────────────────────────────────────────────────────────────
// 미래 명함 — 얼굴 스타일 10종
//
// AI 없이 브라우저 캔버스 픽셀 연산만으로 처리합니다. 사진은 기기 밖으로 나가지 않습니다.
// 입력은 정사각형 사진(촬영 화면의 얼굴 가이드 원에 맞춰 찍은 것)이며,
// 액세서리(선글라스 · 선장 모자)는 가이드 원 기준 위치에 그립니다.
// ─────────────────────────────────────────────────────────────

export const PHOTO_SIZE = 720;

/** 촬영 화면의 얼굴 가이드 원 (정사각형 사진 기준 비율) */
export const FACE_GUIDE = { cx: 0.5, cy: 0.5, rx: 0.27, ry: 0.36 } as const;

/** 액세서리 위치 미세조정 — dy: 사진 높이 대비 이동, scale: 크기 배율 */
export interface Placement {
  dy: number;
  scale: number;
}

export const DEFAULT_PLACEMENT: Placement = { dy: 0, scale: 1 };

export const FACE_STYLES = [
  { id: "natural", name: "내추럴", desc: "화사하게 보정한 프로필" },
  { id: "mono", name: "흑백 프로필", desc: "사진관 느낌의 흑백" },
  { id: "film", name: "빈티지 필름", desc: "따뜻한 필름 카메라 감성" },
  { id: "webtoon", name: "웹툰", desc: "선명한 외곽선의 만화풍" },
  { id: "sketch", name: "연필 스케치", desc: "손으로 그린 듯한 드로잉" },
  { id: "pop", name: "팝아트", desc: "블루 · 옐로 포스터" },
  { id: "ocean", name: "오션 듀오톤", desc: "네이비 · 오션블루 톤" },
  { id: "pixel", name: "8비트 픽셀", desc: "레트로 게임 캐릭터" },
  { id: "ceo", name: "CEO 선글라스", desc: "성공한 10년 후의 여유", accessory: true },
  { id: "captain", name: "캡틴 모자", desc: "모자를 쓴 멋진 캡틴", accessory: true },
] as const satisfies readonly { id: string; name: string; desc: string; accessory?: boolean }[];

export type FaceStyleId = (typeof FACE_STYLES)[number]["id"];

export function hasAccessory(id: FaceStyleId): boolean {
  return FACE_STYLES.some((s) => s.id === id && "accessory" in s);
}

/** 정사각형 원본 사진에 스타일을 입혀 size×size 캔버스로 돌려줍니다. */
export function renderFace(
  src: HTMLCanvasElement,
  styleId: FaceStyleId,
  size: number,
  place: Placement = DEFAULT_PLACEMENT,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0, size, size);
  STYLES[styleId](ctx, size, place);
  return canvas;
}

type Ctx = CanvasRenderingContext2D;
type RGB = readonly [number, number, number];

const NAVY_DEEP: RGB = [6, 42, 92];
const NAVY: RGB = [11, 58, 121];
const OCEAN: RGB = [27, 111, 196];
const OCEAN_MIST: RGB = [220, 238, 251];
const SUN: RGB = [255, 210, 0];
const WHITE: RGB = [255, 255, 255];

const STYLES: Record<FaceStyleId, (ctx: Ctx, size: number, place: Placement) => void> = {
  natural(ctx, size) {
    pixels(ctx, size, (d) => tone(d, { brightness: 8, contrast: 1.05, saturation: 1.12, warmth: 4 }));
  },

  mono(ctx, size) {
    pixels(ctx, size, (d) => {
      const g = normalize(grayOf(d), 0.01);
      writeGray(d, g, (v) => clamp((v - 128) * 1.15 + 128));
    });
    vignette(ctx, size, 0.45);
  },

  film(ctx, size) {
    pixels(ctx, size, (d) => {
      tone(d, { brightness: 4, contrast: 0.95, saturation: 0.85, warmth: 10 });
      sepia(d, 0.45);
      for (let i = 0; i < d.length; i += 4) {
        // 검은색을 살짝 띄워 바랜 느낌
        d[i] = 18 + d[i] * 0.9;
        d[i + 1] = 14 + d[i + 1] * 0.9;
        d[i + 2] = 10 + d[i + 2] * 0.88;
      }
      grain(d, 22);
    });
    vignette(ctx, size, 0.5);
  },

  webtoon(ctx, size) {
    pixels(ctx, size, (d) => {
      const edges = sobel(boxBlur(grayOf(d), size, 1), size);
      tone(d, { brightness: 10, contrast: 1.1, saturation: 1.35, warmth: 0 });
      const step = 255 / 4;
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const e = clamp01((edges[p] - 70) / 70);
        for (let c = 0; c < 3; c++) {
          const flat = Math.round(d[i + c] / step) * step;
          d[i + c] = flat * (1 - e) + 28 * e;
        }
      }
    });
  },

  sketch(ctx, size) {
    pixels(ctx, size, (d) => {
      const g = normalize(grayOf(d), 0.01);
      const inv = g.map((v) => 255 - v);
      const blurred = boxBlur(inv, size, Math.max(2, Math.round(size / 90)), 2);
      // 컬러 닷지 — 연필 스케치의 기본 기법
      writeGray(d, g, (v, p) => {
        const dodge = Math.min(255, (v * 255) / (256 - blurred[p]));
        return clamp(255 - (255 - dodge) * 1.4);
      });
      grain(d, 10);
    });
  },

  pop(ctx, size) {
    pixels(ctx, size, (d) => {
      const g = normalize(boxBlur(grayOf(d), size, 1), 0.02);
      const bands: RGB[] = [NAVY_DEEP, OCEAN, SUN, WHITE];
      const cuts = [64, 122, 190];
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const b = cuts.findIndex((c) => g[p] < c);
        const [r, gg, bb] = bands[b === -1 ? 3 : b];
        d[i] = r;
        d[i + 1] = gg;
        d[i + 2] = bb;
      }
    });
  },

  ocean(ctx, size) {
    pixels(ctx, size, (d) => {
      const g = normalize(grayOf(d), 0.01);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const t = g[p] / 255;
        const [r, gg, b] =
          t < 0.5 ? mix(NAVY_DEEP, OCEAN, t / 0.5) : mix(OCEAN, OCEAN_MIST, (t - 0.5) / 0.5);
        d[i] = r;
        d[i + 1] = gg;
        d[i + 2] = b;
      }
    });
  },

  pixel(ctx, size) {
    const blocks = 48;
    const small = document.createElement("canvas");
    small.width = small.height = blocks;
    const sctx = small.getContext("2d", { willReadFrequently: true })!;
    sctx.drawImage(ctx.canvas, 0, 0, blocks, blocks);
    pixels(sctx, blocks, (d) => {
      tone(d, { brightness: 6, contrast: 1.15, saturation: 1.3, warmth: 0 });
      const step = 255 / 5;
      for (let i = 0; i < d.length; i += 4) {
        for (let c = 0; c < 3; c++) d[i + c] = Math.round(d[i + c] / step) * step;
      }
    });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
  },

  ceo(ctx, size, place) {
    STYLES.natural(ctx, size, place);
    drawSunglasses(ctx, size, place);
  },

  captain(ctx, size, place) {
    STYLES.natural(ctx, size, place);
    drawCaptainHat(ctx, size, place);
  },
};

// ── 액세서리 ─────────────────────────────────────────────────

function drawSunglasses(ctx: Ctx, size: number, { dy, scale }: Placement) {
  const cx = FACE_GUIDE.cx * size;
  const cy = (0.455 + dy) * size;
  const u = size * scale; // 단위 길이
  const lensW = 0.2 * u;
  const lensH = 0.115 * u;
  const gap = 0.035 * u;

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // 다리
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 0.014 * u;
  ctx.beginPath();
  ctx.moveTo(cx - gap - lensW, cy - lensH * 0.35);
  ctx.lineTo(cx - gap - lensW - 0.07 * u, cy - lensH * 0.2);
  ctx.moveTo(cx + gap + lensW, cy - lensH * 0.35);
  ctx.lineTo(cx + gap + lensW + 0.07 * u, cy - lensH * 0.2);
  ctx.stroke();

  for (const side of [-1, 1]) {
    const inner = cx + side * gap;
    const outer = cx + side * (gap + lensW);
    const top = cy - lensH * 0.5;
    const bottom = cy + lensH * 0.5;

    ctx.beginPath();
    ctx.moveTo(inner, top);
    ctx.lineTo(outer, top - lensH * 0.08);
    ctx.quadraticCurveTo(outer + side * 0.01 * u, bottom - lensH * 0.2, (inner + outer) / 2 + side * lensW * 0.15, bottom);
    ctx.quadraticCurveTo(inner, bottom, inner, top + lensH * 0.15);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, top, 0, bottom);
    grad.addColorStop(0, "#0b0b0f");
    grad.addColorStop(1, "#2e3138");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 0.012 * u;
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // 반사광
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 0.022 * u;
    ctx.beginPath();
    ctx.moveTo(Math.min(inner, outer) + lensW * 0.25, bottom);
    ctx.lineTo(Math.min(inner, outer) + lensW * 0.6, top);
    ctx.stroke();
    ctx.restore();
  }

  // 브리지
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 0.016 * u;
  ctx.beginPath();
  ctx.moveTo(cx - gap, cy - lensH * 0.3);
  ctx.quadraticCurveTo(cx, cy - lensH * 0.55, cx + gap, cy - lensH * 0.3);
  ctx.stroke();
  ctx.restore();
}

function drawCaptainHat(ctx: Ctx, size: number, { dy, scale }: Placement) {
  const cx = FACE_GUIDE.cx * size;
  const brimY = (0.27 + dy) * size;
  const w = 0.56 * size * scale; // 모자 폭

  ctx.save();

  // 밴드 (네이비)
  ctx.fillStyle = `rgb(${NAVY_DEEP.join(",")})`;
  ctx.beginPath();
  ctx.moveTo(cx - 0.4 * w, brimY);
  ctx.lineTo(cx - 0.44 * w, brimY - 0.24 * w);
  ctx.lineTo(cx + 0.44 * w, brimY - 0.24 * w);
  ctx.lineTo(cx + 0.4 * w, brimY);
  ctx.closePath();
  ctx.fill();

  // 금색 끈
  ctx.strokeStyle = "#E8B931";
  ctx.lineWidth = 0.022 * w;
  ctx.beginPath();
  ctx.moveTo(cx - 0.41 * w, brimY - 0.06 * w);
  ctx.lineTo(cx + 0.41 * w, brimY - 0.06 * w);
  ctx.stroke();

  // 흰색 윗판
  ctx.fillStyle = "#FBFBF8";
  ctx.strokeStyle = "#C9CED6";
  ctx.lineWidth = 0.012 * w;
  ctx.beginPath();
  ctx.ellipse(cx, brimY - 0.26 * w, 0.54 * w, 0.13 * w, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 챙 (검정 유광)
  const brim = ctx.createLinearGradient(0, brimY, 0, brimY + 0.1 * w);
  brim.addColorStop(0, "#2a2d33");
  brim.addColorStop(1, "#050506");
  ctx.fillStyle = brim;
  ctx.beginPath();
  ctx.ellipse(cx, brimY, 0.41 * w, 0.1 * w, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // 배지 + 닻
  const by = brimY - 0.14 * w;
  const br = 0.075 * w;
  ctx.fillStyle = "#E8B931";
  ctx.beginPath();
  ctx.arc(cx, by, br, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = `rgb(${NAVY_DEEP.join(",")})`;
  ctx.lineWidth = br * 0.16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, by - br * 0.6);
  ctx.lineTo(cx, by + br * 0.55);
  ctx.moveTo(cx - br * 0.35, by - br * 0.25);
  ctx.lineTo(cx + br * 0.35, by - br * 0.25);
  ctx.moveTo(cx - br * 0.55, by + br * 0.1);
  ctx.quadraticCurveTo(cx, by + br * 0.95, cx + br * 0.55, by + br * 0.1);
  ctx.stroke();

  ctx.restore();
}

// ── 픽셀 연산 ───────────────────────────────────────────────

function pixels(ctx: Ctx, size: number, fn: (d: Uint8ClampedArray) => void) {
  const img = ctx.getImageData(0, 0, size, size);
  fn(img.data);
  ctx.putImageData(img, 0, 0);
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function tone(
  d: Uint8ClampedArray,
  o: { brightness: number; contrast: number; saturation: number; warmth: number },
) {
  for (let i = 0; i < d.length; i += 4) {
    const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    for (let c = 0; c < 3; c++) {
      const sat = l + (d[i + c] - l) * o.saturation;
      d[i + c] = (sat - 128) * o.contrast + 128 + o.brightness;
    }
    d[i] += o.warmth;
    d[i + 2] -= o.warmth;
  }
}

function sepia(d: Uint8ClampedArray, amount: number) {
  for (let i = 0; i < d.length; i += 4) {
    const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
    d[i] = r + (0.393 * r + 0.769 * g + 0.189 * b - r) * amount;
    d[i + 1] = g + (0.349 * r + 0.686 * g + 0.168 * b - g) * amount;
    d[i + 2] = b + (0.272 * r + 0.534 * g + 0.131 * b - b) * amount;
  }
}

function grain(d: Uint8ClampedArray, amount: number) {
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
}

function vignette(ctx: Ctx, size: number, strength: number) {
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
}

function grayOf(d: Uint8ClampedArray): Float32Array {
  const g = new Float32Array(d.length / 4);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    g[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  }
  return g;
}

function writeGray(d: Uint8ClampedArray, g: Float32Array, fn: (v: number, p: number) => number) {
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const v = fn(g[p], p);
    d[i] = d[i + 1] = d[i + 2] = v;
  }
}

/** 노출이 제각각이어도 결과가 비슷하도록 밝기 범위를 0~255로 늘립니다. */
function normalize(g: Float32Array, clip: number): Float32Array {
  const sorted = Float32Array.from(g).sort();
  const lo = sorted[Math.floor(sorted.length * clip)];
  const hi = sorted[Math.floor(sorted.length * (1 - clip)) - 1];
  const range = Math.max(1, hi - lo);
  return g.map((v) => clamp(((v - lo) / range) * 255));
}

/** 분리형 박스 블러 */
function boxBlur(src: Float32Array, size: number, r: number, passes = 1): Float32Array {
  let a = Float32Array.from(src);
  let b = new Float32Array(src.length);
  const win = r * 2 + 1;
  for (let pass = 0; pass < passes; pass++) {
    for (const horizontal of [true, false]) {
      for (let line = 0; line < size; line++) {
        const at = (k: number) => {
          const kk = k < 0 ? 0 : k >= size ? size - 1 : k;
          return horizontal ? line * size + kk : kk * size + line;
        };
        let sum = 0;
        for (let k = -r; k <= r; k++) sum += a[at(k)];
        for (let k = 0; k < size; k++) {
          b[at(k)] = sum / win;
          sum += a[at(k + r + 1)] - a[at(k - r)];
        }
      }
      [a, b] = [b, a];
    }
  }
  return a;
}

function sobel(g: Float32Array, size: number): Float32Array {
  const out = new Float32Array(g.length);
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const p = y * size + x;
      const tl = g[p - size - 1], t = g[p - size], tr = g[p - size + 1];
      const l = g[p - 1], r = g[p + 1];
      const bl = g[p + size - 1], b = g[p + size], br = g[p + size + 1];
      const gx = tr + 2 * r + br - tl - 2 * l - bl;
      const gy = bl + 2 * b + br - tl - 2 * t - tr;
      out[p] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return out;
}
