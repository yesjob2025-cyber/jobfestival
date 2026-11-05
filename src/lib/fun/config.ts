// ─────────────────────────────────────────────────────────────
// 취업박람회 부대행사 (/fun) — 행사 정보 · 이벤트 목록
//
// 다른 박람회에서 쓸 때는 FUN 의 학교 · 행사명과 tailwind 의 kdu 색만 바꾸면 됩니다.
// 각 이벤트는 독립된 주소로 운영합니다 (태블릿 한 대에 이벤트 하나).
// ─────────────────────────────────────────────────────────────

export interface FunBrand {
  school: string;
  short: string;
  festival: string;
  year: number;
  /** 결과 카드 구석에 들어가는 그림 (마스코트 · 기관 로고, 없으면 "") */
  mascot: string;
  /** QR 로 받은 결과 이미지 · 영상이 남아 있는 기간 */
  keepDays: number;
}

const KDU_BRAND: FunBrand = {
  school: "경동대학교",
  short: "KDU",
  festival: "Fun Fun Job Festival",
  year: 2026,
  mascot: "/kdu/lion.webp",
  keepDays: 3,
};

/**
 * 지금 화면의 행사 이름표 — /fun 은 경동대 그대로, 체험판 · 행사 전용 부스 화면은
 * 브라우저에서 brandFun() 으로 바꿔 씁니다 (결과 카드 · 네컷 · 영상 글자가 이것을 읽음).
 */
export const FUN: FunBrand = { ...KDU_BRAND };

/** 브라우저 전용 — 서버에서 부르면 요청끼리 섞이므로 쓰지 마세요 */
export function brandFun(b: Partial<FunBrand> | null) {
  Object.assign(FUN, KDU_BRAND, b ?? {});
}

export interface FunEvent {
  slug: string;
  emoji: string;
  name: string;
  desc: string;
  /** 사진 · 영상 촬영이 필요한지 (부스 태블릿용) */
  camera: boolean;
  corner: CornerId;
  /** 이벤트 화면 위쪽 띠 설명 */
  sub: string;
}

/** 부대행사 코너 — 운세 · 사진 · 취업 */
export const CORNERS = [
  { id: "fortune", emoji: "🔮", name: "운세 코너", desc: "타로 · 관상 · 손금 · 동물상으로 보는 나의 취업운", color: "#7A3FD0" },
  { id: "photo", emoji: "📸", name: "사진 코너", desc: "미래 명함 · 네컷 · 이력서 사진을 바로 내 폰에", color: "#E4457A" },
  { id: "career", emoji: "💼", name: "취업 코너", desc: "직무 유형 진단부터 1분 자기소개 영상까지", color: "#13399A" },
] as const;
export type CornerId = (typeof CORNERS)[number]["id"];

export const FUN_EVENTS: FunEvent[] = [
  { slug: "tarot", emoji: "🔮", name: "취업 타로", desc: "카드 3장으로 보는 나의 취업운", camera: false, corner: "fortune", sub: "고민을 고르고 카드 3장을 뽑으면, 나의 취업운을 알려 드려요! (재미로 보는 운세)" },
  { slug: "face", emoji: "🧿", name: "취업 관상", desc: "삼정 · 이마 · 눈 · 코 · 입으로 보는 직장운", camera: true, corner: "fortune", sub: "얼굴을 비추면 이마 · 눈 · 코 · 입 · 턱을 재서 직장운으로 풀이해 줘요. (재미로 보는 관상)" },
  { slug: "palm", emoji: "✋", name: "취업 손금", desc: "내 손금에 숨은 직무 성향", camera: true, corner: "fortune", sub: "손바닥을 활짝 펴서 비춰 주세요! 진짜 손금 주름을 찾아 읽는 나의 직무 성향 (재미로 보는 손금)" },
  { slug: "animal", emoji: "🐶", name: "동물상 테스트", desc: "나는 무슨 동물상? 어울리는 직무는?", camera: true, corner: "fortune", sub: "눈매 · 얼굴형으로 보는 나의 동물상! 어울리는 직무와 찰떡 동료까지 (재미로 보는 테스트)" },
  { slug: "future-card", emoji: "📇", name: "미래 명함 만들기", desc: "10년 후 나의 명함을 만들어요", camera: true, corner: "photo", sub: "사진 촬영 → 필터 · 소품 → 명함 내용 → 디자인, 1분이면 완성!" },
  { slug: "four-cut", emoji: "🎞️", name: "펀펀 네컷", desc: "친구와 찍는 네 컷 사진", camera: true, corner: "photo", sub: "5초마다 한 컷씩, 네 번 찍어요! 프레임 · 배경 · 필터는 찍은 뒤에 골라요" },
  { slug: "id-photo", emoji: "👔", name: "이력서 사진", desc: "정장 입고 배경 바꾼 증명사진", camera: true, corner: "photo", sub: "평상복 그대로 찍어도 OK! 정장 · 배경색을 골라 3:4 증명사진으로 만들어 드려요" },
  { slug: "intro", emoji: "🎤", name: "강점 매칭 1분 자기소개", desc: "유형 진단 → 강점 · 직무 매칭 → AI 대본 → 영상", camera: true, corner: "career", sub: "직무 유형을 진단하고, 내 강점을 희망 직무가 원하는 역량과 맞춰 AI가 1분 대본을 써 줘요. 대본을 읽으며 영상으로 찍어 가세요!" },
  { slug: "job-type", emoji: "🧭", name: "직무 유형 테스트", desc: "12문항으로 찾는 나의 직무 유형", camera: false, corner: "career", sub: "12문항 · 1분! 홀랜드 직업 흥미 유형으로 나에게 맞는 직무를 찾아요" },
];

export const funEvent = (slug: string) => FUN_EVENTS.find((e) => e.slug === slug)!;
