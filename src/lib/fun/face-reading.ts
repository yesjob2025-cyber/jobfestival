// ─────────────────────────────────────────────────────────────
// 취업 관상 — 얼굴 윤곽 478점(MediaPipe Face Landmarker)으로 관상에서 보는 부위를 재고,
// 삼정(초년 · 중년 · 말년) · 부위 7곳 · 관상 유형을 직장운으로 풀이합니다. (재미로 보는 관상)
//
// 모든 길이는 얼굴 기울기를 바로잡은 뒤 얼굴 폭 · 높이 대비 비율로 잽니다.
// 풀이는 어느 쪽이 나와도 장점으로만 씁니다 — 외모를 평가하는 말은 쓰지 않습니다.
// ─────────────────────────────────────────────────────────────

type Pt = { x: number; y: number };

export interface FaceMeasure {
  /** 삼정 — 이마 꼭대기 · 눈썹 · 코 밑 · 턱 끝 사이 길이 (얼굴 높이 대비) */
  upper: number;
  middle: number;
  lower: number;
  /** 미간 너비 / 얼굴 폭 */
  browGap: number;
  /** 눈썹 길이 / 눈 길이 */
  browLen: number;
  /** 눈썹 기울기 (안쪽보다 바깥이 높을수록 +, 도) */
  browTilt: number;
  /** 눈 길이 / 얼굴 폭 */
  eyeSize: number;
  /** 눈 세로 / 가로 */
  eyeOpen: number;
  /** 눈꼬리 기울기 (바깥이 높을수록 +, 도) */
  eyeTilt: number;
  /** 콧방울 너비 / 얼굴 폭 */
  noseW: number;
  /** 콧대 길이 (미간 → 코 밑) / 얼굴 높이 */
  noseLen: number;
  /** 입 너비 / 얼굴 폭 */
  mouthW: number;
  /** 입술 두께 / 입 너비 */
  lip: number;
  /** 입꼬리 올라감 (입 너비 대비, +가 올라감) */
  smile: number;
  /** 턱 너비 / 얼굴 폭 */
  jaw: number;
  /** 얼굴 높이 / 폭 */
  ratio: number;
}

export function measureFace(lm: Pt[]): FaceMeasure {
  // 얼굴 축: 이마 꼭대기(10) → 턱 끝(152). 이 축 기준 좌표(u: 가로, v: 세로)로 바꿔 기울기를 없앱니다.
  const top = lm[10];
  const chin = lm[152];
  const ax = chin.x - top.x;
  const ay = chin.y - top.y;
  const H = Math.hypot(ax, ay);
  const ux = ay / H;
  const uy = -ax / H;
  const v = (p: Pt) => ((p.x - top.x) * ax + (p.y - top.y) * ay) / H;
  const u = (p: Pt) => (p.x - top.x) * ux + (p.y - top.y) * uy;
  const d = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
  const W = d(lm[234], lm[454]);

  const brow = (v(lm[105]) + v(lm[334])) / 2;
  const noseBase = v(lm[2]);
  // 이미지 왼쪽 눈 · 눈썹이 33(바깥)~133(안쪽), 오른쪽이 263~362 — 바깥이 높을수록 + 가 되게
  const tilt = (outer: Pt, inner: Pt) => (Math.atan2(v(inner) - v(outer), Math.abs(u(inner) - u(outer))) * 180) / Math.PI;
  const eyeL = d(lm[33], lm[133]);
  const eyeR = d(lm[263], lm[362]);
  const mouth = d(lm[61], lm[291]);
  const corners = (v(lm[61]) + v(lm[291])) / 2;
  const lipCenter = (v(lm[13]) + v(lm[14])) / 2;

  return {
    upper: brow / H,
    middle: (noseBase - brow) / H,
    lower: (H - noseBase) / H,
    browGap: d(lm[107], lm[336]) / W,
    browLen: (d(lm[70], lm[107]) + d(lm[300], lm[336])) / (eyeL + eyeR),
    browTilt: (tilt(lm[70], lm[107]) + tilt(lm[300], lm[336])) / 2,
    eyeSize: (eyeL + eyeR) / 2 / W,
    eyeOpen: (d(lm[159], lm[145]) / eyeL + d(lm[386], lm[374]) / eyeR) / 2,
    eyeTilt: (tilt(lm[33], lm[133]) + tilt(lm[263], lm[362])) / 2,
    noseW: d(lm[98], lm[327]) / W,
    noseLen: (noseBase - v(lm[168])) / H,
    mouthW: mouth / W,
    lip: (v(lm[17]) - v(lm[0])) / mouth,
    smile: (lipCenter - corners) / mouth,
    jaw: d(lm[172], lm[397]) / W,
    ratio: H / W,
  };
}

// 정면 사진의 보통 값과 폭 — 여기서 어느 쪽으로 얼마나 벗어나는지로 부위 모양을 고릅니다.
const MEAN: FaceMeasure = {
  // 이마 꼭대기 점(10)이 머리카락 선보다 아래라 상정이 짧게 잡히는 것까지 반영한 값
  upper: 0.155, middle: 0.43, lower: 0.415,
  browGap: 0.225, browLen: 1.45, browTilt: -5,
  eyeSize: 0.207, eyeOpen: 0.35, eyeTilt: 6,
  noseW: 0.275, noseLen: 0.29,
  mouthW: 0.46, lip: 0.34, smile: 0.1,
  jaw: 0.84, ratio: 1.17,
};
const SPAN: FaceMeasure = {
  upper: 0.015, middle: 0.02, lower: 0.02,
  browGap: 0.015, browLen: 0.1, browTilt: 3,
  eyeSize: 0.01, eyeOpen: 0.05, eyeTilt: 3,
  noseW: 0.015, noseLen: 0.015,
  mouthW: 0.03, lip: 0.05, smile: 0.05,
  jaw: 0.035, ratio: 0.07,
};
const z = (m: FaceMeasure, k: keyof FaceMeasure) => Math.max(-3, Math.min(3, (m[k] - MEAN[k]) / SPAN[k]));

// ── 풀이 ─────────────────────────────────────────────────────

export const LUCKS = {
  office: { emoji: "🏛️", name: "관록운", sub: "직장 · 승진" },
  wealth: { emoji: "💰", name: "재물운", sub: "연봉 · 성과" },
  people: { emoji: "🤝", name: "인복", sub: "동료 · 귀인" },
  wisdom: { emoji: "🦉", name: "지혜", sub: "판단 · 전략" },
  speech: { emoji: "🎤", name: "언변", sub: "발표 · 설득" },
  drive: { emoji: "🦁", name: "추진력", sub: "리더십 · 도전" },
} as const;
export type LuckId = keyof typeof LUCKS;

export const TYPES: Record<LuckId, { emoji: string; name: string; desc: string; jobs: string[]; color: string }> = {
  office: { emoji: "🏛️", name: "승진 가도 관록상", color: "#13399A",
    desc: "조직에서 인정받고 차근차근 높은 자리에 오르는 상. 믿고 맡길 수 있는 사람이라는 인상을 줘요.",
    jobs: ["공무원 · 공공기관", "대기업 관리직", "군 · 경찰 간부"] },
  wealth: { emoji: "💰", name: "재물이 모이는 부자상", color: "#E8A800",
    desc: "기회를 알아보고 성과를 숫자로 만들어 내는 상. 일한 만큼 확실하게 거두는 실속파예요.",
    jobs: ["금융 · 증권", "영업 · 해외영업", "창업 · 사업"] },
  people: { emoji: "🤝", name: "사람이 따르는 인복상", color: "#E4457A",
    desc: "가는 곳마다 귀인을 만나는 상. 사람 사이를 부드럽게 잇는 힘이 커리어의 무기예요.",
    jobs: ["인사(HR)", "호텔 · 서비스", "교육 · 상담"] },
  wisdom: { emoji: "🦉", name: "꿰뚫어 보는 책사상", color: "#5B5BD6",
    desc: "한발 앞을 내다보고 판을 읽는 상. 깊이 생각한 한마디가 팀의 방향을 바꿔요.",
    jobs: ["기획 · 전략", "연구 · R&D", "데이터 분석"] },
  speech: { emoji: "🎤", name: "말로 마음을 여는 달변상", color: "#08A0F6",
    desc: "말에 힘과 온기가 함께 있는 상. 발표 · 설득 · 협상 자리에서 빛나요.",
    jobs: ["마케팅 · 홍보", "방송 · 미디어", "교육 · 강사"] },
  drive: { emoji: "🦁", name: "판을 이끄는 장군상", color: "#F08C00",
    desc: "목표를 정하면 사람을 모아 앞장서는 상. 위기일수록 더 든든해지는 리더예요.",
    jobs: ["CEO · 창업", "프로젝트 리더", "영업 관리"] },
};

export interface PartReading {
  id: string;
  part: string;
  /** 관상 용어 */
  term: string;
  hanja: string;
  /** 잰 모양 */
  shape: string;
  text: string;
  stars: 4 | 5;
  luck: LuckId;
}

export interface Reading {
  type: LuckId;
  /** 취업운 점수 (재미용 70~99) */
  score: number;
  lucks: Record<LuckId, number>;
  /** 삼정 — 가장 긴 구간이 전성기 */
  peak: "upper" | "middle" | "lower";
  thirds: { upper: number; middle: number; lower: number };
  parts: PartReading[];
}

export const PEAK = {
  upper: { name: "초년운", age: "20대", text: "일찍 빛나는 상 — 학업 · 첫 취업 운이 강해 첫 직장에서부터 두각을 나타내요." },
  middle: { name: "중년운", age: "30~40대", text: "실력으로 도약하는 상 — 실무 경험이 쌓이는 30~40대에 승진 가도를 달려요." },
  lower: { name: "말년운", age: "50대 이후", text: "갈수록 좋아지는 대기만성 상 — 경력이 쌓일수록 리더로 크게 자리 잡아요." },
} as const;

/** 측정값 하나로 세 가지 모양 중 하나 고르기 */
function pick<T>(score: number, low: T, mid: T, high: T, cut = 0.6): T {
  return score > cut ? high : score < -cut ? low : mid;
}

const star = (s: number): 4 | 5 => (Math.abs(s) > 1.2 ? 5 : 4);

export function readFace(m: FaceMeasure): Reading {
  const parts: PartReading[] = [];
  const add = (p: Omit<PartReading, "stars">, s: number) => parts.push({ ...p, stars: star(s) });

  const fz = z(m, "upper");
  add(
    pick(
      fz,
      { id: "forehead", part: "이마", term: "관록궁", hanja: "官祿宮", luck: "drive", shape: "단단하고 아담한 이마", text: "실전에서 빨리 배우는 현장형 — 일찍 자리 잡고 손으로 성과를 내요." },
      { id: "forehead", part: "이마", term: "관록궁", hanja: "官祿宮", luck: "office", shape: "균형 잡힌 이마", text: "꾸준히 커리어를 쌓아 올리는 상 — 조직에서 신뢰를 받아요." },
      { id: "forehead", part: "이마", term: "관록궁", hanja: "官祿宮", luck: "office", shape: "넓고 시원한 이마", text: "공부운 · 관운이 좋은 상 — 시험 · 공채에 강하고 승진이 빨라요." },
    ),
    fz,
  );

  const gz = z(m, "browGap");
  add(
    pick(
      gz,
      { id: "glabella", part: "미간", term: "명궁", hanja: "命宮", luck: "wisdom", shape: "모인 미간", text: "집중력이 뛰어난 상 — 한 우물을 깊게 파는 전문가로 인정받아요." },
      { id: "glabella", part: "미간", term: "명궁", hanja: "命宮", luck: "wisdom", shape: "적당히 열린 미간", text: "집중과 여유의 균형 — 압박 속에서도 차분하게 판단해요." },
      { id: "glabella", part: "미간", term: "명궁", hanja: "命宮", luck: "people", shape: "시원하게 열린 미간", text: "마음이 넓은 상 — 포용력이 커서 사람이 모여들어요." },
    ),
    gz,
  );

  const bl = z(m, "browLen");
  const bt = z(m, "browTilt");
  add(
    Math.abs(bt) > Math.abs(bl) && bt > 0.6
      ? { id: "brow", part: "눈썹", term: "보수관", hanja: "保壽官", luck: "drive", shape: "힘 있게 올라간 눈썹", text: "결단력이 강한 상 — 망설일 때 먼저 결정하고 밀고 나가요." }
      : pick(
          bl,
          { id: "brow", part: "눈썹", term: "보수관", hanja: "保壽官", luck: "wisdom", shape: "단정하고 짧은 눈썹", text: "판단이 깔끔한 상 — 핵심만 짚어 빠르게 정리해요." },
          { id: "brow", part: "눈썹", term: "보수관", hanja: "保壽官", luck: "people", shape: "부드럽게 흐르는 눈썹", text: "온화한 리더십 — 동료와 오래 좋은 관계를 이어 가요." },
          { id: "brow", part: "눈썹", term: "보수관", hanja: "保壽官", luck: "people", shape: "눈보다 긴 눈썹", text: "동료 복이 많은 상 — 팀에서 귀인을 만나 함께 커요." },
        ),
    Math.max(Math.abs(bl), Math.abs(bt)),
  );

  const es = z(m, "eyeSize") + z(m, "eyeOpen") * 0.5;
  const et = z(m, "eyeTilt");
  add(
    et > 1
      ? { id: "eye", part: "눈", term: "감찰관", hanja: "監察官", luck: "drive", shape: "눈꼬리가 올라간 눈", text: "판단이 빠르고 승부욕이 강한 상 — 경쟁 PT · 영업에서 빛나요." }
      : pick(
          es,
          { id: "eye", part: "눈", term: "감찰관", hanja: "監察官", luck: "wisdom", shape: "가늘고 긴 눈", text: "신중하고 통찰력 있는 전략가 — 숨은 문제를 먼저 찾아내요." },
          { id: "eye", part: "눈", term: "감찰관", hanja: "監察官", luck: "wisdom", shape: "또렷한 눈", text: "관찰력이 좋은 상 — 상황을 정확히 보고 실수 없이 움직여요." },
          { id: "eye", part: "눈", term: "감찰관", hanja: "監察官", luck: "speech", shape: "크고 맑은 눈", text: "표현력과 공감력이 큰 상 — 사람 마음을 잘 읽어요." },
        ),
    Math.max(Math.abs(es), Math.abs(et)),
  );

  const nw = z(m, "noseW");
  const nl = z(m, "noseLen");
  add(
    nl > 0.8 && nl > nw
      ? { id: "nose", part: "코", term: "재백궁", hanja: "財帛宮", luck: "office", shape: "곧고 긴 콧대", text: "원칙과 자존감이 강한 상 — 전문직 · 관리직으로 인정받아요." }
      : pick(
          nw,
          { id: "nose", part: "코", term: "재백궁", hanja: "財帛宮", luck: "wealth", shape: "단정한 코", text: "씀씀이가 계획적인 실속형 — 차곡차곡 모아 크게 이뤄요." },
          { id: "nose", part: "코", term: "재백궁", hanja: "財帛宮", luck: "wealth", shape: "반듯한 코", text: "재물운이 고른 상 — 일한 만큼 꾸준히 거둬요." },
          { id: "nose", part: "코", term: "재백궁", hanja: "財帛宮", luck: "wealth", shape: "콧방울이 든든한 코", text: "재물을 모으고 지키는 힘 — 재무 · 영업에서 성과가 커요." },
        ),
    Math.max(Math.abs(nw), Math.abs(nl)),
  );

  const mw = z(m, "mouthW");
  const sm = z(m, "smile");
  const lp = z(m, "lip");
  add(
    sm > 0.8 && sm >= mw
      ? { id: "mouth", part: "입", term: "출납관", hanja: "出納官", luck: "people", shape: "입꼬리가 올라간 입", text: "복을 부르는 웃상 — 첫인상이 좋아 면접 · 고객 응대에 강해요." }
      : lp > 1 && lp > mw
        ? { id: "mouth", part: "입", term: "출납관", hanja: "出納官", luck: "people", shape: "도톰한 입술", text: "정이 많고 믿음을 주는 상 — 한번 맺은 인연이 오래가요." }
        : pick(
            mw,
            { id: "mouth", part: "입", term: "출납관", hanja: "出納官", luck: "wisdom", shape: "단정한 입", text: "말을 아끼고 행동으로 보여 주는 상 — 약속을 꼭 지켜요." },
            { id: "mouth", part: "입", term: "출납관", hanja: "出納官", luck: "speech", shape: "균형 잡힌 입", text: "말에 군더더기가 없는 상 — 보고 · 발표가 깔끔해요." },
            { id: "mouth", part: "입", term: "출납관", hanja: "出納官", luck: "speech", shape: "크고 시원한 입", text: "말에 힘이 있는 상 — 발표 · 설득 · 협상에서 판을 바꿔요." },
          ),
    Math.max(Math.abs(mw), Math.abs(sm), Math.abs(lp)),
  );

  const jz = z(m, "jaw");
  const rz = z(m, "ratio");
  add(
    jz < -0.6 && rz > 0
      ? { id: "chin", part: "턱", term: "지각", hanja: "地閣", luck: "speech", shape: "갸름한 턱", text: "감각적이고 순발력 있는 아이디어형 — 새 트렌드를 먼저 잡아요." }
      : pick(
          jz,
          { id: "chin", part: "턱", term: "지각", hanja: "地閣", luck: "wisdom", shape: "부드러운 턱", text: "유연하게 생각하는 상 — 변화가 많은 일에서 오히려 빛나요." },
          { id: "chin", part: "턱", term: "지각", hanja: "地閣", luck: "office", shape: "단정한 턱", text: "끈기와 인내의 상 — 오래 다닐수록 자리가 단단해져요." },
          { id: "chin", part: "턱", term: "지각", hanja: "地閣", luck: "drive", shape: "든든한 턱", text: "끝까지 책임지는 리더 — 갈수록 크게 되는 상이에요." },
        ),
    Math.max(Math.abs(jz), Math.abs(rz)),
  );

  // 삼정 — 보통 비율 대비 어느 구간이 가장 두드러지는지
  const rel = { upper: m.upper / MEAN.upper, middle: m.middle / MEAN.middle, lower: m.lower / MEAN.lower };
  const peak = (Object.keys(rel) as (keyof typeof rel)[]).sort((a, b) => rel[b] - rel[a])[0];
  const sum = rel.upper + rel.middle + rel.lower;
  const thirds = { upper: rel.upper / sum, middle: rel.middle / sum, lower: rel.lower / sum };

  // 운 점수 — 부위마다 해당 운에 별 수만큼, 삼정 전성기도 더함
  const raw: Record<LuckId, number> = { office: 0, wealth: 0, people: 0, wisdom: 0, speech: 0, drive: 0 };
  for (const p of parts) raw[p.luck] += p.stars;
  raw[peak === "upper" ? "office" : peak === "middle" ? "wealth" : "drive"] += 3;
  const max = Math.max(...Object.values(raw));
  const lucks = Object.fromEntries((Object.keys(raw) as LuckId[]).map((k) => [k, Math.round(62 + (raw[k] / max) * 36)])) as Record<LuckId, number>;
  // 동점이면 이마 · 코 · 입 순서로 앞 부위의 운을 우선
  const order = parts.map((p) => p.luck);
  const first = (k: LuckId) => (order.includes(k) ? order.indexOf(k) : 99);
  const type = (Object.keys(raw) as LuckId[]).sort((a, b) => raw[b] - raw[a] || first(a) - first(b))[0];
  const fives = parts.filter((p) => p.stars === 5).length;
  return { type, score: Math.min(97, 80 + fives * 2 + Math.round(Math.abs(rel[peak] - 1) * 30)), lucks, peak, thirds, parts };
}
