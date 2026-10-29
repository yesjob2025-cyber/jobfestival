// ─────────────────────────────────────────────────────────────
// 취업 손금 — 손 마디 21곳(MediaPipe Hand Landmarker)으로 손 모양을 재고,
// 손바닥 좌표에 맞춰 생명선 · 두뇌선 · 감정선 · 운명선을 그려 풀이합니다. (재미로 보는 손금)
// 실제 주름을 읽는 게 아니라 손 모양 비율로 풀이하며, 모든 풀이는 긍정적으로 씁니다.
// ─────────────────────────────────────────────────────────────

export type Pt = { x: number; y: number };

/** 손 모양 4유형 (손바닥 비율 × 손가락 길이) */
export const HAND_TYPES = {
  earth: { emoji: "⛰️", name: "흙의 손", nick: "든든한 실무형", color: "#8A5A3C",
    desc: "네모난 손바닥과 단단한 손가락 — 맡은 일을 끝까지 해내는 믿음직한 손이에요.",
    jobs: ["엔지니어 · 설비", "공공기관 · 공기업", "생산 · 품질관리"] },
  air: { emoji: "🌬️", name: "바람의 손", nick: "소통 기획형", color: "#08A0F6",
    desc: "네모난 손바닥에 긴 손가락 — 생각을 말과 글로 정리하는 데 강한 손이에요.",
    jobs: ["기획 · 마케팅", "홍보 · 미디어", "IT · 데이터"] },
  fire: { emoji: "🔥", name: "불의 손", nick: "열정 추진형", color: "#F08C00",
    desc: "긴 손바닥에 짧고 힘 있는 손가락 — 목표가 생기면 바로 움직이는 추진력의 손!",
    jobs: ["영업 · 해외영업", "창업 · 신사업", "경찰 · 소방 · 군 간부"] },
  water: { emoji: "💧", name: "물의 손", nick: "감성 창작형", color: "#7A6FE0",
    desc: "긴 손바닥에 가늘고 긴 손가락 — 섬세한 감각과 공감 능력이 빛나는 손이에요.",
    jobs: ["디자인 · 콘텐츠", "간호 · 상담 · 복지", "교육 · 서비스"] },
} as const;
export type HandTypeId = keyof typeof HAND_TYPES;

export interface Reading {
  type: HandTypeId;
  /** 검지가 약지보다 긴지 */
  indexLong: boolean;
  /** 엄지가 넓게 벌어지는지 */
  thumbOpen: boolean;
  /** 각 선의 세기 1~3 */
  lines: { life: number; head: number; heart: number; fate: number };
}

export const LINE_TEXT = {
  life: { name: "생명선", emoji: "💚", text: ["꾸준함이 무기! 오래 달릴 수 있는 체력형", "회복력이 좋아 슬럼프도 금방 털어내요", "에너지가 넘쳐서 어디서든 활력소!"] },
  head: { name: "두뇌선", emoji: "🧠", text: ["직관이 빠른 감각파 — 순간 판단이 강해요", "논리와 감각의 균형이 좋은 실속파", "깊이 생각하는 전략가 — 계획이 탄탄해요"] },
  heart: { name: "감정선", emoji: "💗", text: ["차분하고 담백한 프로 스타일", "배려심이 깊어 팀에서 사랑받아요", "공감 능력 최고! 사람을 움직이는 힘"] },
  fate: { name: "운명선", emoji: "⭐", text: ["스스로 길을 만드는 개척자", "기회를 알아보는 눈이 있어요", "뚜렷한 목표로 쭉 뻗어 가는 커리어"] },
} as const;
export type LineId = keyof typeof LINE_TEXT;

export const TRAITS = {
  indexLong: ["👑 검지가 긴 리더형 — 자신감 있게 앞에 서는 타입", "🎨 약지가 긴 도전형 — 새롭고 창의적인 것에 끌리는 타입"],
  thumbOpen: ["🕊️ 엄지가 활짝 — 열린 마음으로 새 환경에 금방 적응해요", "🛡️ 엄지가 단정 — 신중하고 원칙을 지키는 타입이에요"],
};

const d = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const chain = (lm: Pt[], ids: number[]) => ids.slice(1).reduce((s, id, i) => s + d(lm[ids[i]], lm[id]), 0);

export function readPalm(lm: Pt[]): Reading {
  const L = d(lm[0], lm[9]);
  const W = d(lm[5], lm[17]);
  const middle = chain(lm, [9, 10, 11, 12]);
  const index = chain(lm, [5, 6, 7, 8]);
  const ring = chain(lm, [13, 14, 15, 16]);
  // 엄지 끝이 검지 뿌리에서 얼마나 떨어졌는지 (손바닥 폭 대비)
  const thumbSpread = d(lm[4], lm[5]) / W;

  const squarePalm = W / L > 0.86;
  const longFingers = middle / L > 0.92;
  const type: HandTypeId = squarePalm ? (longFingers ? "air" : "earth") : longFingers ? "water" : "fire";

  // 선의 세기 — 손 비율에서 정하고, 같은 손이면 같은 결과가 나오게 좌표로 섞어 줍니다.
  const mix = (v: number) => 1 + (Math.floor(Math.abs(v) * 1000) % 3);
  return {
    type,
    indexLong: index > ring * 1.0,
    thumbOpen: thumbSpread > 1.05,
    lines: {
      life: mix(L * 7.1 + thumbSpread),
      head: mix(index * 5.3 + W),
      heart: mix(ring * 6.7 + middle),
      fate: mix(middle * 4.9 + L),
    },
  };
}

/**
 * 손바닥 좌표 → 사진 좌표.
 * a: 손바닥 가로 (엄지 쪽 -0.5 … 새끼 쪽 +0.5, 손바닥 폭 단위), b: 세로 (손목 0 … 중지 뿌리 1)
 */
export function palmFrame(lm: Pt[], size: number) {
  const P = (i: number) => ({ x: lm[i].x * size, y: lm[i].y * size });
  const w = P(0);
  const m = P(9);
  const up = { x: m.x - w.x, y: m.y - w.y };
  const L = Math.hypot(up.x, up.y);
  let side = { x: -up.y / L, y: up.x / L };
  const i5 = P(5);
  const p17 = P(17);
  const across = { x: p17.x - i5.x, y: p17.y - i5.y };
  if (across.x * side.x + across.y * side.y < 0) side = { x: -side.x, y: -side.y };
  const W = Math.abs(across.x * side.x + across.y * side.y);
  return {
    L,
    W,
    at: (a: number, b: number): Pt => ({ x: w.x + up.x * b + side.x * a * W, y: w.y + up.y * b + side.y * a * W }),
  };
}

/** 각 선의 모양 (손바닥 좌표의 점 3개 — 시작 · 휘는 점 · 끝). 세기가 셀수록 길게 */
export function linePath(id: LineId, strength: number): [number, number][] {
  const s = 0.8 + strength * 0.1;
  switch (id) {
    case "heart":
      return [[0.66, 0.86], [0.14, 0.74], [0.66 - 1.05 * s, 0.92]];
    case "head":
      return [[-0.62, 0.68], [0.0, 0.56], [-0.62 + 1.15 * s, 0.48]];
    case "life":
      return [[-0.58, 0.66], [-0.02, 0.36], [-0.3, 0.66 - 0.64 * s]];
    case "fate":
      return [[0.06, 0.04], [-0.02, 0.36], [0.0, 0.1 + 0.6 * s]];
  }
}

export const LINE_COLORS: Record<LineId, string> = { life: "#4CE38B", head: "#3EC3FE", heart: "#FF6FA5", fate: "#FFD21E" };
