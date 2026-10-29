// ─────────────────────────────────────────────────────────────
// 펀펀 네컷 — 2×2 네 컷 사진 (1200×1800, 4×6 사진 비율)
// ─────────────────────────────────────────────────────────────

import { confetti, K, readyImage, roundRect, starburst, text, type Ctx } from "@/lib/future-card/draw";
import { applyFilter, type FilterId } from "@/lib/future-card/faces";
import { FUN } from "./config";
import { drawStickers, type Placed } from "./stickers";

export const FOUR_W = 1200;
export const FOUR_H = 1800;

export const FRAMES = [
  { id: "sky", name: "펀펀 스카이" },
  { id: "navy", name: "네이비 옐로" },
  { id: "pink", name: "핑크 하트" },
  { id: "film", name: "블랙 필름" },
] as const;
export type FrameId = (typeof FRAMES)[number]["id"];

export const BACKS = [
  { id: "original", name: "원본 그대로" },
  { id: "sky", name: "하늘" },
  { id: "pink", name: "핑크" },
  { id: "stars", name: "밤하늘" },
  { id: "studio", name: "화이트 스튜디오" },
] as const;
export type BackId = (typeof BACKS)[number]["id"];

export const FOUR_FILTERS: { id: FilterId; name: string }[] = [
  { id: "natural", name: "내추럴" },
  { id: "glow", name: "뽀샤시" },
  { id: "mono", name: "흑백" },
  { id: "film", name: "필름" },
  { id: "webtoon", name: "웹툰" },
  { id: "duotone", name: "블루" },
];

export interface Shot {
  original: HTMLCanvasElement;
  /** 배경을 지운 사진 (아직 처리 중이면 null) */
  cutout: HTMLCanvasElement | null;
}

const CELL = { w: 520, h: 640, gap: 40, top: 200, left: 60 };

/** 한 칸 그림 — 배경 + 사진(필터 적용) */
function drawCell(ctx: Ctx, shot: Shot, x: number, y: number, back: BackId, filter: FilterId) {
  const { w, h } = CELL;
  ctx.save();
  roundRect(ctx, x, y, w, h, 18);
  ctx.clip();
  const useCutout = back !== "original" && shot.cutout;
  if (useCutout) paintBack(ctx, back, x, y, w, h);
  const src = applyFilter(useCutout ? shot.cutout! : shot.original, filter, 720);
  // 정사각형 사진을 칸 비율(세로가 긴)로 가운데 맞춰 채움
  const s = src.width;
  const ratio = w / h;
  const sw = s * ratio;
  ctx.drawImage(src, (s - sw) / 2, 0, sw, s, x, y, w, h);
  ctx.restore();
}

function paintBack(ctx: Ctx, back: BackId, x: number, y: number, w: number, h: number) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  if (back === "sky") {
    g.addColorStop(0, K.sky);
    g.addColorStop(1, K.skyLight);
  } else if (back === "pink") {
    g.addColorStop(0, "#FF9FC0");
    g.addColorStop(1, K.pinkPale);
  } else if (back === "stars") {
    g.addColorStop(0, "#0A1A4F");
    g.addColorStop(1, K.navy);
  } else {
    g.addColorStop(0, "#FFFFFF");
    g.addColorStop(1, "#E6EBF2");
  }
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  if (back === "stars") {
    for (let i = 0; i < 26; i++) {
      const sx = x + ((i * 97) % w);
      const sy = y + ((i * 53) % (h * 0.6));
      starburst(ctx, sx, sy, 4 + (i % 3) * 3, 4, "rgba(255,255,255,0.8)");
    }
  }
}

export function renderFourCut(
  shots: Shot[],
  frame: FrameId,
  back: BackId,
  filter: FilterId,
  scale = 1,
  stickers: Placed[] = [],
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = FOUR_W * scale;
  canvas.height = FOUR_H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.textBaseline = "alphabetic";

  const theme = {
    sky: { bg: [K.sky, K.skyLight], title: "#fff", sub: K.navyDeep },
    navy: { bg: [K.navyDeep, K.navy], title: K.yellow, sub: "#fff" },
    pink: { bg: ["#FFC2D6", K.pinkPale], title: K.pink, sub: K.navyDeep },
    film: { bg: ["#111114", "#1d1d22"], title: "#fff", sub: "rgba(255,255,255,0.7)" },
  }[frame];
  const g = ctx.createLinearGradient(0, 0, 0, FOUR_H);
  g.addColorStop(0, theme.bg[0]);
  g.addColorStop(1, theme.bg[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, FOUR_W, FOUR_H);

  if (frame === "sky" || frame === "navy") confetti(ctx, "fourcut" + frame, 26, [K.yellow, "#ffffff", K.pink, "#9BE15D"], { x: 0, y: 0, w: FOUR_W, h: 180 });
  if (frame === "pink") {
    for (const [x, y] of [[90, 90], [1110, 110], [600, 70], [1100, 1650]]) heart(ctx, x, y, 26, K.pink);
  }
  if (frame === "film") {
    ctx.fillStyle = "#2c2c33";
    for (let y = 30; y < FOUR_H; y += 70) {
      roundRect(ctx, 14, y, 26, 40, 6);
      ctx.fill();
      roundRect(ctx, FOUR_W - 40, y, 26, 40, 6);
      ctx.fill();
    }
  }

  text(ctx, "Fun Fun 네컷", FOUR_W / 2, 140, { size: 92, weight: 700, color: theme.title, align: "center", family: "fun" });

  shots.slice(0, 4).forEach((shot, i) => {
    const x = CELL.left + (i % 2) * (CELL.w + CELL.gap);
    const y = CELL.top + Math.floor(i / 2) * (CELL.h + CELL.gap);
    drawCell(ctx, shot, x, y, back, filter);
  });

  const d = new Date();
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  text(ctx, FUN.festival, 80, 1640, { size: 56, weight: 700, color: theme.title, family: "fun" });
  text(ctx, `${FUN.school} · ${date}`, 80, 1712, { size: 38, weight: 700, color: theme.sub });
  const lion = readyImage(FUN.mascot);
  if (lion) ctx.drawImage(lion, FOUR_W - 250, 1555, 170, (170 * lion.naturalHeight) / lion.naturalWidth);
  drawStickers(ctx, stickers);
  return canvas;
}

function heart(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.9);
  ctx.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.6, y - r * 1.3, x, y - r * 0.4);
  ctx.bezierCurveTo(x + r * 0.6, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9);
  ctx.fill();
  ctx.restore();
}
