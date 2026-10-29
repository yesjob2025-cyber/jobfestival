// ─────────────────────────────────────────────────────────────
// 미래 명함 — 얼굴 스타일 = 필터 12종 × 소품 12종
//
// 필터는 캔버스 픽셀 연산, 소품은 캔버스로 직접 그립니다.
// 사진은 배경이 지워진(투명) 정사각형이며, 필터는 사람 부분에만 적용됩니다.
// 소품은 얼굴 위치(FaceGeom — vision.ts 가 찾음)에 맞춰 크기 · 기울기를 정합니다.
// ─────────────────────────────────────────────────────────────

export const PHOTO_SIZE = 720;

/** 촬영 화면의 얼굴 가이드 원 (정사각형 사진 기준 비율) */
export const FACE_GUIDE = { cx: 0.5, cy: 0.5, rx: 0.27, ry: 0.36 } as const;

/** 얼굴 위치 — 모두 사진 한 변 대비 비율 (roll 만 라디안) */
export interface FaceGeom {
  cx: number;
  eyeY: number;
  eyeDist: number;
  roll: number;
  /** 얼굴 상자 위쪽 (이마 근처) */
  top: number;
  /** 얼굴 상자 폭 */
  width: number;
  noseY: number;
  mouthY: number;
}

/** 얼굴을 못 찾았을 때 — 가이드 원에 맞춰 찍었다고 보고 정한 위치 */
export const DEFAULT_GEOM: FaceGeom = {
  cx: 0.5,
  eyeY: 0.45,
  eyeDist: 0.2,
  roll: 0,
  top: 0.27,
  width: 0.44,
  noseY: 0.55,
  mouthY: 0.64,
};

/** 소품 위치 직접 조정 — dx · dy: 사진 한 변 대비 이동, scale: 크기 배율, rot: 추가 회전(라디안) */
export interface Placement {
  dx: number;
  dy: number;
  scale: number;
  rot: number;
}

export const DEFAULT_PLACEMENT: Placement = { dx: 0, dy: 0, scale: 1, rot: 0 };

export const FILTERS = [
  { id: "natural", name: "내추럴", desc: "화사한 기본 보정" },
  { id: "glow", name: "뽀샤시", desc: "빛나는 피부 · 은은한 광채" },
  { id: "mono", name: "흑백 프로필", desc: "사진관 느낌의 흑백" },
  { id: "film", name: "빈티지 필름", desc: "따뜻한 필름 감성" },
  { id: "webtoon", name: "웹툰", desc: "선명한 외곽선 만화풍" },
  { id: "sketch", name: "연필 스케치", desc: "손으로 그린 드로잉" },
  { id: "watercolor", name: "수채화", desc: "번지는 물감 느낌" },
  { id: "pop", name: "팝아트", desc: "블루 · 옐로 포스터" },
  { id: "duotone", name: "블루 듀오톤", desc: "네이비 · 스카이 톤" },
  { id: "halftone", name: "만화 망점", desc: "옛날 만화책 인쇄" },
  { id: "neon", name: "네온사인", desc: "빛나는 네온 라인" },
  { id: "pixel", name: "8비트 픽셀", desc: "레트로 게임 캐릭터" },
] as const;

export const PROPS = [
  { id: "none", name: "소품 없음", emoji: "🙂" },
  { id: "sunglasses", name: "선글라스", emoji: "😎" },
  { id: "mustache", name: "콧수염 안경", emoji: "🥸" },
  { id: "gradcap", name: "학사모", emoji: "🎓" },
  { id: "crown", name: "왕관", emoji: "👑" },
  { id: "captain", name: "캡틴 모자", emoji: "⚓" },
  { id: "police", name: "경찰 모자", emoji: "👮" },
  { id: "nurse", name: "간호사 캡", emoji: "🩺" },
  { id: "chef", name: "셰프 모자", emoji: "🧑‍🍳" },
  { id: "hardhat", name: "안전모", emoji: "⛑️" },
  { id: "headset", name: "헤드셋", emoji: "🎧" },
  { id: "bowtie", name: "나비넥타이", emoji: "🎀" },
  { id: "heartglasses", name: "하트 선글라스", emoji: "😍" },
  { id: "hornrim", name: "뿔테 안경", emoji: "🤓" },
  { id: "partyhat", name: "파티 고깔", emoji: "🥳" },
  { id: "wizard", name: "마법사 모자", emoji: "🧙" },
  { id: "beret", name: "베레모", emoji: "🎨" },
  { id: "cap", name: "야구모자", emoji: "🧢" },
  { id: "catears", name: "고양이 귀", emoji: "🐱" },
  { id: "dogears", name: "강아지 귀", emoji: "🐶" },
  { id: "bunny", name: "토끼 귀", emoji: "🐰" },
  { id: "flowers", name: "꽃 머리띠", emoji: "🌸" },
  { id: "pirate", name: "해적 안대", emoji: "🏴‍☠️" },
  { id: "sparkle", name: "반짝반짝", emoji: "✨" },
] as const;

export type FilterId = (typeof FILTERS)[number]["id"];
export type PropId = (typeof PROPS)[number]["id"];

export interface FaceStyle {
  filter: FilterId;
  prop: PropId;
}

export const DEFAULT_STYLE: FaceStyle = { filter: "natural", prop: "none" };

/** 투명 배경 정사각형 사진에 필터와 소품을 입혀 size×size 캔버스로 돌려줍니다. */
export function renderFace(
  src: HTMLCanvasElement,
  style: FaceStyle,
  size: number,
  geom: FaceGeom = DEFAULT_GEOM,
  place: Placement = DEFAULT_PLACEMENT,
): HTMLCanvasElement {
  return composeFace(applyFilter(src, style.filter, size), style.prop, geom, place);
}

/** 필터만 입힌 사진 — 소품을 끌어 옮기는 동안에는 이것을 다시 쓰고 소품만 새로 그립니다. */
export function applyFilter(src: HTMLCanvasElement, filter: FilterId, size: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0, size, size);
  FILTER_FNS[filter](ctx, size);
  return canvas;
}

/** 필터 입힌 사진 위에 소품을 그린 새 캔버스 */
export function composeFace(base: HTMLCanvasElement, prop: PropId, geom: FaceGeom, place: Placement): HTMLCanvasElement {
  const size = base.width;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(base, 0, 0);
  if (prop !== "none") {
    ctx.save();
    PROP_FNS[prop](enterFace(ctx, size, geom, place));
    ctx.restore();
  }
  return canvas;
}

type Ctx = CanvasRenderingContext2D;
type RGB = readonly [number, number, number];

const NAVY_DEEP: RGB = [11, 42, 120];
const NAVY: RGB = [19, 57, 154];
const SKY: RGB = [8, 160, 246];
const SKY_PALE: RGB = [227, 245, 254];
const YELLOW: RGB = [255, 210, 30];
const PINK: RGB = [228, 69, 122];
const WHITE: RGB = [255, 255, 255];
const rgb = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;

// ── 필터 ────────────────────────────────────────────────────

const FILTER_FNS: Record<FilterId, (ctx: Ctx, size: number) => void> = {
  natural(ctx, size) {
    pixels(ctx, size, (d) => tone(d, { brightness: 8, contrast: 1.05, saturation: 1.12, warmth: 4 }));
  },

  glow(ctx, size) {
    pixels(ctx, size, (d) => tone(d, { brightness: 22, contrast: 0.92, saturation: 1.05, warmth: 6 }));
    // 흐린 사본을 밝게 겹쳐 광채 — 가장자리로 살짝 번져 후광이 됩니다.
    overlay(ctx, softCopy(ctx.canvas, 0.06), "screen", 0.55);
  },

  mono(ctx, size) {
    pixels(ctx, size, (d) => {
      const g = normalize(grayOf(d), d, 0.01);
      writeGray(d, g, (v) => clamp((v - 128) * 1.15 + 128));
    });
    vignette(ctx, size, 0.35);
  },

  film(ctx, size) {
    pixels(ctx, size, (d) => {
      tone(d, { brightness: 4, contrast: 0.95, saturation: 0.85, warmth: 10 });
      sepia(d, 0.45);
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 18 + d[i] * 0.9;
        d[i + 1] = 14 + d[i + 1] * 0.9;
        d[i + 2] = 10 + d[i + 2] * 0.88;
      }
      grain(d, 22);
    });
    vignette(ctx, size, 0.4);
  },

  webtoon(ctx, size) {
    pixels(ctx, size, (d) => {
      const edges = sobel(boxBlur(grayOf(d), size, 1), size);
      tone(d, { brightness: 12, contrast: 1.1, saturation: 1.35, warmth: 0 });
      const step = 255 / 4;
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const e = clamp01((edges[p] - 70) / 70);
        for (let c = 0; c < 3; c++) d[i + c] = Math.round(d[i + c] / step) * step * (1 - e) + 28 * e;
      }
    });
  },

  sketch(ctx, size) {
    pixels(ctx, size, (d) => {
      const g = normalize(grayOf(d), d, 0.01);
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

  watercolor(ctx, size) {
    pixels(ctx, size, (d) => {
      const r = Math.max(1, Math.round(size / 300));
      const channels = [0, 1, 2].map((c) => {
        const ch = new Float32Array(d.length / 4);
        for (let i = c, p = 0; i < d.length; i += 4, p++) ch[p] = d[i];
        return boxBlur(ch, size, r);
      });
      const [R, G, B] = channels;
      const edges = sobel(boxBlur(grayOf(d), size, r + 1), size);
      const step = 255 / 7;
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const l = 0.299 * R[p] + 0.587 * G[p] + 0.114 * B[p];
        const e = clamp01((edges[p] - 20) / 90) * 60;
        channels.forEach((ch, c) => {
          const sat = l + (ch[p] - l) * 1.3 + 14;
          d[i + c] = Math.round(sat / step) * step * 0.35 + sat * 0.65 - e;
        });
      }
      grain(d, 14);
    });
  },

  pop(ctx, size) {
    pixels(ctx, size, (d) => {
      const g = normalize(boxBlur(grayOf(d), size, 1), d, 0.02);
      const bands: RGB[] = [NAVY_DEEP, SKY, YELLOW, WHITE];
      const cuts = [64, 122, 190];
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const b = cuts.findIndex((c) => g[p] < c);
        [d[i], d[i + 1], d[i + 2]] = bands[b === -1 ? 3 : b];
      }
    });
  },

  duotone(ctx, size) {
    pixels(ctx, size, (d) => {
      const g = normalize(grayOf(d), d, 0.01);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const t = g[p] / 255;
        [d[i], d[i + 1], d[i + 2]] = t < 0.5 ? mix(NAVY_DEEP, SKY, t / 0.5) : mix(SKY, SKY_PALE, (t - 0.5) / 0.5);
      }
    });
  },

  halftone(ctx, size) {
    const d = ctx.getImageData(0, 0, size, size).data;
    const g = normalize(boxBlur(grayOf(d), size, 1), d, 0.02);
    // 사람 부분만 종이색으로 칠하고 그 위에 망점
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "#FFF4D6";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = rgb(NAVY_DEEP);
    const step = size / 64;
    for (let row = 0, y = step / 2; y < size; row++, y += step) {
      for (let x = step / 2 + (row % 2 ? step / 2 : 0); x < size; x += step) {
        const r = (1 - g[Math.floor(y) * size + Math.floor(x)] / 255) * step * 0.62;
        if (r < 0.4) continue;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = "source-over";
  },

  neon(ctx, size) {
    pixels(ctx, size, (d) => {
      const edges = sobel(boxBlur(grayOf(d), size, 1), size);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const color = mix(PINK, SKY, Math.floor(p / size) / size);
        const e = clamp01((edges[p] - 35) / 70);
        for (let c = 0; c < 3; c++) d[i + c] = d[i + c] * 0.18 + 10 + color[c] * e * 1.3 + 255 * e * e * 0.3;
      }
    });
    overlay(ctx, softCopy(ctx.canvas, 0.03), "lighter", 0.7);
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
        d[i + 3] = d[i + 3] > 110 ? 255 : 0;
      }
    });
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
  },
};

// ── 소품 ────────────────────────────────────────────────────

/**
 * 얼굴 기준 좌표계 — 원점은 두 눈 사이, 길이 1 은 얼굴 폭, 얼굴 기울기만큼 회전.
 * 소품은 이 좌표계에서 그립니다 (위쪽이 음수).
 */
interface Frame {
  ctx: Ctx;
  /** 눈 사이 거리 */
  eye: number;
  /** 원점 기준 얼굴 위쪽 · 코 · 입 높이 */
  top: number;
  nose: number;
  mouth: number;
}

function enterFace(ctx: Ctx, size: number, g: FaceGeom, place: Placement): Frame {
  const u = g.width * size * place.scale;
  ctx.translate((g.cx + place.dx) * size, (g.eyeY + place.dy) * size);
  ctx.rotate(g.roll + place.rot);
  ctx.scale(u, u);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  return {
    ctx,
    eye: g.eyeDist / g.width,
    top: (g.top - g.eyeY) / g.width,
    nose: (g.noseY - g.eyeY) / g.width,
    mouth: (g.mouthY - g.eyeY) / g.width,
  };
}

/** 모자류 — 얼굴 상자는 머리카락을 빼고 잡히므로 이마 높이를 기준으로 k 배 키워 그립니다. */
const hat =
  (k: number, draw: (f: Frame) => void) =>
  (f: Frame) => {
    f.ctx.translate(0, f.top);
    f.ctx.scale(k, k);
    f.ctx.translate(0, -f.top);
    draw(f);
  };

const PROP_FNS: Record<Exclude<PropId, "none">, (f: Frame) => void> = {
  sunglasses: ({ ctx, eye }) => {
    const lensW = eye * 0.82;
    const lensH = eye * 0.5;
    const inner = eye * 0.1;

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(-inner - lensW, -lensH * 0.35);
    ctx.lineTo(-inner - lensW - 0.14, -lensH * 0.2);
    ctx.moveTo(inner + lensW, -lensH * 0.35);
    ctx.lineTo(inner + lensW + 0.14, -lensH * 0.2);
    ctx.stroke();

    for (const side of [-1, 1]) {
      const a = side * inner;
      const b = side * (inner + lensW);
      const top = -lensH * 0.5;
      const bottom = lensH * 0.5;
      ctx.beginPath();
      ctx.moveTo(a, top);
      ctx.lineTo(b, top - lensH * 0.08);
      ctx.quadraticCurveTo(b + side * 0.02, bottom - lensH * 0.2, (a + b) / 2 + side * lensW * 0.15, bottom);
      ctx.quadraticCurveTo(a, bottom, a, top + lensH * 0.15);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, top, 0, bottom);
      grad.addColorStop(0, "#0b0b0f");
      grad.addColorStop(1, "#2e3138");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 0.025;
      ctx.strokeStyle = "#000";
      ctx.stroke();
      // 반사광
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 0.045;
      ctx.beginPath();
      ctx.moveTo(Math.min(a, b) + lensW * 0.25, bottom);
      ctx.lineTo(Math.min(a, b) + lensW * 0.6, top);
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 0.035;
    ctx.beginPath();
    ctx.moveTo(-inner, -lensH * 0.3);
    ctx.quadraticCurveTo(0, -lensH * 0.55, inner, -lensH * 0.3);
    ctx.stroke();
  },

  mustache: ({ ctx, eye, nose, mouth }) => {
    // 동그란 안경
    ctx.lineWidth = 0.035;
    ctx.strokeStyle = "#1b1b1f";
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc((s * eye) / 2, 0, eye * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-eye * 0.08, -0.02);
    ctx.quadraticCurveTo(0, -0.07, eye * 0.08, -0.02);
    ctx.stroke();
    // 콧수염
    const y = nose + (mouth - nose) * 0.45;
    ctx.fillStyle = "#3a2618";
    ctx.beginPath();
    ctx.moveTo(0, y - 0.03);
    ctx.bezierCurveTo(0.12, y - 0.1, 0.3, y - 0.02, 0.34, y + 0.06);
    ctx.bezierCurveTo(0.22, y + 0.02, 0.12, y + 0.06, 0, y + 0.03);
    ctx.bezierCurveTo(-0.12, y + 0.06, -0.22, y + 0.02, -0.34, y + 0.06);
    ctx.bezierCurveTo(-0.3, y - 0.02, -0.12, y - 0.1, 0, y - 0.03);
    ctx.fill();
  },

  gradcap: hat(1.2, ({ ctx, top }) => {
    const y = top - 0.08;
    ctx.fillStyle = "#16161c";
    ctx.beginPath();
    ctx.moveTo(-0.42, y);
    ctx.quadraticCurveTo(0, y + 0.16, 0.42, y);
    ctx.lineTo(0.4, y - 0.2);
    ctx.lineTo(-0.4, y - 0.2);
    ctx.closePath();
    ctx.fill();
    // 사각 판
    ctx.fillStyle = "#24242c";
    ctx.strokeStyle = "#3a3a46";
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    ctx.moveTo(0, y - 0.48);
    ctx.lineTo(0.78, y - 0.26);
    ctx.lineTo(0, y - 0.06);
    ctx.lineTo(-0.78, y - 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // 술
    ctx.strokeStyle = rgb(YELLOW);
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(0, y - 0.27);
    ctx.quadraticCurveTo(0.45, y - 0.3, 0.55, y - 0.02);
    ctx.stroke();
    ctx.fillStyle = rgb(YELLOW);
    ctx.fillRect(0.5, y - 0.04, 0.1, 0.18);
    ctx.beginPath();
    ctx.arc(0, y - 0.27, 0.04, 0, Math.PI * 2);
    ctx.fill();
  }),

  crown: hat(1.15, ({ ctx, top }) => {
    const y = top - 0.05;
    const grad = ctx.createLinearGradient(0, y - 0.45, 0, y);
    grad.addColorStop(0, "#FFE680");
    grad.addColorStop(1, "#E8A800");
    ctx.fillStyle = grad;
    ctx.strokeStyle = "#B07A00";
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    ctx.moveTo(-0.4, y);
    ctx.lineTo(-0.46, y - 0.36);
    ctx.lineTo(-0.22, y - 0.17);
    ctx.lineTo(0, y - 0.46);
    ctx.lineTo(0.22, y - 0.17);
    ctx.lineTo(0.46, y - 0.36);
    ctx.lineTo(0.4, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const gems: [number, number, RGB][] = [
      [-0.46, y - 0.36, PINK],
      [0, y - 0.46, SKY],
      [0.46, y - 0.36, PINK],
      [0, y - 0.09, SKY],
      [-0.24, y - 0.08, PINK],
      [0.24, y - 0.08, PINK],
    ];
    for (const [x, yy, c] of gems) {
      ctx.fillStyle = rgb(c);
      ctx.beginPath();
      ctx.arc(x, yy, 0.045, 0, Math.PI * 2);
      ctx.fill();
    }
  }),

  captain: hat(1.2, ({ ctx, top }) => peakedCap(ctx, top, "#FBFBF8", rgb(NAVY_DEEP), "anchor")),

  police: hat(1.2, ({ ctx, top }) => peakedCap(ctx, top, "#1C2A4A", "#111a30", "star")),

  nurse: hat(1.3, ({ ctx, top }) => {
    const y = top - 0.02;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#C9D3E0";
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    ctx.moveTo(-0.34, y);
    ctx.lineTo(-0.28, y - 0.24);
    ctx.quadraticCurveTo(0, y - 0.3, 0.28, y - 0.24);
    ctx.lineTo(0.34, y);
    ctx.quadraticCurveTo(0, y - 0.06, -0.34, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#E23B4A";
    ctx.fillRect(-0.025, y - 0.22, 0.05, 0.14);
    ctx.fillRect(-0.07, y - 0.175, 0.14, 0.05);
  }),

  chef: hat(1.2, ({ ctx, top }) => {
    const y = top - 0.04;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#D5DCE6";
    ctx.lineWidth = 0.02;
    // 부푼 윗부분
    ctx.beginPath();
    for (const [x, yy, r] of [
      [-0.26, y - 0.42, 0.22],
      [0, y - 0.54, 0.26],
      [0.26, y - 0.42, 0.22],
    ]) {
      ctx.moveTo(x + r, yy);
      ctx.arc(x, yy, r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();
    // 밴드
    ctx.beginPath();
    ctx.rect(-0.38, y - 0.28, 0.76, 0.28);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#E8EDF3";
    for (const x of [-0.2, 0, 0.2]) {
      ctx.beginPath();
      ctx.moveTo(x, y - 0.26);
      ctx.lineTo(x, y - 0.02);
      ctx.stroke();
    }
  }),

  hardhat: hat(1.25, ({ ctx, top }) => {
    const y = top + 0.04;
    const grad = ctx.createLinearGradient(0, y - 0.45, 0, y);
    grad.addColorStop(0, "#FFE15A");
    grad.addColorStop(1, "#F2B600");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-0.46, y);
    ctx.bezierCurveTo(-0.46, y - 0.55, 0.46, y - 0.55, 0.46, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#E0A400";
    ctx.beginPath();
    ctx.ellipse(0, y, 0.6, 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFE98A";
    ctx.fillRect(-0.05, y - 0.43, 0.1, 0.42);
  }),

  headset: ({ ctx, top, eye, mouth }) => {
    const ear = 0.56;
    const earY = eye * 0.25;
    ctx.strokeStyle = "#1f2430";
    ctx.lineWidth = 0.06;
    ctx.beginPath();
    ctx.moveTo(-ear, earY);
    ctx.bezierCurveTo(-ear, top - 0.45, ear, top - 0.45, ear, earY);
    ctx.stroke();
    for (const s of [-1, 1]) {
      ctx.fillStyle = rgb(NAVY);
      roundRectPath(ctx, s * ear - 0.08, earY - 0.12, 0.16, 0.28, 0.07);
      ctx.fill();
      ctx.fillStyle = rgb(SKY);
      roundRectPath(ctx, s * ear - 0.05, earY - 0.08, 0.1, 0.2, 0.05);
      ctx.fill();
    }
    // 마이크
    ctx.strokeStyle = "#1f2430";
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(-ear, earY + 0.12);
    ctx.quadraticCurveTo(-0.45, mouth + 0.05, -0.12, mouth + 0.02);
    ctx.stroke();
    ctx.fillStyle = "#1f2430";
    ctx.beginPath();
    ctx.ellipse(-0.1, mouth + 0.02, 0.06, 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  bowtie: ({ ctx, mouth }) => {
    const y = mouth + 0.55;
    ctx.fillStyle = rgb(PINK);
    ctx.strokeStyle = "#a82556";
    ctx.lineWidth = 0.02;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(s * 0.3, y - 0.14);
      ctx.quadraticCurveTo(s * 0.36, y, s * 0.3, y + 0.14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(0, y, 0.07, 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (const [x, yy] of [
      [-0.18, y - 0.05],
      [0.2, y + 0.04],
      [-0.22, y + 0.06],
      [0.16, y - 0.06],
    ]) {
      ctx.beginPath();
      ctx.arc(x, yy, 0.022, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  heartglasses: ({ ctx, eye }) => {
    const r = eye * 0.44;
    ctx.strokeStyle = "#b0124f";
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    ctx.moveTo(-eye * 0.12, -r * 0.35);
    ctx.quadraticCurveTo(0, -r * 0.6, eye * 0.12, -r * 0.35);
    ctx.moveTo(-eye / 2 - r * 1.05, -r * 0.4);
    ctx.lineTo(-eye / 2 - r * 1.05 - 0.12, -r * 0.25);
    ctx.moveTo(eye / 2 + r * 1.05, -r * 0.4);
    ctx.lineTo(eye / 2 + r * 1.05 + 0.12, -r * 0.25);
    ctx.stroke();
    for (const s of [-1, 1]) {
      const cx = (s * eye) / 2;
      heartPath(ctx, cx, -r * 0.1, r * 1.1);
      const g = ctx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, "#ff5c9a");
      g.addColorStop(1, "#c4105a");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 0.025;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.38, -r * 0.42, r * 0.16, r * 0.09, -0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  hornrim: ({ ctx, eye }) => {
    const w = eye * 0.8;
    const h = eye * 0.56;
    ctx.fillStyle = "rgba(220,235,255,0.12)";
    ctx.strokeStyle = "#2b1a12";
    ctx.lineWidth = 0.05;
    for (const s of [-1, 1]) {
      roundRectPath(ctx, (s * eye) / 2 - w / 2, -h / 2, w, h, h * 0.3);
      ctx.fill();
      ctx.stroke();
    }
    ctx.lineWidth = 0.045;
    ctx.beginPath();
    ctx.moveTo(-eye / 2 + w / 2, -h * 0.15);
    ctx.quadraticCurveTo(0, -h * 0.4, eye / 2 - w / 2, -h * 0.15);
    ctx.moveTo(-eye / 2 - w / 2, -h * 0.3);
    ctx.lineTo(-eye / 2 - w / 2 - 0.13, -h * 0.2);
    ctx.moveTo(eye / 2 + w / 2, -h * 0.3);
    ctx.lineTo(eye / 2 + w / 2 + 0.13, -h * 0.2);
    ctx.stroke();
  },

  partyhat: hat(1.15, ({ ctx, top }) => {
    const y = top + 0.02;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-0.26, y);
    ctx.lineTo(0.06, y - 0.78);
    ctx.lineTo(0.3, y);
    ctx.quadraticCurveTo(0.02, y + 0.06, -0.26, y);
    ctx.closePath();
    ctx.fillStyle = rgb(SKY);
    ctx.fill();
    ctx.clip();
    ctx.fillStyle = rgb(YELLOW);
    for (let k = 0; k < 5; k++) {
      ctx.save();
      ctx.translate(0, y - k * 0.17);
      ctx.rotate(-0.3);
      ctx.fillRect(-0.6, -0.03, 1.2, 0.06);
      ctx.restore();
    }
    ctx.fillStyle = rgb(PINK);
    for (const [x, yy] of [[-0.08, y - 0.12], [0.14, y - 0.3], [0.0, y - 0.46], [0.16, y - 0.08]]) {
      ctx.beginPath();
      ctx.arc(x, yy, 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // 방울
    ctx.fillStyle = rgb(PINK);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      ctx.beginPath();
      ctx.ellipse(0.06 + Math.cos(a) * 0.05, y - 0.8 + Math.sin(a) * 0.05, 0.05, 0.03, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0.06, y - 0.8, 0.035, 0, Math.PI * 2);
    ctx.fill();
  }),

  wizard: hat(1.25, ({ ctx, top }) => {
    const y = top + 0.02;
    const g = ctx.createLinearGradient(0, y - 0.9, 0, y);
    g.addColorStop(0, "#5b3cc4");
    g.addColorStop(1, "#2a1a78");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-0.36, y - 0.04);
    ctx.quadraticCurveTo(-0.1, y - 0.5, 0.18, y - 0.92);
    ctx.quadraticCurveTo(0.34, y - 0.86, 0.38, y - 0.76);
    ctx.quadraticCurveTo(0.2, y - 0.6, 0.36, y - 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#24166a";
    ctx.beginPath();
    ctx.ellipse(0, y, 0.66, 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgb(YELLOW);
    ctx.fillRect(-0.34, y - 0.14, 0.7, 0.07);
    for (const [x, yy, r] of [[-0.08, y - 0.4, 0.06], [0.14, y - 0.62, 0.045], [0.12, y - 0.26, 0.04]]) starPath(ctx, x, yy, r);
    ctx.fillStyle = "#fff6c0";
    ctx.beginPath();
    ctx.arc(-0.18, y - 0.22, 0.05, Math.PI * 0.35, Math.PI * 1.65);
    ctx.arc(-0.15, y - 0.22, 0.04, Math.PI * 1.6, Math.PI * 0.4, true);
    ctx.fill();
  }),

  beret: hat(1.15, ({ ctx, top }) => {
    const y = top + 0.04;
    const g = ctx.createRadialGradient(-0.1, y - 0.3, 0.05, 0, y - 0.18, 0.6);
    g.addColorStop(0, "#e2384f");
    g.addColorStop(1, "#8f1226");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(-0.06, y - 0.2, 0.56, 0.2, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7a0f20";
    ctx.beginPath();
    ctx.ellipse(0, y - 0.03, 0.4, 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#7a0f20";
    ctx.lineWidth = 0.035;
    ctx.beginPath();
    ctx.moveTo(-0.02, y - 0.38);
    ctx.lineTo(0.02, y - 0.46);
    ctx.stroke();
  }),

  cap: hat(1.2, ({ ctx, top }) => {
    const y = top + 0.06;
    const g = ctx.createLinearGradient(0, y - 0.5, 0, y);
    g.addColorStop(0, rgb(NAVY));
    g.addColorStop(1, rgb(NAVY_DEEP));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-0.44, y);
    ctx.bezierCurveTo(-0.46, y - 0.56, 0.46, y - 0.56, 0.44, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 0.015;
    ctx.beginPath();
    ctx.moveTo(0, y - 0.42);
    ctx.lineTo(0, y - 0.02);
    ctx.stroke();
    // 챙
    ctx.fillStyle = rgb(NAVY_DEEP);
    ctx.beginPath();
    ctx.moveTo(-0.44, y - 0.02);
    ctx.quadraticCurveTo(0, y + 0.22, 0.44, y - 0.02);
    ctx.quadraticCurveTo(0, y + 0.06, -0.44, y - 0.02);
    ctx.fill();
    ctx.fillStyle = rgb(YELLOW);
    ctx.beginPath();
    ctx.arc(0, y - 0.47, 0.035, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "700 0.17px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = rgb(YELLOW);
    ctx.fillText("KDU", 0, y - 0.2);
  }),

  catears: hat(1.1, ({ ctx, top }) => {
    const y = top + 0.04;
    headband(ctx, y, "#2b2b33");
    for (const s of [-1, 1]) {
      ctx.fillStyle = "#2b2b33";
      ctx.beginPath();
      ctx.moveTo(s * 0.16, y - 0.2);
      ctx.lineTo(s * 0.36, y - 0.54);
      ctx.lineTo(s * 0.46, y - 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ff9ec0";
      ctx.beginPath();
      ctx.moveTo(s * 0.23, y - 0.2);
      ctx.lineTo(s * 0.35, y - 0.43);
      ctx.lineTo(s * 0.41, y - 0.17);
      ctx.closePath();
      ctx.fill();
    }
  }),

  dogears: ({ ctx, top, nose }) => {
    for (const s of [-1, 1]) {
      ctx.fillStyle = "#8a5a3c";
      ctx.beginPath();
      ctx.moveTo(s * 0.3, top + 0.02);
      ctx.bezierCurveTo(s * 0.62, top - 0.06, s * 0.72, top + 0.42, s * 0.56, top + 0.62);
      ctx.bezierCurveTo(s * 0.46, top + 0.7, s * 0.4, top + 0.4, s * 0.38, top + 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#b07a52";
      ctx.beginPath();
      ctx.ellipse(s * 0.52, top + 0.32, 0.06, 0.16, s * -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // 코
    ctx.fillStyle = "#221812";
    ctx.beginPath();
    ctx.ellipse(0, nose - 0.01, 0.09, 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.ellipse(-0.03, nose - 0.035, 0.025, 0.014, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  bunny: hat(1.1, ({ ctx, top }) => {
    const y = top + 0.04;
    headband(ctx, y, "#f4f4f8");
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * 0.18, y - 0.18);
      ctx.rotate(s * 0.18);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#dcdce6";
      ctx.lineWidth = 0.015;
      ctx.beginPath();
      ctx.ellipse(0, -0.34, 0.11, 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffb3cc";
      ctx.beginPath();
      ctx.ellipse(0, -0.32, 0.055, 0.27, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }),

  flowers: hat(1.05, ({ ctx, top }) => {
    const y = top + 0.06;
    ctx.strokeStyle = "#3d9a52";
    ctx.lineWidth = 0.035;
    ctx.beginPath();
    ctx.ellipse(0, y, 0.48, 0.14, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    const colors = ["#ff6fa5", "#ffd21e", "#ffffff", "#9d8cff", "#ff8a4c"];
    for (let k = 0; k <= 8; k++) {
      const a = Math.PI + (k * Math.PI) / 8;
      const x = Math.cos(a) * 0.48;
      const yy = y + Math.sin(a) * 0.14;
      const r = k % 2 ? 0.055 : 0.075;
      if (k % 2) {
        ctx.fillStyle = "#4caf63";
        ctx.beginPath();
        ctx.ellipse(x, yy - 0.02, r * 0.5, r * 1.1, a + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.fillStyle = colors[(k / 2) % colors.length];
      for (let p = 0; p < 5; p++) {
        const pa = (p * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(x + Math.cos(pa) * r * 0.7, yy + Math.sin(pa) * r * 0.7, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ffc400";
      ctx.beginPath();
      ctx.arc(x, yy, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
  }),

  pirate: ({ ctx, eye, top }) => {
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 0.025;
    ctx.beginPath();
    ctx.moveTo(-0.52, top + 0.2);
    ctx.lineTo(eye / 2, -0.02);
    ctx.lineTo(0.56, 0.08);
    ctx.stroke();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.ellipse(eye / 2, 0.01, eye * 0.42, eye * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    // 해골 표시
    ctx.fillStyle = "#f2f2f2";
    ctx.beginPath();
    ctx.arc(eye / 2, -0.005, eye * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(eye / 2 + s * eye * 0.045, -0.01, eye * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  sparkle: ({ ctx, top, mouth }) => {
    const pts: [number, number, number, RGB][] = [
      [-0.62, top + 0.1, 0.09, YELLOW],
      [0.6, top + 0.02, 0.07, SKY_PALE],
      [0.66, mouth - 0.1, 0.08, YELLOW],
      [-0.66, mouth - 0.2, 0.06, PINK],
      [-0.36, top - 0.18, 0.05, SKY_PALE],
      [0.34, top - 0.22, 0.06, PINK],
    ];
    for (const [x, y, r, c] of pts) {
      ctx.fillStyle = rgb(c);
      ctx.beginPath();
      ctx.moveTo(x, y - r * 1.6);
      ctx.quadraticCurveTo(x, y, x + r * 1.6, y);
      ctx.quadraticCurveTo(x, y, x, y + r * 1.6);
      ctx.quadraticCurveTo(x, y, x - r * 1.6, y);
      ctx.quadraticCurveTo(x, y, x, y - r * 1.6);
      ctx.fill();
    }
    // 볼 터치
    ctx.fillStyle = "rgba(255,111,165,0.35)";
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(s * 0.3, mouth - 0.12, 0.09, 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

function heartPath(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.75);
  ctx.bezierCurveTo(cx - r * 1.2, cy - r * 0.05, cx - r * 0.55, cy - r * 0.9, cx, cy - r * 0.35);
  ctx.bezierCurveTo(cx + r * 0.55, cy - r * 0.9, cx + r * 1.2, cy - r * 0.05, cx, cy + r * 0.75);
  ctx.closePath();
}

/** 별 하나를 칠합니다 */
function starPath(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const rr = k % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

/** 머리띠 (귀 소품 공통) */
function headband(ctx: Ctx, y: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.05;
  ctx.beginPath();
  ctx.ellipse(0, y, 0.47, 0.2, 0, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
}

/** 챙 달린 모자 (캡틴 · 경찰) */
function peakedCap(ctx: Ctx, faceTop: number, topColor: string, bandColor: string, badge: "anchor" | "star") {
  const brimY = faceTop + 0.02;
  const w = 1.15;

  ctx.fillStyle = bandColor;
  ctx.beginPath();
  ctx.moveTo(-0.4 * w, brimY);
  ctx.lineTo(-0.44 * w, brimY - 0.24 * w);
  ctx.lineTo(0.44 * w, brimY - 0.24 * w);
  ctx.lineTo(0.4 * w, brimY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#E8B931";
  ctx.lineWidth = 0.022 * w;
  ctx.beginPath();
  ctx.moveTo(-0.41 * w, brimY - 0.06 * w);
  ctx.lineTo(0.41 * w, brimY - 0.06 * w);
  ctx.stroke();

  ctx.fillStyle = topColor;
  ctx.strokeStyle = badge === "anchor" ? "#C9CED6" : "#0d1526";
  ctx.lineWidth = 0.012 * w;
  ctx.beginPath();
  ctx.ellipse(0, brimY - 0.26 * w, 0.54 * w, 0.13 * w, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const brim = ctx.createLinearGradient(0, brimY, 0, brimY + 0.1 * w);
  brim.addColorStop(0, "#2a2d33");
  brim.addColorStop(1, "#050506");
  ctx.fillStyle = brim;
  ctx.beginPath();
  ctx.ellipse(0, brimY, 0.41 * w, 0.1 * w, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  const by = brimY - 0.14 * w;
  const br = 0.075 * w;
  ctx.fillStyle = "#E8B931";
  ctx.beginPath();
  if (badge === "anchor") {
    ctx.arc(0, by, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = bandColor;
    ctx.lineWidth = br * 0.16;
    ctx.beginPath();
    ctx.moveTo(0, by - br * 0.6);
    ctx.lineTo(0, by + br * 0.55);
    ctx.moveTo(-br * 0.35, by - br * 0.25);
    ctx.lineTo(br * 0.35, by - br * 0.25);
    ctx.moveTo(-br * 0.55, by + br * 0.1);
    ctx.quadraticCurveTo(0, by + br * 0.95, br * 0.55, by + br * 0.1);
    ctx.stroke();
  } else {
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? br * 0.5 : br * 1.15;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      ctx.lineTo(Math.cos(a) * r, by + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  }
}

// ── 픽셀 연산 ───────────────────────────────────────────────

function pixels(ctx: Ctx, size: number, fn: (d: Uint8ClampedArray) => void) {
  const img = ctx.getImageData(0, 0, size, size);
  fn(img.data);
  ctx.putImageData(img, 0, 0);
}

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function mix(a: RGB, b: RGB, t: number): [number, number, number] {
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

/** 사람 부분에만 비네팅 */
function vignette(ctx: Ctx, size: number, strength: number) {
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalCompositeOperation = "source-over";
}

/** 작게 줄인 사본 — 다시 키워 그리면 흐려져 광채 · 번짐이 됩니다. */
function softCopy(src: HTMLCanvasElement, ratio: number): HTMLCanvasElement {
  const n = Math.max(8, Math.round(src.width * ratio));
  const small = document.createElement("canvas");
  small.width = small.height = n;
  small.getContext("2d")!.drawImage(src, 0, 0, n, n);
  return small;
}

function overlay(ctx: Ctx, img: HTMLCanvasElement, mode: GlobalCompositeOperation, alpha: number) {
  ctx.globalCompositeOperation = mode;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function grayOf(d: Uint8ClampedArray): Float32Array {
  const g = new Float32Array(d.length / 4);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) g[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  return g;
}

function writeGray(d: Uint8ClampedArray, g: Float32Array, fn: (v: number, p: number) => number) {
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const v = fn(g[p], p);
    d[i] = d[i + 1] = d[i + 2] = v;
  }
}

/** 노출이 제각각이어도 결과가 비슷하도록 사람 부분의 밝기 범위를 0~255로 늘립니다. */
function normalize(g: Float32Array, d: Uint8ClampedArray, clip: number): Float32Array {
  const person: number[] = [];
  for (let p = 0; p < g.length; p++) if (d[p * 4 + 3] > 128) person.push(g[p]);
  const sorted = (person.length > 100 ? Float32Array.from(person) : Float32Array.from(g)).sort();
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

function roundRectPath(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
