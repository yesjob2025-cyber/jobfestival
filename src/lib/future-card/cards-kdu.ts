// ─────────────────────────────────────────────────────────────
// 미래 명함 — 경동대 Fun Fun Job Festival 명함 디자인 10종
//
// 포스터 색(스카이블루 · 네이비 · 옐로 · 핑크)과 마스코트 사자를 씁니다.
// 사람 사진은 배경을 지운 상태라 카드 위에 바로 올라앉습니다.
// ─────────────────────────────────────────────────────────────

import { futureYear } from "./brand";
import {
  barcode,
  CARD_H,
  CARD_W,
  circle,
  confetti,
  drawPerson,
  fitFont,
  hash,
  K,
  quote,
  readyImage,
  roundRect,
  silhouetteOutline,
  speechBubble,
  splitTwo,
  starburst,
  text,
  text3d,
  type Ctx,
  type DrawFn,
} from "./draw";
import { titleLine } from "./presets";

export const KDU_MASCOT = "/kdu/lion.webp";

export const KDU_DESIGN_NAMES = {
  funfun: "펀펀 스카이",
  kduNavy: "네이비 옐로",
  kduClassic: "화이트 클래식",
  mascot: "사자랑 함께",
  sticker: "옐로 스티커",
  pinkfun: "핑크 펀",
  bubble: "말풍선",
  badge: "KDU 사원증",
  ticket: "페스티벌 티켓",
  dream: "드림 그라데이션",
} as const;

export type KduDesignId = keyof typeof KDU_DESIGN_NAMES;

const CONFETTI = [K.yellow, "#ffffff", K.pink, "#9BE15D", "#B983FF"];
const SHADOW = "rgba(11,42,120,0.35)";

/** 사람이 카드 아래쪽에 서 있도록 — 사진 아래 잘린 부분이 카드 밖으로 */
const standY = (size: number, sink = 0.04) => CARD_H - size * (1 - sink);

/** 흰 바탕 둥근 캡슐 안의 한마디 */
function sloganPill(ctx: Ctx, s: string, x: number, y: number, maxW: number, bg: string, color: string) {
  if (!s.trim()) return;
  const size = fitFont(ctx, s, 700, 34, maxW - 80);
  const w = Math.min(maxW, ctx.measureText(s).width + 80);
  roundRect(ctx, x, y, w, 88, 44);
  ctx.fillStyle = bg;
  ctx.fill();
  text(ctx, s, x + 40, y + 58, { size, weight: 700, color, maxW: maxW - 80 });
}

/** 색이 채워진 캡슐 안의 회사명 */
function companyPill(ctx: Ctx, s: string, x: number, y: number, maxW: number, bg: string, color: string) {
  const size = fitFont(ctx, s, 400, 46, maxW - 64, "jua");
  const w = Math.min(maxW, ctx.measureText(s).width + 64);
  roundRect(ctx, x, y, w, 80, 40);
  ctx.fillStyle = bg;
  ctx.fill();
  text(ctx, s, x + 32, y + 56, { size, weight: 400, color, maxW: maxW - 64, family: "jua" });
}

export const KDU_DESIGNS: Record<KduDesignId, DrawFn> = {
  funfun(ctx, face, info, brand) {
    const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
    bg.addColorStop(0, K.sky);
    bg.addColorStop(0.55, K.skyMid);
    bg.addColorStop(1, K.skyLight);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    confetti(ctx, info.name + "funfun", 34, CONFETTI);
    circle(ctx, 1340, 540, 400, "rgba(255,255,255,0.22)");
    drawPerson(ctx, face, 880, standY(900), 900, SHADOW);

    text(ctx, `FUTURE CARD ${futureYear(brand)}`, 100, 130, { size: 34, weight: 700, color: "rgba(255,255,255,0.92)", family: "fun" });
    companyPill(ctx, info.company, 100, 170, 760, K.navy, K.yellow);
    text(ctx, info.dept, 104, 320, { size: 36, weight: 700, color: K.navyDeep, maxW: 760 });
    text3d(ctx, info.name, 100, 560, { size: 170, weight: 400, color: "#fff", outline: K.navy, depth: K.navyDeep, maxW: 780 });
    text(ctx, info.nameEn.toUpperCase(), 104, 640, { size: 40, weight: 600, color: K.navyDeep, maxW: 760, family: "fun" });
    text3d(ctx, titleLine(info), 100, 740, { size: 58, weight: 400, color: K.yellow, outline: K.navy, maxW: 760 });
    sloganPill(ctx, info.slogan, 100, 800, 780, "#fff", K.navyDeep);
    text(ctx, `KDU · ${futureYear(brand)}`, 1730, 960, { size: 36, weight: 700, color: "#fff", align: "right", family: "fun" });
  },

  kduNavy(ctx, face, info, brand) {
    const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    bg.addColorStop(0, K.navyDeep);
    bg.addColorStop(1, K.navy);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    confetti(ctx, info.name + "navy", 16, [K.yellow, "#ffffff"]);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(1360, 560, 420, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    circle(ctx, 1360, 560, 390, K.yellow);
    drawPerson(ctx, face, 920, standY(880), 880, "rgba(0,0,0,0.35)");

    roundRect(ctx, 1560, 60, 180, 72, 36);
    ctx.fillStyle = K.yellow;
    ctx.fill();
    text(ctx, "KDU", 1650, 112, { size: 42, weight: 700, color: K.navyDeep, align: "center", family: "fun" });

    text(ctx, info.company, 100, 190, { size: 56, weight: 400, color: K.yellow, maxW: 780, family: "jua" });
    text(ctx, info.dept, 100, 250, { size: 34, weight: 500, color: "rgba(255,255,255,0.78)", maxW: 780 });
    ctx.fillStyle = K.yellow;
    ctx.fillRect(100, 290, 90, 10);
    text(ctx, titleLine(info), 100, 560, { size: 50, weight: 400, color: K.skyLight, maxW: 780, family: "jua" });
    text(ctx, info.name, 100, 700, { size: 150, weight: 400, color: "#fff", maxW: 780, family: "jua" });
    text(ctx, info.nameEn.toUpperCase(), 104, 770, { size: 38, weight: 600, color: "rgba(255,255,255,0.6)", maxW: 760, family: "fun" });
    text(ctx, quote(info.slogan), 100, 880, { size: 34, weight: 500, color: "rgba(255,255,255,0.85)", maxW: 780 });
    text(ctx, `${futureYear(brand)}`, 100, 950, { size: 30, weight: 700, color: K.yellow, family: "fun" });
  },

  kduClassic(ctx, face, info, brand) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = K.sky;
    ctx.fillRect(0, 0, 28, CARD_H);

    // 사진 칸
    const slot = { x: 1150, y: 170, w: 520, h: 640 };
    ctx.save();
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 40);
    ctx.clip();
    const g = ctx.createLinearGradient(0, slot.y, 0, slot.y + slot.h);
    g.addColorStop(0, K.skyPale);
    g.addColorStop(1, K.skyLight);
    ctx.fillStyle = g;
    ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
    drawPerson(ctx, face, slot.x + slot.w / 2 - 350, slot.y + slot.h - 700, 700);
    ctx.restore();

    circle(ctx, 1700, 100, 56, K.navy);
    text(ctx, "KDU", 1700, 114, { size: 34, weight: 700, color: K.yellow, align: "center", family: "fun" });

    text(ctx, info.company, 110, 190, { size: 54, weight: 800, color: K.navy, maxW: 960 });
    text(ctx, info.dept, 110, 250, { size: 34, weight: 500, color: "#3D4C68", maxW: 960 });
    ctx.fillStyle = K.sky;
    ctx.fillRect(110, 290, 120, 8);
    text(ctx, titleLine(info), 110, 560, { size: 46, weight: 700, color: K.sky, maxW: 960 });
    text(ctx, info.name, 110, 690, { size: 130, weight: 900, color: K.navyDeep, maxW: 960 });
    text(ctx, info.nameEn.toUpperCase(), 110, 760, { size: 38, weight: 600, color: "#6B7A96", maxW: 960 });
    text(ctx, quote(info.slogan), 110, 880, { size: 34, weight: 500, color: "#3D4C68", maxW: 960 });
    text(ctx, `FUTURE CARD ${futureYear(brand)}`, 1670, 890, { size: 28, weight: 800, color: K.sky, align: "right" });

    ctx.fillStyle = K.navy;
    ctx.fillRect(0, 960, CARD_W, 40);
    ctx.fillStyle = K.yellow;
    ctx.fillRect(0, 960, 300, 40);
    ctx.fillStyle = K.pink;
    ctx.fillRect(300, 960, 120, 40);
  },

  mascot(ctx, face, info, brand) {
    const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
    bg.addColorStop(0, "#ffffff");
    bg.addColorStop(1, K.skyLight);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    // 구름
    for (const [x, y, r] of [
      [760, 150, 60],
      [830, 130, 80],
      [910, 160, 55],
      [1520, 560, 50],
      [1580, 540, 70],
    ]) {
      circle(ctx, x, y, r, "rgba(143,214,251,0.35)");
    }
    confetti(ctx, info.name + "mascot", 14, CONFETTI, { x: 600, y: 0, w: 1200, h: 500 });

    drawPerson(ctx, face, 620, standY(820), 820, SHADOW);
    const lion = readyImage(KDU_MASCOT);
    if (lion) {
      const h = 560;
      const w = (lion.naturalWidth / lion.naturalHeight) * h;
      ctx.save();
      ctx.shadowColor = SHADOW;
      ctx.shadowBlur = 24;
      ctx.drawImage(lion, 1330, CARD_H - h - 20, w, h);
      ctx.restore();
    }
    speechBubble(ctx, 1500, 210, 230, 110, 1520, 400, K.navy);
    text(ctx, "10년 뒤에도", 1500, 195, { size: 52, weight: 700, color: "#fff", align: "center", family: "hand" });
    text(ctx, "같이 일해요!", 1500, 255, { size: 52, weight: 700, color: K.yellow, align: "center", family: "hand" });

    text(ctx, info.company, 90, 180, { size: 52, weight: 400, color: K.navy, maxW: 620, family: "jua" });
    text(ctx, info.dept, 90, 238, { size: 32, weight: 500, color: "#3D4C68", maxW: 620 });
    text(ctx, titleLine(info), 90, 520, { size: 46, weight: 400, color: K.sky, maxW: 620, family: "jua" });
    text(ctx, info.name, 90, 650, { size: 130, weight: 400, color: K.navyDeep, maxW: 620, family: "jua" });
    text(ctx, info.nameEn.toUpperCase(), 92, 712, { size: 36, weight: 600, color: K.navy, maxW: 620, family: "fun" });
    text(ctx, quote(info.slogan), 90, 850, { size: 30, weight: 600, color: K.navy, maxW: 600 });
    text(ctx, `KDU · ${futureYear(brand)}`, 90, 950, { size: 32, weight: 700, color: K.navyDeep, family: "fun" });
  },

  sticker(ctx, face, info, brand) {
    ctx.fillStyle = K.yellow;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    // 오른쪽 위로 갈수록 커지는 망점
    ctx.fillStyle = "rgba(11,42,120,0.13)";
    for (let y = 20; y < CARD_H; y += 40) {
      for (let x = 820 + ((y / 40) % 2) * 20; x < CARD_W; x += 40) {
        const r = Math.max(0, 14 * ((x - 820) / 980) * (1 - y / CARD_H));
        if (r < 1) continue;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.save();
    ctx.translate(1270, 560);
    ctx.rotate(-0.07);
    const s = 780;
    silhouetteOutline(ctx, face, -s / 2, -s / 2, s, K.navyDeep, 24);
    silhouetteOutline(ctx, face, -s / 2, -s / 2, s, "#ffffff", 15);
    ctx.drawImage(face, -s / 2, -s / 2, s, s);
    ctx.restore();

    ctx.save();
    ctx.translate(1640, 170);
    ctx.rotate(0.2);
    starburst(ctx, 0, 0, 125, 14, K.pink);
    text(ctx, "HELLO", 0, -8, { size: 44, weight: 700, color: "#fff", align: "center", family: "fun" });
    text(ctx, `${futureYear(brand)}!`, 0, 42, { size: 44, weight: 700, color: K.yellow, align: "center", family: "fun" });
    ctx.restore();

    companyPill(ctx, info.company, 90, 140, 760, K.navyDeep, K.yellow);
    text(ctx, info.name, 90, 520, { size: 150, weight: 400, color: K.navyDeep, maxW: 760, family: "jua" });
    text(ctx, info.nameEn.toUpperCase(), 94, 590, { size: 40, weight: 600, color: K.navy, maxW: 740, family: "fun" });
    text(ctx, titleLine(info), 90, 700, { size: 56, weight: 400, color: K.pink, maxW: 760, family: "jua" });
    text(ctx, info.dept, 92, 760, { size: 34, weight: 700, color: K.navyDeep, maxW: 740 });
    text(ctx, quote(info.slogan), 90, 890, { size: 32, weight: 600, color: K.navy, maxW: 740 });
  },

  pinkfun(ctx, face, info, brand) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    // 위쪽 핑크 물결 띠
    ctx.fillStyle = K.pinkPale;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 220);
    for (let x = 0; x <= CARD_W; x += 20) ctx.lineTo(x, 220 + 22 * Math.sin((x / 300) * Math.PI * 2));
    ctx.lineTo(CARD_W, 0);
    ctx.closePath();
    ctx.fill();
    for (const [x, y, c] of [
      [940, 300, K.sky],
      [1000, 860, K.yellow],
      [1730, 420, K.sky],
      [880, 640, K.pink],
    ] as const) {
      starburst(ctx, x, y, 22, 5, c);
    }

    // 동그라미 위로 머리가 튀어나오는 사진
    const cx = 1380;
    const cy = 600;
    const r = 320;
    circle(ctx, cx, cy, r, K.pink);
    circle(ctx, cx, cy, r - 14, K.pinkPale);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
    ctx.rect(cx - r + 14, 0, (r - 14) * 2, cy);
    ctx.clip();
    drawPerson(ctx, face, cx - 400, cy + r - 14 - 800, 800);
    ctx.restore();

    text(ctx, `FUTURE CARD ${futureYear(brand)}`, 100, 130, { size: 44, weight: 700, color: K.pink, family: "fun" });
    text(ctx, info.company, 100, 340, { size: 52, weight: 400, color: K.pink, maxW: 820, family: "jua" });
    text(ctx, info.dept, 100, 396, { size: 32, weight: 500, color: "#3D4C68", maxW: 820 });
    text(ctx, titleLine(info), 100, 580, { size: 46, weight: 400, color: K.navy, maxW: 820, family: "jua" });
    text(ctx, info.name, 100, 712, { size: 140, weight: 400, color: K.navyDeep, maxW: 820, family: "jua" });
    text(ctx, info.nameEn.toUpperCase(), 104, 778, { size: 38, weight: 600, color: K.pink, maxW: 800, family: "fun" });
    text(ctx, quote(info.slogan), 100, 890, { size: 32, weight: 600, color: K.navy, maxW: 820 });
  },

  bubble(ctx, face, info, brand) {
    const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
    bg.addColorStop(0, K.sky);
    bg.addColorStop(1, K.skyLight);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    confetti(ctx, info.name + "bubble", 26, CONFETTI);
    drawPerson(ctx, face, -40, standY(880), 880, SHADOW);

    ctx.save();
    ctx.translate(1260, 250);
    ctx.rotate(-0.04);
    speechBubble(ctx, 0, 0, 440, 170, -420, 200, K.navy);
    const lines = splitTwo(info.slogan.trim() || "즐거운 취업, 여기 다 있JOB!");
    lines.forEach((l, i) =>
      text(ctx, l, 0, (lines.length === 1 ? 22 : -18 + i * 76), {
        size: 66,
        weight: 700,
        color: i === lines.length - 1 ? K.yellow : "#fff",
        align: "center",
        maxW: 760,
        family: "hand",
      }),
    );
    ctx.restore();

    roundRect(ctx, 800, 480, 920, 420, 40);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = K.navy;
    ctx.lineWidth = 6;
    ctx.stroke();
    text(ctx, info.company, 850, 565, { size: 48, weight: 400, color: K.sky, maxW: 820, family: "jua" });
    text(ctx, info.name, 850, 700, { size: 124, weight: 400, color: K.navyDeep, maxW: 820, family: "jua" });
    text(ctx, info.nameEn.toUpperCase(), 852, 752, { size: 34, weight: 600, color: K.navy, maxW: 820, family: "fun" });
    text(ctx, titleLine(info), 850, 828, { size: 46, weight: 400, color: K.pink, maxW: 820, family: "jua" });
    text(ctx, info.dept, 850, 874, { size: 30, weight: 600, color: "#3D4C68", maxW: 820 });
    text(ctx, `KDU · ${futureYear(brand)}`, 1720, 960, { size: 34, weight: 700, color: "#fff", align: "right", family: "fun" });
  },

  badge(ctx, face, info, brand) {
    ctx.fillStyle = K.sky;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    // 목걸이 줄
    ctx.fillStyle = K.navyDeep;
    ctx.fillRect(850, 0, 100, 60);
    roundRect(ctx, 830, 40, 140, 50, 14);
    ctx.fillStyle = "#cfd8e3";
    ctx.fill();

    roundRect(ctx, 50, 70, 1700, 880, 40);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = K.navy;
    ctx.fillRect(50, 70, 1700, 150);
    ctx.fillStyle = K.yellow;
    ctx.fillRect(50, 220, 1700, 10);
    ctx.restore();

    text(ctx, "KDU", 110, 172, { size: 64, weight: 700, color: K.yellow, family: "fun" });
    text(ctx, "EMPLOYEE ID CARD", 270, 168, { size: 36, weight: 600, color: "#fff", family: "fun" });
    text(ctx, info.company, 1690, 168, { size: 46, weight: 400, color: "#fff", align: "right", maxW: 700, family: "jua" });

    const slot = { x: 110, y: 280, w: 440, h: 560 };
    ctx.save();
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 24);
    ctx.clip();
    const g = ctx.createLinearGradient(0, slot.y, 0, slot.y + slot.h);
    g.addColorStop(0, K.skyLight);
    g.addColorStop(1, K.sky);
    ctx.fillStyle = g;
    ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
    drawPerson(ctx, face, slot.x + slot.w / 2 - 320, slot.y + slot.h - 640, 640);
    ctx.restore();
    roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 24);
    ctx.strokeStyle = K.navy;
    ctx.lineWidth = 8;
    ctx.stroke();

    text(ctx, "성명 NAME", 620, 330, { size: 28, weight: 700, color: "#6B7A96" });
    text(ctx, info.name, 620, 440, { size: 120, weight: 400, color: K.navyDeep, maxW: 640, family: "jua" });
    text(ctx, info.nameEn.toUpperCase(), 622, 500, { size: 34, weight: 600, color: K.navy, maxW: 640, family: "fun" });
    text(ctx, "소속", 620, 600, { size: 30, weight: 700, color: "#6B7A96" });
    text(ctx, info.dept || "-", 740, 600, { size: 40, weight: 700, color: K.ink, maxW: 500 });
    text(ctx, "직위", 620, 670, { size: 30, weight: 700, color: "#6B7A96" });
    text(ctx, titleLine(info) || "-", 740, 670, { size: 40, weight: 700, color: K.ink, maxW: 500 });
    text(ctx, quote(info.slogan), 620, 770, { size: 32, weight: 600, color: K.sky, maxW: 600 });

    barcode(ctx, 1260, 800, 430, 80, info.name + info.company, K.navyDeep);
    text(ctx, `${futureYear(brand)}-${brand.dateCode}-${String(hash(info.name) % 10000).padStart(4, "0")}`, 1475, 916, {
      size: 24,
      weight: 600,
      color: K.ink,
      align: "center",
    });

    ctx.save();
    ctx.translate(1490, 480);
    ctx.rotate(-0.26);
    ctx.globalAlpha = 0.88;
    ctx.strokeStyle = K.pink;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 112, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 96, 0, Math.PI * 2);
    ctx.stroke();
    text(ctx, "승진 확정", 0, 16, { size: 46, weight: 400, color: K.pink, align: "center", family: "jua" });
    ctx.restore();
  },

  ticket(ctx, face, info, brand) {
    ctx.fillStyle = K.navyDeep;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    confetti(ctx, info.name + "ticket", 22, CONFETTI);

    const t = { x: 60, y: 110, w: 1680, h: 780 };
    const cut = 1220;
    ctx.save();
    roundRect(ctx, t.x, t.y, t.w, t.h, 36);
    ctx.clip();
    ctx.fillStyle = K.yellow;
    ctx.fillRect(t.x, t.y, cut - t.x, t.h);
    const g = ctx.createLinearGradient(0, t.y, 0, t.y + t.h);
    g.addColorStop(0, K.sky);
    g.addColorStop(1, K.skyLight);
    ctx.fillStyle = g;
    ctx.fillRect(cut, t.y, t.x + t.w - cut, t.h);
    drawPerson(ctx, face, cut + 260 - 300, t.y + t.h - 600, 600);
    ctx.restore();
    // 절취선 홈과 점선
    circle(ctx, cut, t.y, 40, K.navyDeep);
    circle(ctx, cut, t.y + t.h, 40, K.navyDeep);
    ctx.save();
    ctx.strokeStyle = K.navyDeep;
    ctx.lineWidth = 6;
    ctx.setLineDash([18, 16]);
    ctx.beginPath();
    ctx.moveTo(cut, t.y + 60);
    ctx.lineTo(cut, t.y + t.h - 60);
    ctx.stroke();
    ctx.restore();

    text(ctx, "FUN FUN JOB FESTIVAL", 130, 210, { size: 46, weight: 700, color: K.navyDeep, family: "fun" });
    text(ctx, "ADMIT ONE · FUTURE PASS", 132, 256, { size: 28, weight: 600, color: "rgba(11,42,120,0.7)", family: "fun" });
    ctx.fillStyle = K.navyDeep;
    ctx.fillRect(130, 285, 980, 4);
    text(ctx, info.company, 130, 380, { size: 52, weight: 400, color: K.navyDeep, maxW: 980, family: "jua" });
    text(ctx, info.name, 130, 560, { size: 140, weight: 400, color: K.navyDeep, maxW: 980, family: "jua" });
    text(ctx, info.nameEn.toUpperCase(), 134, 622, { size: 40, weight: 600, color: K.navy, maxW: 960, family: "fun" });
    text(ctx, titleLine(info), 130, 720, { size: 52, weight: 400, color: K.pink, maxW: 980, family: "jua" });
    text(ctx, info.dept, 132, 776, { size: 32, weight: 600, color: K.navyDeep, maxW: 960 });
    text(ctx, quote(info.slogan), 130, 846, { size: 28, weight: 600, color: "rgba(11,42,120,0.8)", maxW: 980 });

    text(ctx, `${futureYear(brand)}.10.28`, 1480, 200, { size: 44, weight: 700, color: "#fff", align: "center", family: "fun" });
    text(ctx, `NO. ${String(hash(info.name + info.company) % 100000).padStart(5, "0")}`, 1480, 246, {
      size: 28,
      weight: 600,
      color: K.navyDeep,
      align: "center",
      family: "fun",
    });
  },

  dream(ctx, face, info, brand) {
    const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    bg.addColorStop(0, K.sky);
    bg.addColorStop(0.55, "#7B6CF6");
    bg.addColorStop(1, K.pink);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    text(ctx, `${futureYear(brand)}`, 1330, 760, { size: 500, weight: 700, color: "rgba(255,255,255,0.16)", align: "center", family: "fun" });
    confetti(ctx, info.name + "dream", 18, ["#ffffff", K.yellow]);
    drawPerson(ctx, face, 830, standY(960), 960, "rgba(40,10,80,0.35)");

    const tag = `#DREAM JOB ${futureYear(brand)}`;
    fitFont(ctx, tag, 700, 30, undefined, "fun");
    const tw = ctx.measureText(tag).width + 60;
    roundRect(ctx, 100, 120, tw, 62, 31);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fill();
    text(ctx, tag, 100 + tw / 2, 162, { size: 30, weight: 700, color: "#fff", align: "center", family: "fun" });

    text(ctx, info.company, 100, 320, { size: 54, weight: 400, color: "#fff", maxW: 760, family: "jua" });
    text3d(ctx, info.name, 100, 540, { size: 160, weight: 400, color: "#fff", outline: K.navyDeep, depth: "rgba(11,42,120,0.6)", maxW: 760 });
    text(ctx, info.nameEn.toUpperCase(), 104, 616, { size: 40, weight: 600, color: "rgba(255,255,255,0.85)", maxW: 740, family: "fun" });
    text(ctx, titleLine(info), 100, 718, { size: 54, weight: 400, color: K.yellow, maxW: 760, family: "jua" });
    text(ctx, info.dept, 102, 776, { size: 34, weight: 600, color: "rgba(255,255,255,0.88)", maxW: 740 });
    sloganPill(ctx, info.slogan, 100, 820, 780, "#fff", K.navyDeep);
  },
};
