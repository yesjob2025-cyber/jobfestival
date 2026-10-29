// ─────────────────────────────────────────────────────────────
// 이력서 사진 — 배경을 지운 사진에 그림 정장을 입히고, 증명사진 비율(3:4)로 맞춥니다.
//
// 얼굴 위치(FaceGeom)로 정수리 · 턱을 어림해 머리 길이가 사진 높이의 약 52%가 되게 맞추고,
// 정장은 목 아래에 얼굴 폭 기준 크기로 그립니다.
// ─────────────────────────────────────────────────────────────

import { applyFilter, type FaceGeom } from "@/lib/future-card/faces";
import type { Ctx } from "@/lib/future-card/draw";

export const ID_W = 900;
export const ID_H = 1200;

export const OUTFITS = [
  { id: "suitTie", name: "정장 + 넥타이" },
  { id: "suit", name: "정장 (노타이)" },
  { id: "suitW", name: "여성 정장" },
  { id: "shirtTie", name: "셔츠 + 넥타이" },
] as const;
export type OutfitId = (typeof OUTFITS)[number]["id"];

export const SUIT_COLORS = [
  { id: "navy", name: "네이비", base: "#1F2C4A" },
  { id: "charcoal", name: "차콜", base: "#383B42" },
  { id: "black", name: "블랙", base: "#16171B" },
  { id: "beige", name: "베이지", base: "#B49E80" },
] as const;
export type SuitColorId = (typeof SUIT_COLORS)[number]["id"];

export const TIE_COLORS = [
  { id: "navy", name: "네이비", base: "#1B3770", stripe: "#8FB4E8" },
  { id: "burgundy", name: "버건디", base: "#7A1E33", stripe: "#C9737F" },
  { id: "sky", name: "스카이", base: "#3E8FD8", stripe: "#D6EBFB" },
] as const;
export type TieColorId = (typeof TIE_COLORS)[number]["id"];

export const BACKGROUNDS = [
  { id: "white", name: "흰색", top: "#FFFFFF", bottom: "#FFFFFF" },
  { id: "sky", name: "연하늘", top: "#DCEBF7", bottom: "#C9DFF2" },
  { id: "gray", name: "연회색", top: "#ECEEF1", bottom: "#DADDE2" },
  { id: "studio", name: "스튜디오 블루", top: "#A9C8E8", bottom: "#5F8CBF" },
] as const;
export type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

export interface IdOptions {
  outfit: OutfitId;
  suit: SuitColorId;
  tie: TieColorId;
  bg: BackgroundId;
  bright: boolean;
}

/** 사용자가 버튼으로 조정하는 값 */
export interface IdAdjust {
  /** 얼굴 크기 배율 */
  zoom: number;
  /** 옷 위치 · 크기 */
  outfitY: number;
  outfitScale: number;
}

export const DEFAULT_ID_OPTIONS: IdOptions = { outfit: "suitTie", suit: "navy", tie: "navy", bg: "sky", bright: false };
export const DEFAULT_ADJUST: IdAdjust = { zoom: 1, outfitY: 0, outfitScale: 1 };

export function renderIdPhoto(cutout: HTMLCanvasElement, geom: FaceGeom, o: IdOptions, adj: IdAdjust, scale = 1): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = ID_W * scale;
  canvas.height = ID_H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  const bg = BACKGROUNDS.find((b) => b.id === o.bg)!;
  const g = ctx.createLinearGradient(0, 0, 0, ID_H);
  g.addColorStop(0, bg.top);
  g.addColorStop(1, bg.bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, ID_W, ID_H);
  if (o.bg === "studio") {
    const r = ctx.createRadialGradient(ID_W / 2, ID_H * 0.35, 50, ID_W / 2, ID_H * 0.35, ID_W * 0.75);
    r.addColorStop(0, "rgba(255,255,255,0.45)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = r;
    ctx.fillRect(0, 0, ID_W, ID_H);
  }

  // 얼굴 기준 배치 — 정수리 ≈ 얼굴 상자 위 0.45폭, 턱 ≈ 얼굴 상자 위 + 1.05폭
  const src = applyFilter(cutout, "natural", cutout.width);
  if (o.bright) brighten(src);
  const S = src.width;
  const hairTop = geom.top - geom.width * 0.45;
  const chin = geom.top + geom.width * 1.05;
  const k = ((ID_H * 0.52) / ((chin - hairTop) * S)) * adj.zoom;
  const dx = ID_W / 2 - geom.cx * S * k;
  const dy = ID_H * 0.1 - hairTop * S * k;
  ctx.drawImage(src, dx, dy, S * k, S * k);

  // 정장 — 목 아래 (얼굴 폭 기준)
  const faceW = geom.width * S * k * adj.outfitScale;
  const neckX = dx + geom.cx * S * k;
  const neckY = dy + chin * S * k + faceW * 0.1 + adj.outfitY * ID_H;
  drawOutfit(ctx, neckX, neckY, faceW, o);
  return canvas;
}

/** 화사하게 — 사람 부분만 살짝 밝고 따뜻하게 (흐림 없이) */
function brighten(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = "rgba(255,236,226,0.16)";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(c, 0, 0);
  ctx.globalCompositeOperation = "source-over";
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v + amt))));
  return `rgb(${c.join(",")})`;
}

/** 원점 = 목 가운데, 단위 = 얼굴 폭 */
function drawOutfit(ctx: Ctx, x: number, y: number, u: number, o: IdOptions) {
  const suit = SUIT_COLORS.find((s) => s.id === o.suit)!.base;
  const tie = TIE_COLORS.find((t) => t.id === o.tie)!;
  const isShirt = o.outfit === "shirtTie";
  const hasTie = o.outfit === "suitTie" || o.outfit === "shirtTie";
  const isW = o.outfit === "suitW";
  const bottom = (ID_H - y) / u + 0.2;
  const vBottom = isW ? 2.1 : 1.9;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(u, u);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // 셔츠 (V 부분)
  const shirt = ctx.createLinearGradient(0, 0, 0, vBottom);
  shirt.addColorStop(0, "#FFFFFF");
  shirt.addColorStop(1, "#E4E8EE");
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.moveTo(-0.36, -0.08);
  ctx.lineTo(0.36, -0.08);
  ctx.lineTo(0.2, vBottom);
  ctx.lineTo(-0.2, vBottom);
  ctx.closePath();
  ctx.fill();

  // 넥타이
  if (hasTie) {
    ctx.fillStyle = tie.base;
    ctx.beginPath();
    ctx.moveTo(-0.075, 0.28);
    ctx.lineTo(-0.15, 1.45);
    ctx.lineTo(0, 1.66);
    ctx.lineTo(0.15, 1.45);
    ctx.lineTo(0.075, 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = tie.stripe;
    ctx.lineWidth = 0.035;
    for (let k = -1; k < 9; k++) {
      ctx.beginPath();
      ctx.moveTo(-0.3, 0.2 + k * 0.2);
      ctx.lineTo(0.3, 0.45 + k * 0.2);
      ctx.stroke();
    }
    ctx.restore();
    // 매듭
    ctx.fillStyle = shade(tie.base, -12);
    ctx.beginPath();
    ctx.moveTo(-0.11, 0.1);
    ctx.lineTo(0.11, 0.1);
    ctx.lineTo(0.075, 0.3);
    ctx.lineTo(-0.075, 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // 셔츠 깃 (여성은 둥근 블라우스 깃)
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#C8CFD9";
  ctx.lineWidth = 0.012;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    if (isW) {
      ctx.moveTo(s * 0.34, -0.08);
      ctx.quadraticCurveTo(s * 0.4, 0.3, s * 0.05, 0.36);
      ctx.quadraticCurveTo(s * 0.12, 0.1, s * 0.34, -0.08);
    } else {
      ctx.moveTo(s * 0.36, -0.1);
      ctx.lineTo(s * 0.03, 0.18);
      ctx.lineTo(s * 0.26, 0.36);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
  }

  // 재킷 (셔츠만이면 흰 셔츠 몸판)
  const body = isShirt ? "#F4F6F9" : suit;
  for (const s of [-1, 1]) {
    const grad = ctx.createLinearGradient(s * 2.1, 0, 0, 0);
    grad.addColorStop(0, shade(body, -28));
    grad.addColorStop(0.6, body);
    grad.addColorStop(1, shade(body, 14));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(s * 0.34, -0.06);
    ctx.quadraticCurveTo(s * 0.9, 0.08, s * 1.55, 0.3);
    ctx.quadraticCurveTo(s * 1.95, 0.45, s * 2.0, 0.95);
    ctx.lineTo(s * 2.2, bottom);
    ctx.lineTo(0, bottom);
    if (isShirt) {
      ctx.lineTo(0, 0.4);
      ctx.lineTo(s * 0.26, 0.36);
    } else {
      ctx.lineTo(0, vBottom);
      ctx.lineTo(s * 0.22, vBottom - 0.15);
    }
    ctx.closePath();
    ctx.fill();
    // 소매 솔기
    ctx.strokeStyle = shade(body, -40);
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    ctx.moveTo(s * 1.6, 0.8);
    ctx.quadraticCurveTo(s * 1.68, 1.6, s * 1.74, bottom);
    ctx.stroke();
  }

  if (isShirt) {
    // 단추 줄
    ctx.strokeStyle = "#D5DBE3";
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    ctx.moveTo(0.02, 0.4);
    ctx.lineTo(0.02, bottom);
    ctx.stroke();
  } else {
    // 라펠 (깃)
    for (const s of [-1, 1]) {
      ctx.fillStyle = shade(suit, 8);
      ctx.strokeStyle = shade(suit, -45);
      ctx.lineWidth = 0.018;
      ctx.beginPath();
      ctx.moveTo(s * 0.33, -0.04);
      if (isW) {
        ctx.quadraticCurveTo(s * 0.72, 0.5, s * 0.62, 0.9);
      } else {
        ctx.lineTo(s * 0.6, 0.28);
        ctx.lineTo(s * 0.52, 0.4);
        ctx.lineTo(s * 0.78, 0.55);
      }
      ctx.lineTo(s * 0.06, vBottom);
      ctx.lineTo(s * 0.2, vBottom - 0.05);
      ctx.lineTo(s * 0.36, 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // 단추
    ctx.fillStyle = shade(suit, -50);
    ctx.beginPath();
    ctx.arc(0.04, vBottom + 0.25, 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
