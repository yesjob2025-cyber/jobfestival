// ─────────────────────────────────────────────────────────────
// 미래 명함 — 행사(학교)별 설정
//
// 명함에 찍히는 학교 약칭, 회사 빠른 선택 목록, 랜덤 추천 문구가 행사마다 다릅니다.
// 새 행사를 추가하려면 여기에 항목을 하나 더 만들고 페이지에서 brand 를 넘기면 됩니다.
// ─────────────────────────────────────────────────────────────

import { COMPANIES, EXPO } from "@/lib/expo";
import { KDU_EXPO } from "@/lib/kdu";
import type { KduDesignId } from "./cards-kdu";
import type { KmouDesignId } from "./cards-kmou";

export interface FutureCardBrand {
  id: "kmou" | "kdu";
  /** 명함에 찍히는 학교 약칭 */
  short: string;
  /** 박람회 연도 — 명함은 10년 후 */
  year: number;
  /** 레트로 사원증 번호에 들어가는 박람회 날짜 (MMDD) */
  dateCode: string;
  /** 회사 빠른 선택 목록과 그 안내 문구 */
  companies: readonly string[];
  companiesLabel: string;
  /** 랜덤 추천에만 섞는 상상 속 회사 */
  dreamCompanies: readonly string[];
  depts: readonly string[];
  /** 직책 빠른 선택 */
  positions: readonly string[];
  /** 랜덤 추천용 직책 → 어울리는 직급 ("팀장 · 사장" 같은 조합을 막습니다) */
  roleCombos: readonly (readonly [position: string, ranks: readonly string[]])[];
  slogans: readonly string[];
  /** 고를 수 있는 명함 디자인 (첫 번째가 기본) */
  designs: readonly (KmouDesignId | KduDesignId)[];
  /** 완성 명함을 QR 로 휴대폰에 받는 페이지 — 없으면 QR 받기 숨김 */
  receivePath?: string;
}

const COMMON_ROLES = [
  ["팀장", ["과장", "차장", "부장"]],
  ["파트장", ["대리", "과장", "차장"]],
  ["본부장", ["이사", "상무", "전무"]],
  ["센터장", ["부장", "이사", "상무"]],
  ["수석연구원", ["부장", "이사"]],
  ["지사장", ["부장", "이사"]],
  ["CTO", ["상무", "전무"]],
  ["CEO", ["사장"]],
] as const;

const COMMON_SLOGANS = ["어제보다 한 뼘 더 성장 중", "꿈은 크게, 연봉은 더 크게", "점심 메뉴 결정 전문가"];

export const KMOU_BRAND: FutureCardBrand = {
  id: "kmou",
  short: "KMOU",
  year: Number(EXPO.year),
  dateCode: "0910",
  companies: Array.from(new Set(COMPANIES.map((c) => c.name))),
  companiesLabel: "🏢 박람회 참여기업에서 고르기",
  dreamCompanies: ["(주)내꿈컴퍼니", "오션드림 해운(주)", "블루웨이브 테크", "KMOU 마린벤처스", "글로벌 오션 로지스틱스"],
  depts: [
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
  ],
  positions: ["팀장", "파트장", "본부장", "센터장", "수석연구원", "선장", "기관장", "지사장", "CTO", "CEO"],
  roleCombos: [...COMMON_ROLES, ["선장", [""]], ["기관장", [""]]],
  slogans: [
    "바다처럼 넓게, 파도처럼 힘차게",
    `${EXPO.year} 취업박람회에서 시작된 꿈`,
    "오늘도 출근 대신 출항합니다",
    "세계 5대양을 무대로 일합니다",
    "KMOU가 키운 글로벌 인재",
    ...COMMON_SLOGANS,
  ],
  designs: ["navy", "classic", "startup", "minimal", "marine", "retro"],
};

export const KDU_BRAND: FutureCardBrand = {
  id: "kdu",
  short: "KDU",
  year: KDU_EXPO.year,
  dateCode: "1028",
  companies: [
    "삼성전자",
    "SK하이닉스",
    "현대자동차",
    "LG전자",
    "네이버",
    "카카오",
    "CJ제일제당",
    "대한항공",
    "신한은행",
    "롯데호텔",
    "서울아산병원",
    "한국전력공사",
    "국민건강보험공단",
    "경찰청",
  ],
  companiesLabel: "🏢 인기 기업 · 기관에서 고르기",
  dreamCompanies: ["(주)내꿈컴퍼니", "펀펀 엔터테인먼트", "KDU 라이언스 벤처스", "드림잡 글로벌", "퓨처웨이브 테크"],
  depts: [
    "경영기획팀",
    "인사팀",
    "마케팅팀",
    "해외영업팀",
    "AI개발팀",
    "데이터분석팀",
    "UX디자인팀",
    "간호부",
    "재활치료센터",
    "호텔경영팀",
    "관광상품개발팀",
    "콘텐츠기획팀",
  ],
  positions: ["팀장", "파트장", "본부장", "센터장", "수석연구원", "수간호사", "총지배인", "지사장", "CTO", "CEO"],
  roleCombos: [...COMMON_ROLES, ["수간호사", [""]], ["총지배인", ["이사", "상무"]]],
  slogans: [
    "즐거운 취업, 여기 다 있JOB!",
    "경동대에서 시작된 Fun Fun한 미래",
    `${KDU_EXPO.year} Fun Fun Job Festival 출신`,
    "당신의 미래, 즐겁게 준비했습니다",
    "KDU가 키운 글로벌 인재",
    ...COMMON_SLOGANS,
  ],
  designs: ["funfun", "kduNavy", "kduClassic", "mascot", "sticker", "pinkfun", "bubble", "badge", "ticket", "dream"],
  receivePath: "/kdu/card",
};

export const BRANDS = { kmou: KMOU_BRAND, kdu: KDU_BRAND } as const;
export type BrandId = keyof typeof BRANDS;

export const futureYear = (brand: FutureCardBrand) => brand.year + 10;
