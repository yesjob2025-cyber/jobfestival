// ─────────────────────────────────────────────────────────────
// 펀펀 네컷 꾸미기 스티커 — 모두 캔버스로 그려서 파일 없이 씁니다.
// 스티커 하나는 원점 가운데, 지름 약 200 크기로 그리고, 붙인 위치(x · y · 크기 · 각도)로 옮깁니다.
// ─────────────────────────────────────────────────────────────

import { FONTS, K, readyImage, roundRect, type Ctx } from "@/lib/future-card/draw";
import { FUN } from "./config";

type Draw = (ctx: Ctx) => void;

interface StickerDef {
  id: string;
  name: string;
  /** 대략적인 반지름 (실제 크기를 재기 전 기본값) */
  r: number;
  /** 글자 스티커면 고르기 버튼에 글자와 색으로 보여 줌 */
  text?: { bg: string; fg: string };
  draw: Draw;
}

/** 붙인 스티커 — 좌표는 네컷 전체(1200×1800) 기준 */
export interface Placed {
  uid: number;
  id: string;
  x: number;
  y: number;
  scale: number;
  rot: number;
}

const emoji = (ch: string): Draw => (ctx) => {
  ctx.font = `170px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ch, 0, 10);
};

/** 글자 배지 — 둥근 바탕 + 흰 테두리 글자 */
const badge =
  (label: string, bg: string, fg: string, opts: { tilt?: number; size?: number; shape?: "pill" | "burst" } = {}): Draw =>
  (ctx) => {
    const size = opts.size ?? 74;
    ctx.rotate(opts.tilt ?? 0);
    ctx.font = `700 ${size}px ${FONTS.fun}`;
    const w = Math.max(ctx.measureText(label).width + 70, 150);
    const h = size + 50;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.22)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = bg;
    if (opts.shape === "burst") {
      ctx.beginPath();
      const R = w / 2 + 10;
      for (let k = 0; k < 28; k++) {
        const a = (k * Math.PI) / 14;
        const r = k % 2 ? R * 0.84 : R;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.62);
      }
      ctx.closePath();
    } else {
      roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
    }
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#ffffff";
    if (opts.shape !== "burst") {
      roundRect(ctx, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, (h - 16) / 2);
      ctx.stroke();
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.strokeText(label, 0, 4);
    ctx.fillStyle = fg;
    ctx.fillText(label, 0, 4);
  };

function heartPath(ctx: Ctx, r: number) {
  ctx.beginPath();
  ctx.moveTo(0, r * 0.95);
  ctx.bezierCurveTo(-r * 1.7, -r * 0.15, -r * 0.65, -r * 1.35, 0, -r * 0.42);
  ctx.bezierCurveTo(r * 0.65, -r * 1.35, r * 1.7, -r * 0.15, 0, r * 0.95);
  ctx.closePath();
}

function starPath(ctx: Ctx, r: number, inner = 0.45, n = 5) {
  ctx.beginPath();
  for (let k = 0; k < n * 2; k++) {
    const rr = k % 2 ? r * inner : r;
    const a = -Math.PI / 2 + (k * Math.PI) / n;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}

/** 흰 테두리 + 그림자 (스티커 느낌) */
function sticker(ctx: Ctx, path: () => void, fill: string | CanvasGradient) {
  ctx.save();
  path();
  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.lineJoin = "round";
  ctx.lineWidth = 16;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
  ctx.restore();
  path();
  ctx.fillStyle = fill;
  ctx.fill();
}

const shine = (ctx: Ctx, x: number, y: number, rx: number, ry: number) => {
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.6, 0, Math.PI * 2);
  ctx.fill();
};

export const STICKERS: StickerDef[] = [
  { id: "chwippo", name: "취뽀!", r: 120, draw: badge("취뽀!", K.pink, "#ffffff", { tilt: -0.12 }), text: { bg: K.pink, fg: "#ffffff" } },
  { id: "pass", name: "합격", r: 110, draw: badge("합격", K.yellow, K.navyDeep, { shape: "burst", size: 80 }), text: { bg: K.yellow, fg: K.navyDeep } },
  { id: "final", name: "최종합격", r: 150, draw: badge("최종합격", K.navy, K.yellow, { tilt: 0.06 }), text: { bg: K.navy, fg: K.yellow } },
  { id: "funfun", name: "Fun Fun", r: 140, draw: badge("Fun Fun", K.sky, "#ffffff", { tilt: -0.08 }), text: { bg: K.sky, fg: "#ffffff" } },
  { id: "dream", name: "꿈은 이루어진다", r: 200, draw: badge("꿈은 이루어진다", "#ffffff", K.pink, { size: 56 }), text: { bg: "#ffffff", fg: K.pink } },
  { id: "fighting", name: "화이팅!", r: 120, draw: badge("화이팅!", "#FF8A3D", "#ffffff", { tilt: 0.1 }), text: { bg: "#FF8A3D", fg: "#ffffff" } },
  { id: "kdu", name: "KDU", r: 100, draw: badge("KDU", K.navyDeep, "#ffffff", { size: 80 }), text: { bg: K.navyDeep, fg: "#ffffff" } },
  { id: "love", name: "LOVE", r: 110, draw: badge("LOVE", "#FF6FA5", "#ffffff", { shape: "burst", size: 70 }), text: { bg: "#FF6FA5", fg: "#ffffff" } },
  {
    id: "mascot",
    name: "마스코트",
    r: 110,
    draw: (ctx) => {
      const img = readyImage(FUN.mascot);
      if (!img) return;
      const h = 220;
      const w = (h * img.naturalWidth) / img.naturalHeight;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    },
  },
  {
    id: "heart",
    name: "하트",
    r: 90,
    draw: (ctx) => {
      const g = ctx.createLinearGradient(0, -90, 0, 90);
      g.addColorStop(0, "#FF8DB8");
      g.addColorStop(1, K.pink);
      sticker(ctx, () => heartPath(ctx, 80), g);
      shine(ctx, -38, -38, 18, 10);
    },
  },
  {
    id: "star",
    name: "별",
    r: 90,
    draw: (ctx) => {
      const g = ctx.createLinearGradient(0, -90, 0, 90);
      g.addColorStop(0, "#FFE680");
      g.addColorStop(1, "#F5B800");
      sticker(ctx, () => starPath(ctx, 92), g);
      shine(ctx, -20, -30, 14, 8);
    },
  },
  {
    id: "crown",
    name: "왕관",
    r: 100,
    draw: (ctx) => {
      const g = ctx.createLinearGradient(0, -80, 0, 60);
      g.addColorStop(0, "#FFE680");
      g.addColorStop(1, "#E8A800");
      sticker(ctx, () => {
        ctx.beginPath();
        ctx.moveTo(-100, 60);
        ctx.lineTo(-110, -60);
        ctx.lineTo(-50, -10);
        ctx.lineTo(0, -85);
        ctx.lineTo(50, -10);
        ctx.lineTo(110, -60);
        ctx.lineTo(100, 60);
        ctx.closePath();
      }, g);
      for (const [x, y, c] of [[-110, -60, K.pink], [0, -85, K.sky], [110, -60, K.pink], [0, 30, K.sky]] as const) {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: "sparkle",
    name: "반짝",
    r: 90,
    draw: (ctx) => {
      const spark = (x: number, y: number, r: number, c: string) => {
        sticker(ctx, () => {
          ctx.beginPath();
          ctx.moveTo(x, y - r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.quadraticCurveTo(x, y, x, y + r);
          ctx.quadraticCurveTo(x, y, x - r, y);
          ctx.quadraticCurveTo(x, y, x, y - r);
        }, c);
      };
      spark(-20, 10, 80, K.yellow);
      spark(60, -60, 38, K.sky);
      spark(55, 65, 28, K.pink);
    },
  },
  {
    id: "bubble",
    name: "말풍선",
    r: 110,
    draw: (ctx) => {
      sticker(ctx, () => {
        ctx.beginPath();
        ctx.ellipse(0, -10, 115, 75, 0, 0, Math.PI * 2);
        ctx.moveTo(-40, 55);
        ctx.lineTo(-70, 105);
        ctx.lineTo(0, 62);
      }, "#ffffff");
      ctx.font = `700 64px ${FONTS.fun}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = K.navyDeep;
      ctx.fillText("HI!", 0, -6);
    },
  },
  {
    id: "ribbon",
    name: "리본",
    r: 100,
    draw: (ctx) => {
      for (const s of [-1, 1]) {
        sticker(ctx, () => {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(s * 60, -90, s * 130, -60, s * 110, 0);
          ctx.bezierCurveTo(s * 130, 60, s * 60, 90, 0, 0);
        }, "#FF6FA5");
      }
      ctx.fillStyle = K.pink;
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      shine(ctx, -70, -25, 16, 8);
      shine(ctx, 70, -25, 16, 8);
    },
  },
  {
    id: "rainbow",
    name: "무지개",
    r: 110,
    draw: (ctx) => {
      const colors = ["#FF6B6B", "#FFA94D", "#FFD43B", "#69DB7C", "#4DABF7", "#9775FA"];
      ctx.lineCap = "round";
      ctx.lineWidth = 40;
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 50, 100, Math.PI, 0);
      ctx.lineWidth = 120;
      ctx.stroke();
      colors.forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.arc(0, 50, 140 - i * 16, Math.PI, 0);
        ctx.stroke();
      });
      for (const s of [-1, 1]) {
        ctx.fillStyle = "#ffffff";
        for (const [dx, r] of [[-22, 26], [10, 32], [40, 22]]) {
          ctx.beginPath();
          ctx.arc(s * 100 + dx, 58, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
  },
  {
    id: "flower",
    name: "꽃",
    r: 90,
    draw: (ctx) => {
      sticker(ctx, () => {
        ctx.beginPath();
        for (let p = 0; p < 6; p++) {
          const a = (p * Math.PI) / 3;
          ctx.moveTo(Math.cos(a) * 50 + 42, Math.sin(a) * 50);
          ctx.arc(Math.cos(a) * 50, Math.sin(a) * 50, 42, 0, Math.PI * 2);
        }
      }, "#FFB3CC");
      ctx.fillStyle = K.yellow;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  { id: "party", name: "🎉", r: 95, draw: emoji("🎉") },
  { id: "suit", name: "💼", r: 95, draw: emoji("💼") },
  { id: "grad", name: "🎓", r: 95, draw: emoji("🎓") },
  { id: "thumb", name: "👍", r: 95, draw: emoji("👍") },
  { id: "fire", name: "🔥", r: 95, draw: emoji("🔥") },
  { id: "cool", name: "😎", r: 95, draw: emoji("😎") },
  { id: "clover", name: "🍀", r: 95, draw: emoji("🍀") },
];

const BY_ID = new Map(STICKERS.map((s) => [s.id, s]));

/** 스티커 글자에 쓰는 글꼴을 미리 받을 때 넘길 글자들 */
export const STICKER_TEXT = "취뽀!합격최종합격Fun Fun꿈은 이루어진다화이팅!KDULOVEHI!";

/** 스티커 실제 크기 (가운데 기준 반폭 · 반높이) — 한 번 그려 보고 기억합니다 */
const extents = new Map<string, { hw: number; hh: number }>();
export function stickerExtent(id: string): { hw: number; hh: number } {
  const hit = extents.get(id);
  if (hit) return hit;
  const def = BY_ID.get(id);
  const N = 640;
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.translate(N / 2, N / 2);
  def?.draw(ctx);
  const d = ctx.getImageData(0, 0, N, N).data;
  let hw = 0;
  let hh = 0;
  for (let y = 0; y < N; y += 2)
    for (let x = 0; x < N; x += 2)
      if (d[(y * N + x) * 4 + 3] > 40) {
        hw = Math.max(hw, Math.abs(x - N / 2));
        hh = Math.max(hh, Math.abs(y - N / 2));
      }
  const out = hw && hh ? { hw, hh } : { hw: def?.r ?? 100, hh: def?.r ?? 100 };
  // 아직 글꼴 · 그림을 못 받아 비어 있으면 기억하지 않음
  if (hw && hh) extents.set(id, out);
  return out;
}

/** 점(네컷 좌표)이 스티커 위인지 — 돌린 사각형으로 판정 (여유 20) */
export function hitSticker(p: Placed, x: number, y: number) {
  const { hw, hh } = stickerExtent(p.id);
  const dx = x - p.x;
  const dy = y - p.y;
  const c = Math.cos(-p.rot);
  const s = Math.sin(-p.rot);
  const lx = (dx * c - dy * s) / p.scale;
  const ly = (dx * s + dy * c) / p.scale;
  return Math.abs(lx) < hw + 20 && Math.abs(ly) < hh + 20;
}

/** 붙인 스티커들을 그립니다 (ctx 는 1200×1800 좌표) */
export function drawStickers(ctx: Ctx, placed: Placed[]) {
  for (const p of placed) {
    const def = BY_ID.get(p.id);
    if (!def) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(p.scale, p.scale);
    def.draw(ctx);
    ctx.restore();
  }
}

/** 고르기 버튼용 견본 그림 */
export function stickerThumb(id: string, size = 120): string {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const def = BY_ID.get(id)!;
  const { hw, hh } = stickerExtent(id);
  const k = (size * 0.46) / Math.max(hw, hh, 60);
  ctx.translate(size / 2, size / 2);
  ctx.scale(k, k);
  def.draw(ctx);
  return c.toDataURL("image/png");
}
