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
  corner: CornerId;
}

/** 부대행사 코너 — 운세 · 사진 · 취업 */
export const CORNERS = [
  { id: "fortune", emoji: "🔮", name: "운세 코너", desc: "타로 · 손금 · 관상으로 보는 나의 취업운", color: "#7A3FD0" },
  { id: "photo", emoji: "📸", name: "사진 코너", desc: "미래 명함 · 네컷 · 이력서 사진을 바로 내 폰에", color: "#E4457A" },
  { id: "career", emoji: "💼", name: "취업 코너", desc: "직무 유형 진단부터 1분 자기소개 영상까지", color: "#13399A" },
] as const;
export type CornerId = (typeof CORNERS)[number]["id"];

export const FUN_EVENTS: FunEvent[] = [
  { slug: "tarot", emoji: "🔮", name: "취업 타로", desc: "카드 3장으로 보는 나의 취업운", camera: false, corner: "fortune" },
  { slug: "palm", emoji: "✋", name: "취업 손금", desc: "내 손금에 숨은 직무 성향", camera: true, corner: "fortune" },
  { slug: "animal", emoji: "🐶", name: "동물상 테스트", desc: "나는 무슨 동물상? 어울리는 직무는?", camera: true, corner: "fortune" },
  { slug: "future-card", emoji: "📇", name: "미래 명함 만들기", desc: "10년 후 나의 명함을 만들어요", camera: true, corner: "photo" },
  { slug: "four-cut", emoji: "🎞️", name: "펀펀 네컷", desc: "친구와 찍는 네 컷 사진", camera: true, corner: "photo" },
  { slug: "id-photo", emoji: "👔", name: "이력서 사진", desc: "정장 입고 배경 바꾼 증명사진", camera: true, corner: "photo" },
  { slug: "intro", emoji: "🎤", name: "강점 매칭 1분 자기소개", desc: "유형 진단 → 강점 · 직무 매칭 → AI 대본 → 영상", camera: true, corner: "career" },
  { slug: "job-type", emoji: "🧭", name: "직무 유형 테스트", desc: "12문항으로 찾는 나의 직무 유형", camera: false, corner: "career" },
];

export const funEvent = (slug: string) => FUN_EVENTS.find((e) => e.slug === slug)!;
