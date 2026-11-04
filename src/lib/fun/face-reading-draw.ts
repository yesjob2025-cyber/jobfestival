// 취업 관상 — 얼굴 위에 관상도(삼정 선 · 부위 표시) 그리기 · 결과 카드

import { K, roundRect, text, type Ctx } from "@/lib/future-card/draw";
import { applyFilter } from "@/lib/future-card/faces";
import { chip, drawFrame, makeCanvas, paragraph } from "./card";
import { PEAK, TYPES, type Reading } from "./face-reading";

type Pt = { x: number; y: number };

const GOLD = "#FFD21E";
const SIZE = 720;

// 얼굴 윤곽 (MediaPipe 얼굴 둘레 점 순서)
const OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

/**
 * 얼굴이 가운데 크게 오게 잘라 관상도를 그립니다.
 * lines=false 면 선 없이 사진만 (스캔 연출의 바탕).
 */
export function chartFace(cutout: HTMLCanvasElement, lm: Pt[], lines = true): HTMLCanvasElement {
  const src = applyFilter(cutout, "natural", cutout.width);
  const S = src.width;
  const P = (i: number): Pt => ({ x: lm[i].x * S, y: lm[i].y * S });
  const top = P(10);
  const chin = P(152);
  const H = Math.hypot(chin.x - top.x, chin.y - top.y);
  const cx = (top.x + chin.x) / 2;
  const cy = (top.y + chin.y) / 2 - H * 0.05;
  const side = H * 1.75;
  const k = SIZE / side;

  const out = document.createElement("canvas");
  out.width = out.height = SIZE;
  const ctx = out.getContext("2d")!;
  const bg = ctx.createRadialGradient(SIZE / 2, SIZE * 0.45, 40, SIZE / 2, SIZE / 2, SIZE * 0.75);
  bg.addColorStop(0, "#23407F");
  bg.addColorStop(1, "#0A1638");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // 은은한 격자 (관상도 느낌)
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let g = 0; g <= SIZE; g += 40) {
    ctx.beginPath();
    ctx.moveTo(g, 0);
    ctx.lineTo(g, SIZE);
    ctx.moveTo(0, g);
    ctx.lineTo(SIZE, g);
    ctx.stroke();
  }
  ctx.drawImage(src, (cx - side / 2) * k * -1, (cy - side / 2) * k * -1, S * k, S * k);
  if (!lines) return out;

  const T = (p: Pt): Pt => ({ x: (p.x - (cx - side / 2)) * k, y: (p.y - (cy - side / 2)) * k });
  const L = (i: number) => T(P(i));
  const mid = (a: Pt, b: Pt, t = 0.5): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

  ctx.fillStyle = "rgba(6,16,48,0.22)";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 얼굴 축 (기울기 반영)
  const t0 = L(10);
  const t1 = L(152);
  const axis = { x: (t1.x - t0.x) / Math.hypot(t1.x - t0.x, t1.y - t0.y), y: (t1.y - t0.y) / Math.hypot(t1.x - t0.x, t1.y - t0.y) };
  // 얼굴 오른쪽 방향 (축에 수직)
  const across = { x: axis.y, y: -axis.x };
  const faceW = Math.hypot(L(454).x - L(234).x, L(454).y - L(234).y);
  const onAxis = (p: Pt) => {
    const d = (p.x - t0.x) * axis.x + (p.y - t0.y) * axis.y;
    return { x: t0.x + axis.x * d, y: t0.y + axis.y * d };
  };

  // 얼굴 윤곽
  glow(ctx, GOLD, 2, () => {
    ctx.beginPath();
    OVAL.forEach((i, n) => {
      const p = L(i);
      if (n) ctx.lineTo(p.x, p.y);
      else ctx.moveTo(p.x, p.y);
    });
    ctx.closePath();
  }, 0.7);

  // 삼정 선 — 이마 꼭대기 · 눈썹 · 코 밑 · 턱 끝
  const brow = onAxis(mid(L(105), L(334)));
  const nose = onAxis(L(2));
  const levels = [t0, brow, nose, t1];
  const half = faceW * 0.72;
  ctx.save();
  ctx.setLineDash([8, 7]);
  for (const c of levels) {
    glow(ctx, "#8FD6FB", 2, () => {
      ctx.beginPath();
      ctx.moveTo(c.x - across.x * half, c.y - across.y * half);
      ctx.lineTo(c.x + across.x * half, c.y + across.y * half);
    }, 0.85);
  }
  ctx.restore();
  // 삼정 이름 (얼굴 오른쪽 바깥, 구간 가운데) — 오른쪽 이름표가 피해 갈 자리로 기억
  const taken: number[] = [];
  ["상정", "중정", "하정"].forEach((name, i) => {
    const c = mid(levels[i], levels[i + 1]);
    const x = c.x + across.x * (half + 6);
    const y = c.y + across.y * (half + 6);
    tag(ctx, name, x, y, "#8FD6FB", K.navyDeep, "left");
    taken.push(y);
  });

  // 부위 표시 (왼쪽 · 오른쪽으로 이름표)
  const marks: [string, Pt, "L" | "R"][] = [
    ["이마 · 관록궁", mid(t0, brow, 0.3), "L"],
    ["눈썹 · 보수관", L(105), "L"],
    ["눈 · 감찰관", mid(L(33), L(133)), "L"],
    ["입 · 출납관", L(13), "L"],
    ["미간 · 명궁", mid(L(107), L(336)), "R"],
    ["코 · 재백궁", L(4), "R"],
    ["턱 · 지각", mid(L(17), t1, 0.55), "R"],
  ];
  ctx.font = `700 20px ${"Pretendard, sans-serif"}`;
  for (const [label, p, s] of marks) {
    const x = s === "L" ? 18 : SIZE - 18;
    // 오른쪽 이름표는 삼정 이름 · 다른 이름표와 겹치지 않게 위아래로 비켜 섭니다
    let y = p.y;
    if (s === "R") {
      for (let n = 0; n < 6; n++) {
        const hit = taken.find((t) => Math.abs(t - y) < 34);
        if (hit === undefined) break;
        y = hit + (y >= hit ? 34 : -34);
      }
      taken.push(y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(s === "L" ? x + measure(ctx, label) + 16 : x - measure(ctx, label) - 16, y);
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    tag(ctx, label, x, y, "rgba(255,255,255,0.95)", K.navyDeep, s === "L" ? "left" : "right");
  }
  return out;
}

function measure(ctx: Ctx, s: string) {
  ctx.font = `700 20px Pretendard, sans-serif`;
  return ctx.measureText(s).width;
}

/** 둥근 이름표 */
function tag(ctx: Ctx, s: string, x: number, y: number, bg: string, color: string, align: "left" | "right") {
  const w = measure(ctx, s) + 16;
  const left = align === "left" ? x : x - w;
  ctx.save();
  roundRect(ctx, left, y - 15, w, 30, 15);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(s, left + 8, y + 1);
  ctx.restore();
}

function glow(ctx: Ctx, color: string, width: number, path: () => void, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.lineWidth = width;
  path();
  ctx.stroke();
  ctx.restore();
}

/** 결과 카드 (1080×1350) */
export function renderFaceResult(chart: HTMLCanvasElement, r: Reading, name: string): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas();
  const t = TYPES[r.type];
  const panel = drawFrame(ctx, { title: name ? `${name}님의 취업 관상` : "나의 취업 관상", seed: r.type + name, emoji: "🧿" });
  const left = panel.x + 44;
  const width = panel.w - 88;

  const ph = 400;
  ctx.save();
  roundRect(ctx, left, panel.y + 36, ph, ph, 28);
  ctx.clip();
  ctx.drawImage(chart, left, panel.y + 36, ph, ph);
  ctx.restore();

  const rx = left + ph + 30;
  const rw = width - ph - 30;
  ctx.font = `86px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText(t.emoji, rx, panel.y + 128);
  text(ctx, t.name, rx, panel.y + 200, { size: 46, weight: 400, color: t.color, family: "jua", maxW: rw });
  text(ctx, `취업운 ${r.score}점`, rx, panel.y + 252, { size: 34, weight: 800, color: K.navy, maxW: rw });
  paragraph(ctx, t.desc, rx, panel.y + 296, { width: rw, size: 23, color: "#3D4C68", lineHeight: 33, maxLines: 3 });
  const p = PEAK[r.peak];
  roundRect(ctx, rx, panel.y + 382, rw, 54, 16);
  ctx.fillStyle = K.skyPale;
  ctx.fill();
  text(ctx, `⏳ 전성기 ${p.age} · ${p.name}`, rx + 16, panel.y + 418, { size: 24, weight: 800, color: K.navyDeep, maxW: rw - 32 });

  // 부위 7곳
  let y = panel.y + 36 + ph + 52;
  for (const part of r.parts) {
    text(ctx, part.part, left, y, { size: 27, weight: 400, color: K.navy, family: "jua" });
    text(ctx, "★".repeat(part.stars) + "☆".repeat(5 - part.stars), left + 64, y - 2, { size: 19, weight: 700, color: "#F5B800" });
    text(ctx, part.shape, left + 178, y, { size: 24, weight: 800, color: K.ink, maxW: width - 178 });
    text(ctx, part.text, left + 178, y + 29, { size: 19, weight: 500, color: "#3D4C68", maxW: width - 178 });
    y += 64;
  }

  let x = left;
  const cy = y - 18;
  for (const j of t.jobs) x = chip(ctx, `💼 ${j}`, x, cy, K.skyPale, K.navyDeep, 23);
  return canvas;
}
