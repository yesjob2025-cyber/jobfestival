// 동물상 — 사진에 동물 귀 그리기 · 결과 카드

import { circle, K, roundRect, text, type Ctx } from "@/lib/future-card/draw";
import { applyFilter } from "@/lib/future-card/faces";
import type { Animal, AnimalId } from "./animal";
import { chip, drawFrame, makeCanvas, paragraph } from "./card";

type Pt = { x: number; y: number };

/** 배경 지운 사진 + 동물 귀 (+ 볼터치) — size×size */
export function decorateFace(cutout: HTMLCanvasElement, lm: Pt[] | null, animal: AnimalId): HTMLCanvasElement {
  const base = applyFilter(cutout, "natural", cutout.width);
  if (!lm) return base;
  const S = base.width;
  const ctx = base.getContext("2d")!;
  const P = (i: number) => ({ x: lm[i].x * S, y: lm[i].y * S });
  const left = P(234);
  const right = P(454);
  const top = P(10);
  const faceW = Math.hypot(right.x - left.x, right.y - left.y);
  const roll = Math.atan2(right.y - left.y, right.x - left.x);

  // 볼터치
  ctx.save();
  for (const i of [50, 280]) {
    const c = P(i);
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, faceW * 0.11);
    g.addColorStop(0, "rgba(255,120,150,0.45)");
    g.addColorStop(1, "rgba(255,120,150,0)");
    ctx.fillStyle = g;
    ctx.fillRect(c.x - faceW * 0.12, c.y - faceW * 0.12, faceW * 0.24, faceW * 0.24);
  }
  ctx.restore();

  ctx.save();
  ctx.translate(top.x, top.y - faceW * 0.08);
  ctx.rotate(roll);
  ctx.scale(faceW, faceW);
  ctx.lineJoin = "round";
  EARS[animal](ctx);
  ctx.restore();
  return base;
}

const EARS: Record<AnimalId, (ctx: Ctx) => void> = {
  cat: (ctx) => {
    for (const s of [-1, 1]) {
      tri(ctx, [s * 0.2, 0.02], [s * 0.44, -0.44], [s * 0.52, 0.06], "#4A3B35");
      tri(ctx, [s * 0.27, 0.0], [s * 0.43, -0.3], [s * 0.47, 0.02], "#F5A3B7");
    }
  },
  fox: (ctx) => {
    for (const s of [-1, 1]) {
      tri(ctx, [s * 0.16, 0.04], [s * 0.48, -0.58], [s * 0.58, 0.08], "#E8742A");
      tri(ctx, [s * 0.26, 0.02], [s * 0.47, -0.4], [s * 0.51, 0.04], "#FFF3E6");
    }
  },
  rabbit: (ctx) => {
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * 0.2, -0.45);
      ctx.rotate(s * 0.18);
      ellipse(ctx, 0, 0, 0.12, 0.42, "#FFFFFF", "#E5E7EB");
      ellipse(ctx, 0, 0.02, 0.06, 0.32, "#F7AFC2");
      ctx.restore();
    }
  },
  bear: (ctx) => {
    for (const s of [-1, 1]) {
      circle(ctx, s * 0.42, -0.08, 0.17, "#7A4E2D");
      circle(ctx, s * 0.42, -0.08, 0.09, "#C8946A");
    }
  },
  dog: (ctx) => {
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(s * 0.5, 0.12);
      ctx.rotate(s * -0.25);
      ctx.fillStyle = "#B07A45";
      ctx.beginPath();
      ctx.moveTo(0, -0.2);
      ctx.bezierCurveTo(s * 0.26, -0.18, s * 0.24, 0.42, s * 0.04, 0.46);
      ctx.bezierCurveTo(s * -0.12, 0.48, s * -0.14, 0.0, 0, -0.2);
      ctx.fill();
      ctx.restore();
    }
  },
  deer: (ctx) => {
    ctx.strokeStyle = "#8A5A3C";
    ctx.lineCap = "round";
    ctx.lineWidth = 0.05;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * 0.2, -0.02);
      ctx.quadraticCurveTo(s * 0.26, -0.35, s * 0.42, -0.62);
      ctx.moveTo(s * 0.25, -0.28);
      ctx.lineTo(s * 0.08, -0.48);
      ctx.moveTo(s * 0.34, -0.46);
      ctx.lineTo(s * 0.55, -0.55);
      ctx.stroke();
      ctx.save();
      ctx.translate(s * 0.5, 0.04);
      ctx.rotate(s * 0.6);
      ellipse(ctx, 0, 0, 0.07, 0.15, "#B98559");
      ellipse(ctx, 0, 0.01, 0.035, 0.09, "#F2C9B0");
      ctx.restore();
    }
  },
};

function tri(ctx: Ctx, a: number[], b: number[], c: number[], fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.lineTo(c[0], c[1]);
  ctx.closePath();
  ctx.fill();
}

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, fill: string, stroke?: string) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.015;
    ctx.stroke();
  }
}

/** 얼굴 가운데 · 폭 (사진 한 변 대비) — 결과 카드에서 얼굴을 크게 잘라 보여 줄 때 */
export interface FaceBox {
  cx: number;
  cy: number;
  w: number;
}

export function faceBox(lm: Pt[]): FaceBox {
  const l = lm[234];
  const r = lm[454];
  return { cx: (l.x + r.x) / 2, cy: (lm[10].y + lm[152].y) / 2, w: Math.hypot(r.x - l.x, r.y - l.y) };
}

export function renderAnimalResult(
  face: HTMLCanvasElement,
  box: FaceBox,
  ranking: { animal: Animal; pct: number }[],
  partner: Animal,
  name: string,
): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas();
  const top = ranking[0];
  const panel = drawFrame(ctx, { title: name ? `${name}님의 동물상` : "나의 동물상은?", seed: top.animal.id + name, emoji: top.animal.emoji });
  const cx = panel.x + panel.w / 2;
  const left = panel.x + 60;
  const width = panel.w - 120;

  // 사진 (동그라미)
  const r = 190;
  const cy = panel.y + 40 + r;
  const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  g.addColorStop(0, K.skyPale);
  g.addColorStop(1, K.skyLight);
  circle(ctx, cx, cy, r + 10, top.animal.color);
  circle(ctx, cx, cy, r, K.skyPale);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.rect(cx - r, cy - r - 120, r * 2, r + 120);
  ctx.clip();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // 얼굴 폭이 동그라미 지름의 약 55% 가 되게 키우고, 얼굴이 가운데보다 살짝 아래에 오게
  const k = (r * 2 * 0.55) / (box.w * face.width);
  ctx.drawImage(face, cx - box.cx * face.width * k, cy + r * 0.12 - box.cy * face.width * k, face.width * k, face.width * k);
  ctx.restore();

  let y = cy + r + 90;
  text(ctx, `${top.animal.emoji} ${top.animal.name} ${top.pct}%`, cx, y, { size: 70, weight: 400, color: top.animal.color, align: "center", family: "jua" });
  y = paragraph(ctx, top.animal.desc, cx, y + 56, { width, size: 29, color: "#3D4C68", align: "center", maxLines: 2 }) + 6;

  // 상위 3개 막대
  const barX = left + 210;
  const barW = width - 290;
  ranking.slice(0, 3).forEach((rk, i) => {
    const by = y + i * 46;
    text(ctx, `${rk.animal.emoji} ${rk.animal.name}`, left, by + 30, { size: 28, weight: 700, color: K.ink });
    roundRect(ctx, barX, by + 10, barW, 26, 13);
    ctx.fillStyle = "#EEF3F9";
    ctx.fill();
    roundRect(ctx, barX, by + 10, Math.max(26, (barW * rk.pct) / 100), 26, 13);
    ctx.fillStyle = rk.animal.color;
    ctx.fill();
    text(ctx, `${rk.pct}%`, barX + barW + 50, by + 32, { size: 28, weight: 700, color: K.ink, align: "center" });
  });
  y += 3 * 46 + 30;

  let x = left;
  for (const k of top.animal.keywords) x = chip(ctx, `#${k}`, x, y, K.skyPale, K.navyDeep, 26);
  y += 100;
  text(ctx, `💼 어울리는 직무: ${top.animal.jobs.join(" / ")}`, left, y, { size: 28, weight: 700, color: K.navy, maxW: width });
  text(ctx, `🤝 찰떡 동료: ${partner.emoji} ${partner.name}`, left, y + 52, { size: 28, weight: 700, color: K.pink, maxW: width });
  return canvas;
}
