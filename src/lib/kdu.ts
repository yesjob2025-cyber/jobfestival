// ─────────────────────────────────────────────────────────────
// 2026학년도 경동대학교 Fun Fun Job Festival — 행사 정보 (포스터 기준)
//
// /kdu 페이지와 /kdu/future-card 가 이 파일만 읽습니다.
// ─────────────────────────────────────────────────────────────

export const KDU_EXPO = {
  year: 2026,
  school: "경동대학교",
  schoolEn: "KYUNGDONG UNIVERSITY",
  title: "2026학년도 경동대학교 Fun Fun Job Festival",
  catchphrase: "당신의 미래, 즐겁게 준비하자!",
  bubble: "즐거운 취업, 여기 다 있JOB!",
  dateLabel: "2026. 10. 28 (수)",
  timeLabel: "11:30 ~ 16:00",
  venue: "메트로폴캠퍼스 우당관 1층 도서관 & 로비",
  host: "취업사관교육센터 / KDU 앵커사업단",
  hostUnit: "취업사관교육센터",
  closing: ["다양한 기업과의 만남, 즐거운 이벤트, 푸짐한 혜택까지!", "경동대에서 당신의 미래를 Fun Fun하게!"],
} as const;

export const KDU_PROGRAMS = [
  { icon: "🔍", name: "기업채용관", desc: "우수 기업 채용 상담 및 현장 면접" },
  { icon: "🎁", name: "이벤트관", desc: "다양한 이벤트와 즐길 거리 가득!" },
] as const;

export const KDU_BENEFITS = [
  { icon: "🎁", name: "참여자 선물" },
  { icon: "🎰", name: "경품 추첨" },
  { icon: "☕", name: "커피 제공" },
  { icon: "🍩", name: "간식 제공" },
] as const;
