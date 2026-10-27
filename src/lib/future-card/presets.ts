// ─────────────────────────────────────────────────────────────
// 미래 명함 — 입력 항목 · 빠른 선택 목록 · 랜덤 추천
// ─────────────────────────────────────────────────────────────

import { COMPANIES, EXPO } from "@/lib/expo";

export const FUTURE_YEAR = Number(EXPO.year) + 10;

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

/** 박람회 참여기업 이름 (중복 제거) */
export const EXPO_COMPANY_NAMES = Array.from(new Set(COMPANIES.map((c) => c.name)));

export const DREAM_COMPANIES = [
  "(주)내꿈컴퍼니",
  "오션드림 해운(주)",
  "블루웨이브 테크",
  "KMOU 마린벤처스",
  "글로벌 오션 로지스틱스",
];

export const DEPTS = [
  "해운영업본부",
  "선박기관팀",
  "항만운영팀",
  "스마트물류팀",
  "친환경연료개발센터",
  "해양플랜트설계팀",
  "AI연구소",
  "데이터분석팀",
  "글로벌전략실",
  "인사팀",
  "재무기획팀",
  "해양환경연구팀",
];

export const RANKS = ["사원", "주임", "대리", "과장", "차장", "부장", "이사", "상무", "전무", "사장"];

export const POSITIONS = [
  "팀장",
  "파트장",
  "본부장",
  "센터장",
  "수석연구원",
  "선장",
  "기관장",
  "지사장",
  "CTO",
  "CEO",
];

export const SLOGANS = [
  "바다처럼 넓게, 파도처럼 힘차게",
  `${EXPO.year} 취업박람회에서 시작된 꿈`,
  "오늘도 출근 대신 출항합니다",
  "세계 5대양을 무대로 일합니다",
  "어제보다 한 뼘 더 성장 중",
  "꿈은 크게, 연봉은 더 크게",
  "점심 메뉴 결정 전문가",
  "KMOU가 키운 글로벌 인재",
];

/** 랜덤 추천용 직책 → 어울리는 직급 ("팀장 · 사장" 같은 조합을 막습니다) */
const ROLE_COMBOS: readonly [position: string, ranks: readonly string[]][] = [
  ["팀장", ["과장", "차장", "부장"]],
  ["파트장", ["대리", "과장", "차장"]],
  ["본부장", ["이사", "상무", "전무"]],
  ["센터장", ["부장", "이사", "상무"]],
  ["수석연구원", ["부장", "이사"]],
  ["선장", [""]],
  ["기관장", [""]],
  ["지사장", ["부장", "이사"]],
  ["CTO", ["상무", "전무"]],
  ["CEO", ["사장"]],
];

const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

/** 이름은 그대로 두고 나머지를 랜덤으로 채웁니다. */
export function randomInfo(current: CardInfo): CardInfo {
  const [position, ranks] = pick(ROLE_COMBOS);
  return {
    ...current,
    company: Math.random() < 0.75 ? pick(EXPO_COMPANY_NAMES) : pick(DREAM_COMPANIES),
    dept: pick(DEPTS),
    rank: pick(ranks),
    position,
    slogan: pick(SLOGANS),
  };
}

/** "팀장 · 부장" 처럼 직책과 직급을 한 줄로 */
export function titleLine(info: CardInfo): string {
  const parts = [info.position.trim(), info.rank.trim()].filter(Boolean);
  return Array.from(new Set(parts)).join(" · ");
}
