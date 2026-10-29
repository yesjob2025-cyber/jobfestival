// 직무 유형 테스트 결과 카드 그리기

import { K, roundRect, text, type Ctx } from "@/lib/future-card/draw";
import { chip, drawFrame, makeCanvas, paragraph } from "./card";
import { TYPES, type JobType, type TypeId } from "./job-type";

function emoji(ctx: Ctx, e: string, x: number, y: number, size: number) {
  ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(e, x, y);
}

export function renderJobTypeResult(top: JobType, second: JobType, scores: Record<TypeId, number>, name: string): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas();
  const panel = drawFrame(ctx, { title: name ? `${name}님의 직무 유형` : "나의 직무 유형", seed: top.id + second.id + name, emoji: "🧭" });
  const cx = panel.x + panel.w / 2;
  const left = panel.x + 60;
  const width = panel.w - 120;

  emoji(ctx, top.emoji, cx, panel.y + 120, 96);
  text(ctx, top.nick, cx, panel.y + 210, { size: 68, weight: 400, color: top.color, align: "center", family: "jua" });
  text(ctx, `홀랜드 ${top.name}(${top.id}) · 두 번째 ${second.name}(${second.id})`, cx, panel.y + 256, {
    size: 28,
    weight: 700,
    color: "#6B7A96",
    align: "center",
  });
  let y = paragraph(ctx, top.desc, cx, panel.y + 310, { width, size: 30, color: "#3D4C68", align: "center", maxLines: 2 });

  // 강점
  let x = left;
  for (const s of top.strengths) x = chip(ctx, `💪 ${s}`, x, y, K.skyPale, K.navyDeep, 28);

  // 유형별 점수 막대
  y += 100;
  text(ctx, "유형별 점수", left, y, { size: 30, weight: 400, color: K.navy, family: "jua" });
  y += 10;
  const ids: TypeId[] = ["R", "I", "A", "S", "E", "C"];
  const barW = width - 230;
  ids.forEach((id, i) => {
    const t = TYPES[id];
    const by = y + i * 40;
    text(ctx, `${t.emoji} ${t.name}`, left, by + 30, { size: 26, weight: 700, color: K.ink });
    roundRect(ctx, left + 170, by + 8, barW, 26, 13);
    ctx.fillStyle = "#EEF3F9";
    ctx.fill();
    const w = Math.max(26, (barW * scores[id]) / 4);
    roundRect(ctx, left + 170, by + 8, w, 26, 13);
    ctx.fillStyle = t.color;
    ctx.fill();
    text(ctx, `${scores[id]}`, left + 170 + barW + 30, by + 30, { size: 26, weight: 700, color: K.ink, align: "center" });
  });

  // 추천 직무 · 찰떡 동료
  y += 6 * 40 + 56;
  text(ctx, "💼 추천 직무", left, y, { size: 30, weight: 400, color: K.navy, family: "jua" });
  y = paragraph(ctx, top.jobs.join("  /  "), left, y + 44, { width, size: 28, color: K.ink, weight: 700, maxLines: 2 });
  const p = TYPES[top.partner];
  text(ctx, `🤝 찰떡 동료: ${p.emoji} ${p.nick}`, left, Math.min(y + 14, panel.y + panel.h - 40), { size: 30, weight: 700, color: K.pink });
  return canvas;
}
