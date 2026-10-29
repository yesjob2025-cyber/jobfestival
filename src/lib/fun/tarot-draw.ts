// 취업 타로 결과 카드 그리기

import { K, roundRect, text, type Ctx } from "@/lib/future-card/draw";
import { chip, drawFrame, makeCanvas, paragraph } from "./card";
import { luckOf, POSITIONS, ROMAN, TOPICS, type TarotCard, type TopicId } from "./tarot";

/** 타로 카드 한 장 (앞면) */
export function drawTarotCard(ctx: Ctx, card: TarotCard, x: number, y: number, w: number, h: number) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, K.navy);
  g.addColorStop(1, K.navyDeep);
  roundRect(ctx, x, y, w, h, w * 0.08);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = w * 0.025;
  ctx.strokeStyle = K.yellow;
  ctx.stroke();
  roundRect(ctx, x + w * 0.06, y + w * 0.06, w * 0.88, h - w * 0.12, w * 0.05);
  ctx.lineWidth = w * 0.008;
  ctx.strokeStyle = "rgba(255,210,30,0.6)";
  ctx.stroke();

  text(ctx, ROMAN[card.no], x + w / 2, y + h * 0.13, { size: w * 0.11, weight: 700, color: K.yellow, align: "center", family: "fun" });
  ctx.font = `${w * 0.4}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(card.emoji, x + w / 2, y + h * 0.56);
  text(ctx, card.name, x + w / 2, y + h * 0.78, { size: w * 0.105, weight: 400, color: "#fff", align: "center", maxW: w * 0.84, family: "jua" });
  text(ctx, card.tarot, x + w / 2, y + h * 0.88, { size: w * 0.055, weight: 600, color: "rgba(255,255,255,0.6)", align: "center", maxW: w * 0.84, family: "fun" });
  ctx.restore();
}

export function renderTarotResult(cards: TarotCard[], topic: TopicId, name: string): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas();
  const t = TOPICS.find((x) => x.id === topic)!;
  const panel = drawFrame(ctx, { title: name ? `${name}님의 취업 타로` : "나의 취업 타로", seed: cards.map((c) => c.no).join("-"), emoji: "🔮" });
  const luck = luckOf(cards, topic);
  const cx = panel.x + panel.w / 2;

  // 주제 · 점수
  text(ctx, `${t.emoji} ${t.lead}`, cx, panel.y + 70, { size: 40, weight: 400, color: K.navy, align: "center", family: "jua" });
  text(ctx, `${luck.score}%`, cx, panel.y + 150, { size: 84, weight: 700, color: K.pink, align: "center", family: "fun" });

  // 카드 3장
  const cw = 250;
  const ch = 390;
  const gap = 40;
  const startX = cx - (cw * 3 + gap * 2) / 2;
  const cy = panel.y + 190;
  cards.forEach((c, i) => {
    const x = startX + i * (cw + gap);
    drawTarotCard(ctx, c, x, cy, cw, ch);
    text(ctx, POSITIONS[i], x + cw / 2, cy + ch + 44, { size: 28, weight: 700, color: K.sky, align: "center" });
  });

  // 풀이
  let y = cy + ch + 100;
  const lines = [cards[0].now, cards[1].chance, cards[2].advice];
  lines.forEach((l, i) => {
    text(ctx, `${["①", "②", "③"][i]} ${cards[i].keyword}`, panel.x + 60, y, { size: 32, weight: 400, color: K.navy, family: "jua" });
    y = paragraph(ctx, l, panel.x + 60, y + 44, { width: panel.w - 120, size: 28, color: "#3D4C68", maxLines: 2 }) + 18;
  });

  // 행운 정보
  let x = panel.x + 60;
  const ly = panel.y + panel.h - 72;
  x = chip(ctx, `🍀 ${luck.item}`, x, ly, K.skyPale, K.navyDeep, 26);
  x = chip(ctx, `🎨 ${luck.color}`, x, ly, "#FFF6D1", K.navyDeep, 26);
  chip(ctx, `💼 ${luck.job}`, x, ly, K.pinkPale, K.navyDeep, 26);
  return canvas;
}
