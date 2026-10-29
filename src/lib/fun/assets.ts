// 결과 카드를 캔버스로 그리기 전에 웹폰트 글자와 마스코트 그림을 받아 둡니다.

import { loadImage } from "@/lib/future-card/draw";
import { FUN } from "./config";

const FACES = ['"Pretendard Variable"', "Jua", "Fredoka", "Gaegu"];

export async function loadCardAssets(text: string): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const all = text + "0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz ·%!?.,“”" + FUN.festival + FUN.school;
  await Promise.all([
    ...FACES.flatMap((f) => [400, 700, 900].map((w) => document.fonts.load(`${w} 40px ${f}`, all).catch(() => []))),
    loadImage(FUN.mascot).catch(() => undefined),
  ]);
}
