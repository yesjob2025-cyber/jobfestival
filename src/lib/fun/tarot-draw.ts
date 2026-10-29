// 취업 타로 결과 카드 그리기 (실제 카드 그림 사용 — 그리기 전에 그림을 받아 둡니다)

import { K, loadImage, readyImage, roundRect, text, type Ctx } from "@/lib/future-card/draw";
import { chip, drawFrame, makeCanvas, paragraph } from "./card";
import { cardImage, luckOf, POSITIONS, TOPICS, type Drawn, type TopicId } from "./tarot";

/** 결과 카드에 쓸 카드 그림 미리 받기 */
export async function loadTarotImages(drawn: Drawn[]) {
  await Promise.all(drawn.map((d) => loadImage(cardImage(d.card)).catch(() => undefined)));
}

function drawCardImage(ctx: Ctx, d: Drawn, x: number, y: number, w: number, h: number) {
  const img = readyImage(cardImage(d.card));
  ctx.save();
  ctx.shadowColor = "rgba(11,42,120,0.35)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = K.yellow;
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 10);
  ctx.clip();
  if (img) {
    if (d.reversed) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(Math.PI);
      ctx.drawImage(img, -w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
    } else {
      ctx.drawImage(img, x + 6, y + 6, w - 12, h - 12);
    }
  } else {
    ctx.fillStyle = K.navyDeep;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

export async function renderTarotResult(drawn: Drawn[], topic: TopicId, name: string, summary: string): Promise<HTMLCanvasElement> {
  await loadTarotImages(drawn);
  const { canvas, ctx } = makeCanvas();
  const t = TOPICS.find((x) => x.id === topic)!;
  const panel = drawFrame(ctx, { title: name ? `${name}님의 취업 타로` : "나의 취업 타로", seed: drawn.map((d) => d.card.id).join("-"), emoji: "🔮" });
  const luck = luckOf(drawn, topic);
  const cx = panel.x + panel.w / 2;
  const left = panel.x + 50;
  const width = panel.w - 100;

  text(ctx, `${t.emoji} ${t.lead}  `, cx - 70, panel.y + 70, { size: 38, weight: 400, color: K.navy, align: "center", family: "jua" });
  text(ctx, `${luck.score}%`, cx + 170, panel.y + 74, { size: 64, weight: 700, color: K.pink, align: "center", family: "fun" });

  // 카드 3장 (실제 그림)
  const cw = 230;
  const ch = Math.round(cw * (527 / 300));
  const gap = 46;
  const startX = cx - (cw * 3 + gap * 2) / 2;
  const cy = panel.y + 110;
  drawn.forEach((d, i) => {
    const x = startX + i * (cw + gap);
    drawCardImage(ctx, d, x, cy, cw, ch);
    text(ctx, POSITIONS[i].name, x + cw / 2, cy + ch + 40, { size: 26, weight: 700, color: K.sky, align: "center" });
    text(ctx, `${d.card.ko}${d.reversed ? " (역)" : ""}`, x + cw / 2, cy + ch + 78, { size: 30, weight: 400, color: K.navyDeep, align: "center", family: "jua", maxW: cw + 30 });
  });

  // 종합 풀이
  let y = cy + ch + 140;
  y = paragraph(ctx, summary, left, y, { width, size: 25, color: "#3D4C68", lineHeight: 37, maxLines: 5 });

  // 행운 정보
  let x = left;
  const ly = Math.max(y + 6, panel.y + panel.h - 72);
  x = chip(ctx, `🍀 ${luck.item}`, x, ly, K.skyPale, K.navyDeep, 24);
  x = chip(ctx, `🎨 ${luck.color}`, x, ly, "#FFF6D1", K.navyDeep, 24);
  chip(ctx, `💼 ${luck.job}`, x, ly, K.pinkPale, K.navyDeep, 24);
  return canvas;
}
