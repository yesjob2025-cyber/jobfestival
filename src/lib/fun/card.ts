// ─────────────────────────────────────────────────────────────
// 부대행사 결과 카드 공통 틀 (세로 1080×1350 — 휴대폰 사진첩 · 인스타 4:5)
// ─────────────────────────────────────────────────────────────

import { confetti, K, readyImage, roundRect, text, text3d, type Ctx } from "@/lib/future-card/draw";
import { FUN } from "./config";

export const RESULT_W = 1080;
export const RESULT_H = 1350;

export function makeCanvas(w = RESULT_W, h = RESULT_H): { canvas: HTMLCanvasElement; ctx: Ctx } {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";
  return { canvas, ctx };
}

/**
 * 하늘색 배경 · 색종이 · 위쪽 제목 · 아래쪽 행사 이름까지 그리고, 본문을 그릴 흰 판의 위치를 돌려줍니다.
 */
export function drawFrame(ctx: Ctx, opts: { title: string; seed: string; emoji?: string }): { x: number; y: number; w: number; h: number } {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, K.sky);
  bg.addColorStop(0.5, K.skyMid);
  bg.addColorStop(1, K.skyLight);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  confetti(ctx, opts.seed, 30, [K.yellow, "#ffffff", K.pink, "#9BE15D", "#B983FF"], { x: 0, y: 0, w: W, h: 230 });

  text3d(ctx, `${opts.emoji ? opts.emoji + " " : ""}${opts.title}`, W / 2, 150, {
    size: 84,
    weight: 400,
    color: "#fff",
    outline: K.navy,
    depth: K.navyDeep,
    align: "center",
    maxW: W - 120,
  });

  const panel = { x: 50, y: 210, w: W - 100, h: H - 210 - 110 };
  ctx.save();
  ctx.shadowColor = "rgba(11,42,120,0.25)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 44);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.restore();

  const lion = readyImage(FUN.mascot);
  if (lion) ctx.drawImage(lion, W - 170, H - 175, 110, (110 * lion.naturalHeight) / lion.naturalWidth);
  text(ctx, `${FUN.school} · ${FUN.festival}`, 60, H - 45, { size: 32, weight: 700, color: "#fff", family: "fun" });
  return panel;
}

/** 여러 줄 글 (폭에 맞춰 줄바꿈) — 마지막 줄 아래 y 를 돌려줍니다. */
export function paragraph(
  ctx: Ctx,
  s: string,
  x: number,
  y: number,
  o: { width: number; size: number; lineHeight?: number; color: string; weight?: number; align?: CanvasTextAlign; maxLines?: number },
): number {
  const lh = o.lineHeight ?? o.size * 1.45;
  ctx.font = `${o.weight ?? 500} ${o.size}px "Pretendard Variable", Pretendard, sans-serif`;
  ctx.fillStyle = o.color;
  ctx.textAlign = o.align ?? "left";
  const lines: string[] = [];
  for (const para of s.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > o.width && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  const shown = o.maxLines ? lines.slice(0, o.maxLines) : lines;
  shown.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  return y + shown.length * lh;
}

/** 둥근 칩 (키워드) — 다음 칩의 x 를 돌려줍니다. */
export function chip(ctx: Ctx, s: string, x: number, y: number, bg: string, color: string, size = 30): number {
  ctx.font = `700 ${size}px "Pretendard Variable", Pretendard, sans-serif`;
  const w = ctx.measureText(s).width + size * 1.2;
  const h = size * 1.8;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.fillText(s, x + size * 0.6, y + size * 1.25);
  return x + w + 14;
}
