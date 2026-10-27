// ─────────────────────────────────────────────────────────────
// 미래 명함 — 입력 항목 · 랜덤 추천
// 행사마다 다른 목록(회사 · 부서 · 직책 · 한마디)은 brand.ts 에 있습니다.
// ─────────────────────────────────────────────────────────────

import type { FutureCardBrand } from "./brand";

export interface CardInfo {
  name: string;
  nameEn: string;
  company: string;
  dept: string;
  /** 직급 */
  rank: string;
  /** 직책 */
  position: string;
  slogan: string;
}

export const EMPTY_INFO: CardInfo = {
  name: "",
  nameEn: "",
  company: "",
  dept: "",
  rank: "",
  position: "",
  slogan: "",
};

export const RANKS = ["사원", "주임", "대리", "과장", "차장", "부장", "이사", "상무", "전무", "사장"];

const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

/** 이름은 그대로 두고 나머지를 랜덤으로 채웁니다. */
export function randomInfo(brand: FutureCardBrand, current: CardInfo): CardInfo {
  const [position, ranks] = pick(brand.roleCombos);
  return {
    ...current,
    company: Math.random() < 0.75 ? pick(brand.companies) : pick(brand.dreamCompanies),
    dept: pick(brand.depts),
    rank: pick(ranks),
    position,
    slogan: pick(brand.slogans),
  };
}

/** "팀장 · 부장" 처럼 직책과 직급을 한 줄로 */
export function titleLine(info: CardInfo): string {
  const parts = [info.position.trim(), info.rank.trim()].filter(Boolean);
  return Array.from(new Set(parts)).join(" · ");
}
