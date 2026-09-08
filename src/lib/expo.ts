// ─────────────────────────────────────────────────────────────
// 2026 국립한국해양대학교(KMOU) 취업박람회 — 행사 정보 · 참여기업 데이터
//
// 이 파일 하나만 수정하면 사이트 전체에 반영됩니다.
//  · 행사 개요 → EXPO
//  · 참여기업  → src/lib/companies.ts (웹북 기준)
//  · 채용설명회 → SESSIONS
//  · 동문 멘토  → MENTORS
//  · 이벤트     → EVENTS
// ─────────────────────────────────────────────────────────────

import { COMPANIES, type ExpoCompany } from "./companies";

export const EXPO = {
  title: "2026 국립한국해양대학교(KMOU) 취업박람회",
  titleShort: "국립한국해양대학교(KMOU) 취업박람회",
  year: "2026",
  dateLabel: "2026. 9. 10. (목)",
  dateShort: "9.10 THU",
  timeLabel: "10:00 ~ 17:00",
  venue: "도서관 신관 1층 및 4층 라이브러리홀",
  boothSummary: "공공기관 및 일반기업 등 35여개 부스 운영",
  host: "국립한국해양대학교 학생처 학생성장지원실",
  sponsors: [
    "고용노동부 부산지방고용노동청",
    "영도구청",
    "부산경제진흥원",
    "한국TOEIC위원회",
  ],
  platform: "글로벌 성장큐레이션 ABCDE 플랫폼 (국립대학육성사업)",
  siteUrl: "https://jobfestival.co.kr",
} as const;

// 참여기업 데이터는 src/lib/companies.ts (웹북 기준) 에서 관리합니다.
export type { ExpoCompany, JobPosting, LabeledValue } from "./companies";
export { COMPANIES } from "./companies";


/** 채용설명회 (4층 라이브러리홀) */
export interface ExpoSession {
  time: string;
  company: string;
}

export const SESSIONS: ExpoSession[] = [
  { time: "11:00~11:50", company: "한국자산관리공사" },
  { time: "13:00~13:50", company: "HD 현대중공업(주)" },
  { time: "14:00~14:50", company: "(주)대한항공 항공우주사업본부" },
  { time: "15:00~15:50", company: "HUG 주택도시보증공사" },];

/** 현직자 동문선배 멘토링 */
export interface ExpoMentor {
  id: string;
  name: string;
  company: string;
  position: string;
  dept: string;
}

export const MENTORS: ExpoMentor[] = [
  { id: "m01", name: "김결", company: "SK하이닉스(주)", position: "TL", dept: "NAND ETCH 기술" },
  { id: "m02", name: "이동헌", company: "EXAIL", position: "지사장", dept: "한국사무소" },
  { id: "m03", name: "안준우", company: "HD현대중공업(주)", position: "엔지니어", dept: "전장설계부" },
  { id: "m04", name: "정범", company: "(주)포스에스엠", position: "선임감독", dept: "탱커선단" },
  { id: "m05", name: "남성민", company: "해양환경공단", position: "대리", dept: "교육운영처" },
  { id: "m06", name: "전태훈", company: "부산교통공사", position: "주임", dept: "경전철운영사업소 기술부 신호팀" },
  { id: "m07", name: "김동연", company: "부산환경공단", position: "대리", dept: "기장사업소 전기6급" },
  { id: "m08", name: "김태호", company: "르노코리아(주)", position: "섹션장", dept: "차량품질팀" },];

/** 부대 이벤트 */
export const EVENTS = [
  { name: "퍼스널컬러 진단", desc: "나에게 어울리는 면접 컬러를 찾아보세요" },
  { name: "캐리커처", desc: "현장에서 그려주는 나만의 캐리커처" },
  { name: "취업타로", desc: "가볍게 즐기는 취업 운세 상담" },
  { name: "천연허브 야돔 만들기", desc: "직접 만드는 천연 허브 아로마 스틱" },
] as const;

/** 기업분류 표시 순서 (필터 탭) */
export const CATEGORY_ORDER = [
  "국가기관",
  "공기업",
  "공공기관",
  "준정부기관",
  "대기업",
  "중견기업",
  "중소기업",
  "금융기관",
  "외국계기업",
  "기타",
] as const;

export function getCompany(id: string): ExpoCompany | undefined {
  return COMPANIES.find((c) => c.id === id);
}

/** 해당 기업의 채용설명회 일정 */
function normalize(name: string): string {
  return name.replace(/[\s()（）㈜]|주식회사|\(주\)|\(재\)|\(사\)/g, "");
}

export function sessionFor(company: ExpoCompany): ExpoSession | undefined {
  return SESSIONS.find((s) => normalize(s.company) === normalize(company.name));
}

/** 해당 기업에 재직 중인 동문 멘토 */
export function mentorsFor(company: ExpoCompany): ExpoMentor[] {
  return MENTORS.filter((m) => normalize(m.company) === normalize(company.name));
}
