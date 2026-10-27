// ─────────────────────────────────────────────────────────────
// 미래 명함 — 명함 디자인 6종 (캔버스로 그려 PNG 저장 · 인쇄)
//
// 명함 비율 90×50mm 를 1800×1000px 로 그립니다 (인쇄 시 약 500dpi).
// ─────────────────────────────────────────────────────────────

import { futureYear, type FutureCardBrand } from "./brand";
import { titleLine, type CardInfo } from "./presets";

export const CARD_W = 1800;
export const CARD_H = 1000;

export const CARD_DESIGNS = [
  { id: "classic", name: "클래식 화이트" },
  { id: "navy", name: "네이비 옐로" },
  { id: "startup", name: "스타트업 그라데이션" },
  { id: "minimal", name: "미니멀 블랙" },
  { id: "marine", name: "마린 웨이브" },
  { id: "retro", name: "레트로 사원증" },
] as const;

export type CardDesignId = (typeof CARD_DESIGNS)[number]["id"];

const FONT_FAMILY = '"Pretendard Variable", Pretendard';
const FONT = `${FONT_FAMILY}, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif`;

const C = {
  navy: "#0B3A79",
  navyDeep: "#062A5C",
  navySoft: "#14509B",
  ocean: "#1B6FC4",
  oceanLight: "#3E9BE0",
  oceanPale: "#9ED8F5",
  oceanMist: "#DCEEFB",
  sun: "#FFD200",
  sunDeep: "#F5B800",
  ink: "#12203A",
  inkSoft: "#3D4C68",
  inkMuted: "#6B7A96",
  inkLine: "#DCE3ED",
};

/** 디자인에 고정으로 들어가는 문구 — 웹폰트 글리프를 미리 받아 둡니다. */
const STATIC_TEXT = "FUTURE CARD EMPLOYEE ID # 성명 NAME 소속 직위 승진 확정 “”·-0123456789";

/** 캔버스는 아직 받지 않은 웹폰트 글자를 기본 글꼴로 그리므로, 그리기 전에 글자를 불러 둡니다. */
export async function ensureFonts(info: CardInfo, brand: FutureCardBrand): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const text = Object.values(info).join("") + brand.short + STATIC_TEXT;
  await Promise.all(
    [300, 400, 500, 600, 700, 800, 900].map((w) =>
      document.fonts.load(`${w} 40px "Pretendard Variable"`, text).catch(() => []),
    ),
  );
}

export function drawCard(
  ctx: CanvasRenderingContext2D,
  face: HTMLCanvasElement,
  info: CardInfo,
  design: CardDesignId,
  brand: FutureCardBrand,
) {
  ctx.save();
  ctx.textBaseline = "alphabetic";
  DESIGNS[design](ctx, face, info, brand);
  ctx.restore();
}

/** scale 배율로 그린 명함 캔버스 (미리보기는 작게, 저장은 1) */
export function renderCard(
  face: HTMLCanvasElement,
  info: CardInfo,
  design: CardDesignId,
  brand: FutureCardBrand,
  scale = 1,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(CARD_W * scale);
  canvas.height = Math.round(CARD_H * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  drawCard(ctx, face, info, design, brand);
  return canvas;
}

type Ctx = CanvasRenderingContext2D;

const DESIGNS: Record<CardDesignId, (ctx: Ctx, face: HTMLCanvasElement, info: CardInfo, brand: FutureCardBrand) => void> = {
  classic(ctx, face, info, brand) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    text(ctx, info.company, 110, 190, { size: 56, weight: 800, color: C.navy, maxW: 960 });
    text(ctx, info.dept, 110, 252, { size: 36, weight: 500, color: C.inkSoft, maxW: 960 });
    ctx.fillStyle = C.ocean;
    ctx.fillRect(110, 300, 120, 8);

    text(ctx, titleLine(info), 110, 560, { size: 46, weight: 700, color: C.ocean, maxW: 960 });
    text(ctx, info.name, 110, 690, { size: 130, weight: 900, color: C.navy, maxW: 960 });
    text(ctx, info.nameEn.toUpperCase(), 110, 760, { size: 38, weight: 600, color: C.inkMuted, maxW: 960 });
    text(ctx, quote(info.slogan), 110, 880, { size: 36, weight: 500, color: C.inkSoft, maxW: 960 });

    ctx.save();
    roundRect(ctx, 1180, 170, 520, 640, 36);
    ctx.clip();
    drawCover(ctx, face, 1180, 170, 520, 640);
    ctx.restore();
    roundRect(ctx, 1180, 170, 520, 640, 36);
    ctx.strokeStyle = C.inkLine;
    ctx.lineWidth = 4;
    ctx.stroke();
    text(ctx, `FUTURE CARD ${futureYear(brand)}`, 1700, 895, { size: 30, weight: 800, color: C.ocean, align: "right" });

    ctx.fillStyle = C.navy;
    ctx.fillRect(0, 960, CARD_W, 40);
    ctx.fillStyle = C.sun;
    ctx.fillRect(0, 960, 360, 40);
  },

  navy(ctx, face, info, brand) {
    const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    bg.addColorStop(0, C.navyDeep);
    bg.addColorStop(0.6, C.navy);
    bg.addColorStop(1, C.navySoft);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    circle(ctx, 1520, 90, 460, "rgba(62,155,224,0.16)");
    circle(ctx, 1780, 980, 260, "rgba(255,210,0,0.10)");

    ctx.fillStyle = C.sun;
    ctx.fillRect(110, 140, 12, 130);
    text(ctx, info.company, 150, 205, { size: 56, weight: 800, color: C.sun, maxW: 920 });
    text(ctx, info.dept, 150, 262, { size: 34, weight: 500, color: "rgba(255,255,255,0.78)", maxW: 920 });

    text(ctx, titleLine(info), 110, 600, { size: 46, weight: 700, color: C.oceanPale, maxW: 960 });
    text(ctx, info.name, 110, 730, { size: 130, weight: 900, color: "#FFFFFF", maxW: 960 });
    text(ctx, info.nameEn.toUpperCase(), 110, 800, { size: 38, weight: 600, color: "rgba(255,255,255,0.6)", maxW: 960 });
    text(ctx, quote(info.slogan), 110, 900, { size: 34, weight: 500, color: "rgba(255,255,255,0.82)", maxW: 960 });

    circle(ctx, 1400, 460, 290, C.sun);
    ctx.save();
    ctx.beginPath();
    ctx.arc(1400, 460, 272, 0, Math.PI * 2);
    ctx.clip();
    drawCover(ctx, face, 1128, 188, 544, 544);
    ctx.restore();
    text(ctx, `${brand.short} · ${futureYear(brand)}`, 1400, 900, { size: 36, weight: 800, color: C.sun, align: "center" });
  },

  startup(ctx, face, info, brand) {
    const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    bg.addColorStop(0, C.ocean);
    bg.addColorStop(0.55, "#6C4DF6");
    bg.addColorStop(1, "#FF5C93");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    circle(ctx, 1650, 140, 300, "rgba(255,255,255,0.10)");
    circle(ctx, 620, 1040, 220, "rgba(255,255,255,0.08)");

    roundRect(ctx, 86, 146, 588, 708, 70);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.save();
    roundRect(ctx, 100, 160, 560, 680, 58);
    ctx.clip();
    drawCover(ctx, face, 100, 160, 560, 680);
    ctx.restore();

    ctx.font = font(800, 30);
    const tag = `#FUTURE ${futureYear(brand)}`;
    const tagW = ctx.measureText(tag).width + 64;
    roundRect(ctx, 760, 166, tagW, 64, 32);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fill();
    text(ctx, tag, 760 + tagW / 2, 209, { size: 30, weight: 800, color: "#FFFFFF", align: "center" });

    text(ctx, info.company, 760, 330, { size: 52, weight: 800, color: "rgba(255,255,255,0.92)", maxW: 940 });
    text(ctx, info.name, 760, 520, { size: 140, weight: 900, color: "#FFFFFF", maxW: 940 });
    text(ctx, info.nameEn.toUpperCase(), 760, 585, { size: 38, weight: 600, color: "rgba(255,255,255,0.72)", maxW: 940 });
    text(ctx, titleLine(info), 760, 690, { size: 48, weight: 800, color: "#FFFFFF", maxW: 940 });
    text(ctx, info.dept, 760, 748, { size: 34, weight: 500, color: "rgba(255,255,255,0.82)", maxW: 940 });

    if (info.slogan.trim()) {
      const size = fitFont(ctx, info.slogan, 700, 34, 860);
      const w = Math.min(940, ctx.measureText(info.slogan).width + 80);
      roundRect(ctx, 760, 798, w, 88, 44);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      text(ctx, info.slogan, 800, 856, { size, weight: 700, color: C.navyDeep, maxW: 860 });
    }
  },

  minimal(ctx, face, info, brand) {
    const gold = "#D4B26A";
    ctx.fillStyle = "#0E0F12";
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    drawCover(ctx, face, 1180, 0, 620, CARD_H);
    const fade = ctx.createLinearGradient(1180, 0, 1400, 0);
    fade.addColorStop(0, "#0E0F12");
    fade.addColorStop(1, "rgba(14,15,18,0)");
    ctx.fillStyle = fade;
    ctx.fillRect(1180, 0, 220, CARD_H);

    text(ctx, info.company, 120, 190, { size: 42, weight: 600, color: gold, maxW: 900 });
    text(ctx, `FUTURE ${futureYear(brand)}`, 1040, 190, { size: 26, weight: 600, color: "rgba(212,178,106,0.7)", align: "right" });
    ctx.fillStyle = gold;
    ctx.fillRect(120, 236, 400, 2);

    text(ctx, info.name, 120, 560, { size: 124, weight: 300, color: "#FFFFFF", maxW: 920 });
    text(ctx, info.nameEn.toUpperCase(), 120, 630, { size: 34, weight: 400, color: "#8A8F99", maxW: 920 });
    text(ctx, titleLine(info), 120, 760, { size: 44, weight: 600, color: "#FFFFFF", maxW: 920 });
    text(ctx, info.dept, 120, 820, { size: 34, weight: 400, color: "#B8BCC4", maxW: 920 });
    text(ctx, info.slogan, 120, 920, { size: 30, weight: 400, color: gold, maxW: 920 });
  },

  marine(ctx, face, info, brand) {
    const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
    bg.addColorStop(0, "#F4FAFF");
    bg.addColorStop(1, C.oceanMist);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    wave(ctx, 850, 22, 520, 0, "rgba(158,216,245,0.9)");
    wave(ctx, 895, 18, 430, 1.4, C.oceanLight);
    wave(ctx, 940, 14, 360, 2.6, C.navy);

    circle(ctx, 330, 430, 244, C.ocean);
    circle(ctx, 330, 430, 238, "#FFFFFF");
    ctx.save();
    ctx.beginPath();
    ctx.arc(330, 430, 222, 0, Math.PI * 2);
    ctx.clip();
    drawCover(ctx, face, 108, 208, 444, 444);
    ctx.restore();

    anchor(ctx, 1680, 140, 56, C.navy);
    text(ctx, `${futureYear(brand)}`, 1600, 160, { size: 40, weight: 900, color: C.navy, align: "right" });

    text(ctx, info.company, 640, 220, { size: 54, weight: 800, color: C.navy, maxW: 880 });
    text(ctx, info.dept, 640, 276, { size: 34, weight: 500, color: C.inkSoft, maxW: 1000 });
    text(ctx, titleLine(info), 640, 470, { size: 46, weight: 700, color: C.ocean, maxW: 1000 });
    text(ctx, info.name, 640, 600, { size: 128, weight: 900, color: C.navy, maxW: 1000 });
    text(ctx, info.nameEn.toUpperCase(), 640, 668, { size: 36, weight: 600, color: C.inkMuted, maxW: 1000 });
    text(ctx, quote(info.slogan), 640, 770, { size: 34, weight: 600, color: C.navySoft, maxW: 1000 });

    text(ctx, `${brand.short} FUTURE CARD · ${futureYear(brand)}`, CARD_W / 2, 982, { size: 26, weight: 700, color: "rgba(255,255,255,0.9)", align: "center" });
  },

  retro(ctx, face, info, brand) {
    ctx.fillStyle = C.sun;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    roundRect(ctx, 50, 50, 1700, 900, 40);
    ctx.fillStyle = "#FFFDF4";
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = C.navy;
    ctx.fillRect(50, 50, 1700, 150);
    ctx.restore();
    roundRect(ctx, 50, 50, 1700, 900, 40);
    ctx.strokeStyle = C.navy;
    ctx.lineWidth = 6;
    ctx.stroke();

    text(ctx, info.company, 110, 148, { size: 50, weight: 900, color: C.sun, maxW: 1150 });
    text(ctx, `ID ${futureYear(brand)}`, 1690, 145, { size: 40, weight: 800, color: "#FFFFFF", align: "right" });

    drawCover(ctx, face, 110, 260, 440, 560);
    ctx.strokeStyle = C.navy;
    ctx.lineWidth = 8;
    ctx.strokeRect(110, 260, 440, 560);

    text(ctx, "성명 NAME", 620, 310, { size: 28, weight: 700, color: C.inkMuted });
    text(ctx, info.name, 620, 420, { size: 120, weight: 900, color: C.navy, maxW: 640 });
    text(ctx, info.nameEn.toUpperCase(), 620, 480, { size: 34, weight: 600, color: C.inkMuted, maxW: 640 });

    text(ctx, "소속", 620, 590, { size: 30, weight: 700, color: C.inkMuted });
    text(ctx, info.dept || "-", 740, 590, { size: 40, weight: 700, color: C.ink, maxW: 500 });
    text(ctx, "직위", 620, 660, { size: 30, weight: 700, color: C.inkMuted });
    text(ctx, titleLine(info) || "-", 740, 660, { size: 40, weight: 700, color: C.ink, maxW: 500 });
    text(ctx, quote(info.slogan), 620, 760, { size: 32, weight: 600, color: C.ocean, maxW: 600 });

    barcode(ctx, 1260, 790, 430, 90, info.name + info.company);
    text(ctx, `${futureYear(brand)}-${brand.dateCode}-${String(hash(info.name) % 10000).padStart(4, "0")}`, 1475, 916, {
      size: 24,
      weight: 600,
      color: C.ink,
      align: "center",
    });

    ctx.save();
    ctx.translate(1480, 470);
    ctx.rotate(-0.26);
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = "#E0393E";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 112, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 96, 0, Math.PI * 2);
    ctx.stroke();
    text(ctx, "승진 확정", 0, 16, { size: 44, weight: 900, color: "#E0393E", align: "center" });
    ctx.restore();
  },
};

// ── 그리기 도우미 ───────────────────────────────────────────

interface TextOpt {
  size: number;
  weight: number;
  color: string;
  maxW?: number;
  align?: CanvasTextAlign;
}

const font = (weight: number, size: number) => `${weight} ${size}px ${FONT}`;

/** maxW 에 들어갈 때까지 글자 크기를 줄이고, 정한 크기를 돌려줍니다 (ctx.font 도 맞춰 둠). */
function fitFont(ctx: Ctx, s: string, weight: number, size: number, maxW?: number): number {
  ctx.font = font(weight, size);
  if (!maxW) return size;
  const min = Math.round(size * 0.55);
  while (size > min && ctx.measureText(s).width > maxW) {
    size -= 2;
    ctx.font = font(weight, size);
  }
  return size;
}

function text(ctx: Ctx, s: string, x: number, y: number, o: TextOpt) {
  s = s.trim();
  if (!s) return;
  fitFont(ctx, s, o.weight, o.size, o.maxW);
  ctx.fillStyle = o.color;
  ctx.textAlign = o.align ?? "left";
  // 최소 크기로도 넘치면 가로로 눌러서라도 칸 안에 넣습니다.
  if (o.maxW) ctx.fillText(s, x, y, o.maxW);
  else ctx.fillText(s, x, y);
}

const quote = (s: string) => (s.trim() ? `“${s.trim()}”` : "");

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/** 정사각형 얼굴 사진을 칸 비율에 맞게 가운데를 잘라 채웁니다. */
function drawCover(ctx: Ctx, img: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
  const s = img.width;
  const ratio = w / h;
  const sw = ratio < 1 ? s * ratio : s;
  const sh = ratio < 1 ? s : s / ratio;
  ctx.drawImage(img, (s - sw) / 2, (s - sh) / 2, sw, sh, x, y, w, h);
}

function wave(ctx: Ctx, baseY: number, amp: number, len: number, phase: number, color: string) {
  ctx.beginPath();
  ctx.moveTo(0, CARD_H);
  for (let x = 0; x <= CARD_W; x += 20) {
    ctx.lineTo(x, baseY + amp * Math.sin((x / len) * Math.PI * 2 + phase));
  }
  ctx.lineTo(CARD_W, CARD_H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function anchor(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y - r * 0.75, r * 0.16, 0, Math.PI * 2);
  ctx.moveTo(x, y - r * 0.59);
  ctx.lineTo(x, y + r * 0.85);
  ctx.moveTo(x - r * 0.4, y - r * 0.3);
  ctx.lineTo(x + r * 0.4, y - r * 0.3);
  ctx.moveTo(x - r * 0.75, y + r * 0.2);
  ctx.quadraticCurveTo(x - r * 0.6, y + r * 0.85, x, y + r * 0.85);
  ctx.quadraticCurveTo(x + r * 0.6, y + r * 0.85, x + r * 0.75, y + r * 0.2);
  ctx.stroke();
  ctx.restore();
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** 이름으로 정해지는 장식용 바코드 */
function barcode(ctx: Ctx, x: number, y: number, w: number, h: number, seed: string) {
  let n = hash(seed) || 1;
  ctx.fillStyle = C.ink;
  let cx = x;
  while (cx < x + w) {
    n = (Math.imul(n, 1103515245) + 12345) >>> 0;
    const bar = 3 + (n % 4) * 3;
    if (cx + bar > x + w) break;
    ctx.fillRect(cx, y, bar, h);
    cx += bar + 3 + ((n >>> 8) % 3) * 3;
  }
}
