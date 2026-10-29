// ─────────────────────────────────────────────────────────────
// 취업박람회 부대행사 (/fun) — 행사 정보 · 이벤트 목록
//
// 다른 박람회에서 쓸 때는 FUN 의 학교 · 행사명과 tailwind 의 kdu 색만 바꾸면 됩니다.
// 각 이벤트는 독립된 주소로 운영합니다 (태블릿 한 대에 이벤트 하나).
// ─────────────────────────────────────────────────────────────

export const FUN = {
  school: "경동대학교",
  short: "KDU",
  festival: "Fun Fun Job Festival",
  year: 2026,
  mascot: "/kdu/lion.webp",
  /** QR 로 받은 결과 이미지 · 영상이 남아 있는 기간 */
  keepDays: 3,
} as const;

export interface FunEvent {
  slug: string;
  emoji: string;
  name: string;
  desc: string;
  /** 사진 · 영상 촬영이 필요한지 (부스 태블릿용) */
  camera: boolean;
}

export const FUN_EVENTS: FunEvent[] = [
  { slug: "future-card", emoji: "📇", name: "미래 명함 만들기", desc: "10년 후 나의 명함을 만들어요", camera: true },
  { slug: "tarot", emoji: "🔮", name: "취업 타로", desc: "카드 3장으로 보는 나의 취업운", camera: false },
  { slug: "palm", emoji: "✋", name: "취업 손금", desc: "내 손금에 숨은 직무 성향", camera: true },
  { slug: "four-cut", emoji: "🎞️", name: "펀펀 네컷", desc: "친구와 찍는 네 컷 사진", camera: true },
  { slug: "id-photo", emoji: "👔", name: "이력서 사진", desc: "정장 입고 배경 바꾼 증명사진", camera: true },
  { slug: "intro", emoji: "🎤", name: "1분 자기소개", desc: "AI 대본으로 찍는 자기소개 영상", camera: true },
  { slug: "animal", emoji: "🐶", name: "동물상 테스트", desc: "나는 무슨 동물상? 어울리는 직무는?", camera: true },
  { slug: "job-type", emoji: "🧭", name: "직무 유형 테스트", desc: "12문항으로 찾는 나의 직무 유형", camera: false },
];

export const funEvent = (slug: string) => FUN_EVENTS.find((e) => e.slug === slug)!;
