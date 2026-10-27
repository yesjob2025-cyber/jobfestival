// ─────────────────────────────────────────────────────────────
// 미래 명함 — 디자인 목록 · 그리기
//
// 디자인은 행사별로 나뉩니다 (cards-kmou.ts 6종, cards-kdu.ts 10종).
// 행사가 어떤 디자인을 쓰는지는 brand.ts 의 designs 에 있습니다.
// ─────────────────────────────────────────────────────────────

import type { FutureCardBrand } from "./brand";
import { KDU_DESIGN_NAMES, KDU_DESIGNS, KDU_MASCOT, type KduDesignId } from "./cards-kdu";
import { KMOU_DESIGN_NAMES, KMOU_DESIGNS, type KmouDesignId } from "./cards-kmou";
import { CARD_H, CARD_W, loadImage, type FontKey } from "./draw";
import type { CardInfo } from "./presets";

export { CARD_H, CARD_W };

export type CardDesignId = KmouDesignId | KduDesignId;

export const CARD_DESIGN_NAMES: Record<CardDesignId, string> = { ...KMOU_DESIGN_NAMES, ...KDU_DESIGN_NAMES };

const DESIGNS = { ...KMOU_DESIGNS, ...KDU_DESIGNS };

/** 디자인에 고정으로 들어가는 문구 — 웹폰트 글리프를 미리 받아 둡니다. */
const STATIC_TEXT =
  "FUTURE CARD EMPLOYEE ID # 성명 NAME 소속 직위 승진 확정 “”·-.!0123456789 FUN JOB FESTIVAL ADMIT ONE PASS DREAM HELLO NO 10년 뒤에도 같이 일해요 즐거운 취업, 여기 다 있JOB";

const FONT_FACES: Record<FontKey, string> = {
  sans: '"Pretendard Variable"',
  jua: "Jua",
  fun: "Fredoka",
  hand: "Gaegu",
};

/**
 * 캔버스는 아직 받지 않은 웹폰트 글자를 기본 글꼴로 그리므로, 그리기 전에 글자와 이미지를 불러 둡니다.
 * (경동대 디자인은 주아 · Fredoka · 개구 글꼴과 마스코트 그림을 씁니다)
 */
export async function ensureAssets(info: CardInfo, brand: FutureCardBrand): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const text = Object.values(info).join("") + brand.short + STATIC_TEXT;
  const families: FontKey[] = brand.id === "kdu" ? ["sans", "jua", "fun", "hand"] : ["sans"];
  const jobs: Promise<unknown>[] = families.flatMap((f) =>
    [400, 600, 700, 900].map((w) => document.fonts.load(`${w} 40px ${FONT_FACES[f]}`, text).catch(() => [])),
  );
  if (brand.id === "kdu") jobs.push(loadImage(KDU_MASCOT).catch(() => undefined));
  await Promise.all(jobs);
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
