// ─────────────────────────────────────────────────────────────
// 미래 명함 — 명함 그리기 도우미 (글자 · 도형 · 사람 사진 · 장식)
// ─────────────────────────────────────────────────────────────

import type { FutureCardBrand } from "./brand";
import type { CardInfo } from "./presets";

export type Ctx = CanvasRenderingContext2D;

/** 명함 디자인 하나 — 배경을 지운 얼굴(정사각형)과 입력 내용으로 명함 전체를 그립니다. */
export type DrawFn = (ctx: Ctx, face: HTMLCanvasElement, info: CardInfo, brand: FutureCardBrand) => void;

/** 명함 비율 90×50mm 를 1800×1000px 로 그립니다 (인쇄 시 약 500dpi). */
export const CARD_W = 1800;
export const CARD_H = 1000;

const FALLBACK = '-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';

export const FONTS = {
  sans: `"Pretendard Variable", Pretendard, ${FALLBACK}`,
  jua: `Jua, "Pretendard Variable", ${FALLBACK}`,
  fun: `Fredoka, Jua, "Pretendard Variable", ${FALLBACK}`,
  hand: `Gaegu, Jua, ${FALLBACK}`,
} as const;
export type FontKey = keyof typeof FONTS;

/** KMOU 포스터 색 */
export const C = {
  navy: "#0B3A79",
  navyDeep: "#062A5C",
  navySoft: "#14509B",
  ocean: "#1B6FC4",
  oceanLight: "#3E9BE0",
  oceanPale: "#9ED8F5",
  oceanMist: "#DCEEFB",
  sun: "#FFD200",
  sunDeep: "#F5B800",
  ink: "#12203A",
  inkSoft: "#3D4C68",
  inkMuted: "#6B7A96",
  inkLine: "#DCE3ED",
};

/** 경동대 Fun Fun Job Festival 포스터 색 */
export const K = {
  sky: "#08A0F6",
  skyMid: "#3EC3FE",
  skyLight: "#8FD6FB",
  skyPale: "#E3F5FE",
  navy: "#13399A",
  navyDeep: "#0B2A78",
  yellow: "#FFD21E",
  pink: "#E4457A",
  pinkPale: "#FFE3EC",
  ink: "#1B2559",
};

export interface TextOpt {
  size: number;
  weight: number;
  /** 기본 Pretendard — 경동대 디자인은 jua(주아) · fun(Fredoka) · hand(개구) */
  family?: FontKey;
  color: string;
  maxW?: number;
  align?: CanvasTextAlign;
}

export const font = (weight: number, size: number, family: FontKey = "sans") => `${weight} ${size}px ${FONTS[family]}`;

/** maxW 에 들어갈 때까지 글자 크기를 줄이고, 정한 크기를 돌려줍니다 (ctx.font 도 맞춰 둠). */
export function fitFont(ctx: Ctx, s: string, weight: number, size: number, maxW?: number, family: FontKey = "sans"): number {
  ctx.font = font(weight, size, family);
  if (!maxW) return size;
  const min = Math.round(size * 0.55);
  while (size > min && ctx.measureText(s).width > maxW) {
    size -= 2;
    ctx.font = font(weight, size, family);
  }
  return size;
}

export function text(ctx: Ctx, s: string, x: number, y: number, o: TextOpt) {
  s = s.trim();
  if (!s) return;
  fitFont(ctx, s, o.weight, o.size, o.maxW, o.family);
  ctx.fillStyle = o.color;
  ctx.textAlign = o.align ?? "left";
  // 최소 크기로도 넘치면 가로로 눌러서라도 칸 안에 넣습니다.
  if (o.maxW) ctx.fillText(s, x, y, o.maxW);
  else ctx.fillText(s, x, y);
}

export const quote = (s: string) => (s.trim() ? `“${s.trim()}”` : "");

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function circle(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/** 정사각형 얼굴 사진을 칸 비율에 맞게 가운데를 잘라 채웁니다. */
export function drawCover(ctx: Ctx, img: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
  const s = img.width;
  const ratio = w / h;
  const sw = ratio < 1 ? s * ratio : s;
  const sh = ratio < 1 ? s : s / ratio;
  ctx.drawImage(img, (s - sw) / 2, (s - sh) / 2, sw, sh, x, y, w, h);
}

export function wave(ctx: Ctx, baseY: number, amp: number, len: number, phase: number, color: string) {
  ctx.beginPath();
  ctx.moveTo(0, CARD_H);
  for (let x = 0; x <= CARD_W; x += 20) {
    ctx.lineTo(x, baseY + amp * Math.sin((x / len) * Math.PI * 2 + phase));
  }
  ctx.lineTo(CARD_W, CARD_H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function anchor(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y - r * 0.75, r * 0.16, 0, Math.PI * 2);
  ctx.moveTo(x, y - r * 0.59);
  ctx.lineTo(x, y + r * 0.85);
  ctx.moveTo(x - r * 0.4, y - r * 0.3);
  ctx.lineTo(x + r * 0.4, y - r * 0.3);
  ctx.moveTo(x - r * 0.75, y + r * 0.2);
  ctx.quadraticCurveTo(x - r * 0.6, y + r * 0.85, x, y + r * 0.85);
  ctx.quadraticCurveTo(x + r * 0.6, y + r * 0.85, x + r * 0.75, y + r * 0.2);
  ctx.stroke();
  ctx.restore();
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** 이름으로 정해지는 장식용 바코드 */
export function barcode(ctx: Ctx, x: number, y: number, w: number, h: number, seed: string, color: string = C.ink) {
  let n = hash(seed) || 1;
  ctx.fillStyle = color;
  let cx = x;
  while (cx < x + w) {
    n = (Math.imul(n, 1103515245) + 12345) >>> 0;
    const bar = 3 + (n % 4) * 3;
    if (cx + bar > x + w) break;
    ctx.fillRect(cx, y, bar, h);
    cx += bar + 3 + ((n >>> 8) % 3) * 3;
  }
}

// ── 경동대 디자인용 ──────────────────────────────────────────

/** 포스터 제목처럼 외곽선 + 아래로 쌓인 두께가 있는 글자 */
export function text3d(
  ctx: Ctx,
  s: string,
  x: number,
  y: number,
  o: TextOpt & { outline: string; depth?: string },
) {
  s = s.trim();
  if (!s) return;
  const family = o.family ?? "jua";
  const size = fitFont(ctx, s, o.weight, o.size, o.maxW, family);
  const ow = Math.max(4, size * 0.11);
  ctx.save();
  ctx.textAlign = o.align ?? "left";
  ctx.lineJoin = "round";
  ctx.lineWidth = ow * 2;
  const draw = (fn: "strokeText" | "fillText", dy: number) =>
    o.maxW ? ctx[fn](s, x, y + dy, o.maxW) : ctx[fn](s, x, y + dy);
  if (o.depth) {
    ctx.strokeStyle = ctx.fillStyle = o.depth;
    for (let k = 1; k <= 4; k++) draw("strokeText", size * 0.025 * k);
  }
  ctx.strokeStyle = o.outline;
  draw("strokeText", 0);
  ctx.fillStyle = o.color;
  draw("fillText", 0);
  ctx.restore();
}

/** 배경을 지운 사람 사진 (정사각형) — 그림자를 주면 카드 위에 떠 보입니다. */
export function drawPerson(ctx: Ctx, face: HTMLCanvasElement, x: number, y: number, size: number, shadow?: string) {
  ctx.save();
  if (shadow) {
    ctx.shadowColor = shadow;
    ctx.shadowBlur = size * 0.05;
    ctx.shadowOffsetY = size * 0.02;
  }
  ctx.drawImage(face, x, y, size, size);
  ctx.restore();
}

/** 사람 실루엣 바깥으로 두께 t 만큼 테두리 (스티커 느낌) */
export function silhouetteOutline(
  ctx: Ctx,
  face: HTMLCanvasElement,
  x: number,
  y: number,
  size: number,
  color: string,
  t: number,
) {
  const sil = document.createElement("canvas");
  sil.width = sil.height = face.width;
  const sctx = sil.getContext("2d")!;
  sctx.drawImage(face, 0, 0);
  sctx.globalCompositeOperation = "source-in";
  sctx.fillStyle = color;
  sctx.fillRect(0, 0, sil.width, sil.height);
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    ctx.drawImage(sil, x + Math.cos(a) * t, y + Math.sin(a) * t, size, size);
  }
}

/** 이름 등으로 정해지는 의사 난수 (같은 입력이면 같은 장식) */
export function seeded(seed: string): () => number {
  let n = hash(seed) || 1;
  return () => {
    n = (Math.imul(n, 1103515245) + 12345) >>> 0;
    return (n >>> 8) / 0x1000000;
  };
}

/** 포스터의 색종이 */
export function confetti(
  ctx: Ctx,
  seed: string,
  count: number,
  colors: readonly string[],
  area = { x: 0, y: 0, w: CARD_W, h: CARD_H },
) {
  const rand = seeded(seed);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = area.x + rand() * area.w;
    const y = area.y + rand() * area.h;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand() * Math.PI);
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.85;
    const w = 10 + rand() * 12;
    const h = rand() < 0.5 ? w : w * 2.4;
    roundRect(ctx, -w / 2, -h / 2, w, h, 3);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/** 말풍선 — (x, y) 중심의 타원 + (tx, ty) 를 가리키는 꼬리 */
export function speechBubble(ctx: Ctx, x: number, y: number, rx: number, ry: number, tx: number, ty: number, fill: string) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  const ang = Math.atan2(ty - y, tx - x);
  const bx = x + Math.cos(ang) * rx * 0.7;
  const by = y + Math.sin(ang) * ry * 0.7;
  const px = Math.cos(ang + Math.PI / 2) * ry * 0.28;
  const py = Math.sin(ang + Math.PI / 2) * ry * 0.28;
  ctx.beginPath();
  ctx.moveTo(bx + px, by + py);
  ctx.lineTo(tx, ty);
  ctx.lineTo(bx - px, by - py);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 별 모양 딱지 */
export function starburst(ctx: Ctx, cx: number, cy: number, r: number, points: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let k = 0; k < points * 2; k++) {
    const rr = k % 2 ? r * 0.78 : r;
    const a = -Math.PI / 2 + (k * Math.PI) / points;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 긴 문장을 가운데 가까운 띄어쓰기에서 두 줄로 */
export function splitTwo(s: string): string[] {
  s = s.trim();
  if (s.length <= 11) return [s];
  const mid = s.length / 2;
  let best = -1;
  for (let i = 0; i < s.length; i++) if (s[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return best < 0 ? [s] : [s.slice(0, best), s.slice(best + 1)];
}

// ── 이미지 (마스코트 등) ─────────────────────────────────────

const images = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<HTMLImageElement>>();

/** 같은 그림을 동시에 여러 번 불러도 한 번만 받고, 모두 같은 결과를 받습니다. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = images.get(src);
  if (cached?.complete && cached.naturalWidth) return Promise.resolve(cached);
  let p = pending.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        images.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    }).finally(() => pending.delete(src));
    pending.set(src, p);
  }
  return p;
}

/** 이미 불러온 이미지만 돌려줍니다 (그리기는 동기라 미리 loadImage 로 받아 둠) */
export function readyImage(src: string): HTMLImageElement | undefined {
  const img = images.get(src);
  return img?.complete && img.naturalWidth ? img : undefined;
}
