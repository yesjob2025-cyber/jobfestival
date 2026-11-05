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

/** 배경 꾸미기 — 촬영 화면에서 고르고 실시간으로 미리 봐요 (찍은 뒤에도 바꿀 수 있음) */
export const BACKS = [
  { id: "original", name: "원본 그대로", emoji: "📷" },
  { id: "sky", name: "구름 하늘", emoji: "☁️" },
  { id: "pink", name: "러블리 하트", emoji: "💖" },
  { id: "stars", name: "별빛 밤하늘", emoji: "🌙" },
  { id: "party", name: "축하 파티", emoji: "🎉" },
  { id: "blossom", name: "벚꽃", emoji: "🌸" },
  { id: "studio", name: "화이트 스튜디오", emoji: "🤍" },
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

/** 배경 그리기 (네컷 칸 · 촬영 미리 보기 같이 씀) — 같은 배경은 늘 같은 무늬 */
export function paintBack(ctx: Ctx, back: BackId, x: number, y: number, w: number, h: number) {
  if (back === "original") return;
  const u = Math.min(w, h) / 100; // 무늬 크기 단위
  const rnd = (n: number) => {
    const v = Math.sin(n * 127.1 + back.length * 31.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  const stops: Record<Exclude<BackId, "original">, [string, string]> = {
    sky: ["#5EC8FF", "#DDF4FF"],
    pink: ["#FF9FC0", "#FFE4EE"],
    stars: ["#08133D", "#2B3D8F"],
    party: ["#FFF4C2", "#FFD3E2"],
    blossom: ["#FFE7EF", "#FFF8FA"],
    studio: ["#FFFFFF", "#E6EBF2"],
  };
  const [c0, c1] = stops[back];
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);

  if (back === "sky") {
    // 해 + 뭉게구름
    const sun = ctx.createRadialGradient(x + w * 0.82, y + h * 0.16, 0, x + w * 0.82, y + h * 0.16, 18 * u);
    sun.addColorStop(0, "rgba(255,240,150,0.95)");
    sun.addColorStop(1, "rgba(255,240,150,0)");
    ctx.fillStyle = sun;
    ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 6; i++) cloud(ctx, x + rnd(i) * w, y + h * (0.08 + rnd(i + 9) * 0.5), (7 + rnd(i + 3) * 7) * u);
  } else if (back === "pink") {
    for (let i = 0; i < 22; i++) {
      ctx.globalAlpha = 0.35 + rnd(i + 5) * 0.5;
      heart(ctx, x + rnd(i) * w, y + rnd(i + 40) * h, (2.5 + rnd(i + 2) * 5) * u, i % 3 ? "#FFFFFF" : K.pink);
    }
    ctx.globalAlpha = 1;
  } else if (back === "stars") {
    ctx.fillStyle = "#FFF3B0";
    ctx.beginPath();
    ctx.arc(x + w * 0.8, y + h * 0.18, 9 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c0;
    ctx.beginPath();
    ctx.arc(x + w * 0.8 + 4 * u, y + h * 0.18 - 3 * u, 8 * u, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 40; i++) {
      const r = (0.6 + rnd(i + 7) * 1.8) * u;
      starburst(ctx, x + rnd(i) * w, y + rnd(i + 70) * h * 0.85, r, 4, `rgba(255,255,255,${0.5 + rnd(i + 3) * 0.5})`);
    }
  } else if (back === "party") {
    // 깃발 줄 두 줄 + 색종이
    const colors = [K.pink, K.sky, K.yellow, "#9BE15D", "#B18CFF"];
    for (const [row, sag] of [
      [0.06, 0.07],
      [0.2, 0.06],
    ]) {
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 0.4 * u;
      ctx.beginPath();
      ctx.moveTo(x, y + h * row);
      ctx.quadraticCurveTo(x + w / 2, y + h * (row + sag * 2), x + w, y + h * row);
      ctx.stroke();
      const n = 9;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const px = x + w * t;
        const py = y + h * (row + sag * 2 * 2 * t * (1 - t));
        ctx.fillStyle = colors[(i + Math.round(row * 10)) % colors.length];
        ctx.beginPath();
        ctx.moveTo(px - 3.5 * u, py);
        ctx.lineTo(px + 3.5 * u, py);
        ctx.lineTo(px, py + 8 * u);
        ctx.closePath();
        ctx.fill();
      }
    }
    for (let i = 0; i < 40; i++) {
      ctx.save();
      ctx.translate(x + rnd(i) * w, y + h * (0.3 + rnd(i + 11) * 0.7));
      ctx.rotate(rnd(i + 5) * Math.PI);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(-1.4 * u, -0.6 * u, 2.8 * u, 1.2 * u);
      ctx.restore();
    }
  } else if (back === "blossom") {
    // 위쪽 가지 + 꽃 + 흩날리는 꽃잎
    ctx.strokeStyle = "#8A5A44";
    ctx.lineCap = "round";
    ctx.lineWidth = 2.4 * u;
    ctx.beginPath();
    ctx.moveTo(x - 2 * u, y + 10 * u);
    ctx.quadraticCurveTo(x + w * 0.35, y + 4 * u, x + w * 0.7, y + 16 * u);
    ctx.moveTo(x + w * 0.4, y + 7 * u);
    ctx.quadraticCurveTo(x + w * 0.48, y + 14 * u, x + w * 0.45, y + 22 * u);
    ctx.stroke();
    for (let i = 0; i < 14; i++) flower(ctx, x + rnd(i) * w * 0.85, y + (4 + rnd(i + 20) * 22) * u, (2.8 + rnd(i + 4) * 2) * u);
    for (let i = 0; i < 26; i++) {
      ctx.save();
      ctx.translate(x + rnd(i + 50) * w, y + h * (0.3 + rnd(i + 60) * 0.7));
      ctx.rotate(rnd(i + 70) * Math.PI * 2);
      ctx.fillStyle = `rgba(255,160,190,${0.5 + rnd(i) * 0.4})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.6 * u, 0.9 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (back === "studio") {
    const r = ctx.createRadialGradient(x + w / 2, y + h * 0.4, 0, x + w / 2, y + h * 0.4, w * 0.7);
    r.addColorStop(0, "rgba(255,255,255,0.9)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = r;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

function cloud(ctx: Ctx, x: number, y: number, r: number) {
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  for (const [dx, dy, k] of [
    [0, 0, 1],
    [0.9, 0.15, 0.8],
    [-0.9, 0.2, 0.75],
    [0.4, -0.45, 0.8],
    [-0.35, -0.35, 0.7],
  ]) {
    ctx.moveTo(x + dx * r + r * k, y + dy * r);
    ctx.arc(x + dx * r, y + dy * r, r * k, 0, Math.PI * 2);
  }
  ctx.fill();
}

function flower(ctx: Ctx, x: number, y: number, r: number) {
  ctx.fillStyle = "#FFB7CD";
  for (let p = 0; p < 5; p++) {
    const a = (p * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r * 0.75, y + Math.sin(a) * r * 0.75, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#FF7FA6";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
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
