// 취업 손금 — 빛나는 손금 그리기 · 결과 카드

import { K, roundRect, text, type Ctx } from "@/lib/future-card/draw";
import { chip, drawFrame, makeCanvas, paragraph } from "./card";
import { HAND_TYPES, LINE_COLORS, LINE_TEXT, linePath, palmFrame, TRAITS, type LineId, type Pt, type Reading } from "./palm";

const LINES: LineId[] = ["life", "head", "heart", "fate"];

/** 손이 가운데 오게 정사각형으로 잘라, 빛나는 손금을 그린 캔버스 */
export function drawPalm(photo: HTMLCanvasElement, lm: Pt[], reading: Reading, withLines = true): HTMLCanvasElement {
  const S = photo.width;
  // 손 영역 (여유 25%)
  const xs = lm.map((p) => p.x * S);
  const ys = lm.map((p) => p.y * S);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const side = Math.min(S, Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 1.25);
  const sx = Math.max(0, Math.min(S - side, cx - side / 2));
  const sy = Math.max(0, Math.min(S - side, cy - side / 2));

  const out = document.createElement("canvas");
  out.width = out.height = 720;
  const ctx = out.getContext("2d")!;
  const k = 720 / side;
  ctx.drawImage(photo, sx, sy, side, side, 0, 0, 720, 720);
  if (!withLines) return out;

  // 사진 좌표 → 잘라낸 캔버스 좌표
  const local = lm.map((p) => ({ x: ((p.x * S - sx) * k) / 720, y: ((p.y * S - sy) * k) / 720 }));
  const f = palmFrame(local, 720);

  ctx.fillStyle = "rgba(6,20,60,0.28)";
  ctx.fillRect(0, 0, 720, 720);
  ctx.drawImage(photo, sx, sy, side, side, 0, 0, 720, 720);
  ctx.fillStyle = "rgba(6,20,60,0.18)";
  ctx.fillRect(0, 0, 720, 720);

  for (const id of LINES) {
    const [a, b, c] = linePath(id, reading.lines[id]).map(([u, v]) => f.at(u, v));
    const width = Math.max(5, f.W * (0.03 + reading.lines[id] * 0.01));
    glowStroke(ctx, a, b, c, LINE_COLORS[id], width);
  }
  return out;
}

function glowStroke(ctx: Ctx, a: Pt, b: Pt, c: Pt, color: string, width: number) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  for (const [w, blur, alpha] of [
    [width * 3, width * 4, 0.35],
    [width * 1.6, width * 2, 0.7],
    [width, 0, 1],
  ]) {
    ctx.globalAlpha = alpha;
    ctx.lineWidth = w;
    ctx.shadowBlur = blur;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(b.x * 2 - (a.x + c.x) / 2, b.y * 2 - (a.y + c.y) / 2, c.x, c.y);
    ctx.stroke();
  }
  // 가운데 하얀 심
  ctx.globalAlpha = 0.9;
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = width * 0.35;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(b.x * 2 - (a.x + c.x) / 2, b.y * 2 - (a.y + c.y) / 2, c.x, c.y);
  ctx.stroke();
  ctx.restore();
}

export function renderPalmResult(hand: HTMLCanvasElement, reading: Reading, name: string): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas();
  const t = HAND_TYPES[reading.type];
  const panel = drawFrame(ctx, { title: name ? `${name}님의 취업 손금` : "나의 취업 손금", seed: reading.type + name, emoji: "✋" });
  const left = panel.x + 50;
  const width = panel.w - 100;

  // 손 사진 (왼쪽) + 손 유형 (오른쪽)
  const ph = 430;
  ctx.save();
  roundRect(ctx, left, panel.y + 40, ph, ph, 30);
  ctx.clip();
  ctx.drawImage(hand, left, panel.y + 40, ph, ph);
  ctx.restore();

  const rx = left + ph + 36;
  const rw = width - ph - 36;
  ctx.font = `90px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(t.emoji, rx, panel.y + 140);
  text(ctx, t.name, rx, panel.y + 220, { size: 58, weight: 400, color: t.color, family: "jua", maxW: rw });
  text(ctx, t.nick, rx, panel.y + 272, { size: 34, weight: 700, color: K.navy, maxW: rw });
  paragraph(ctx, t.desc, rx, panel.y + 325, { width: rw, size: 25, color: "#3D4C68", maxLines: 4 });

  // 네 가지 선
  let y = panel.y + 40 + ph + 80;
  for (const id of LINES) {
    const l = LINE_TEXT[id];
    ctx.fillStyle = LINE_COLORS[id];
    ctx.beginPath();
    ctx.arc(left + 12, y - 11, 11, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, `${l.name}`, left + 36, y, { size: 30, weight: 400, color: K.navy, family: "jua" });
    text(ctx, l.text[reading.lines[id] - 1], left + 150, y, { size: 27, weight: 600, color: K.ink, maxW: width - 150 });
    y += 62;
  }

  // 성향 · 직무
  y += 20;
  text(ctx, TRAITS.indexLong[reading.indexLong ? 0 : 1], left, y, { size: 27, weight: 600, color: "#3D4C68", maxW: width });
  text(ctx, TRAITS.thumbOpen[reading.thumbOpen ? 0 : 1], left, y + 50, { size: 27, weight: 600, color: "#3D4C68", maxW: width });
  text(ctx, "💼 어울리는 직무", left, y + 120, { size: 30, weight: 400, color: K.navy, family: "jua" });
  let x = left;
  for (const j of t.jobs) x = chip(ctx, j, x, y + 140, K.skyPale, K.navyDeep, 25);
  return canvas;
}
