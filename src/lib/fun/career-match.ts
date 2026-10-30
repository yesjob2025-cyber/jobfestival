// ─────────────────────────────────────────────────────────────
// 강점 매칭 — 직무 유형(홀랜드 6유형) 진단 결과의 특성 중 내 강점을 고르고,
// 희망 직무가 원하는 역량과 짝지어 적합도를 보여 줍니다. (1분 자기소개 대본의 재료)
//
// 특성(Trait)마다 그 특성이 보여 주는 역량(Comp)이 정해져 있고,
// 직무(Job)마다 원하는 역량이 중요한 순서로 5개 있습니다.
// ─────────────────────────────────────────────────────────────

import { TYPES, type TypeId } from "./job-type";

export const COMPS = {
  comm: "소통 능력",
  team: "협업",
  lead: "리더십",
  solve: "문제 해결",
  analyze: "분석력",
  create: "창의력",
  detail: "꼼꼼함",
  duty: "책임감",
  action: "실행력",
  customer: "고객 지향",
  skill: "전문 기술",
  learn: "학습 의지",
  empathy: "공감 능력",
  plan: "계획성",
} as const;
export type CompId = keyof typeof COMPS;

export interface Trait {
  id: string;
  type: TypeId;
  name: string;
  /** 면접에서 쓸 수 있는 한 줄 설명 */
  desc: string;
  comps: CompId[];
}

const T = (type: TypeId, list: [string, string, CompId[]][]): Trait[] =>
  list.map(([name, desc, comps], i) => ({ id: `${type}${i + 1}`, type, name, desc, comps }));

/** 유형별 특성 6가지 */
export const TRAITS: Record<TypeId, Trait[]> = {
  R: T("R", [
    ["손으로 해결하는 실전파", "말보다 직접 만들고 고치며 결과로 보여 줍니다", ["action", "skill"]],
    ["현장 적응력", "처음 가는 현장에서도 빠르게 손에 익힙니다", ["learn", "action"]],
    ["끝까지 책임지는 마무리", "맡은 일은 완성될 때까지 놓지 않습니다", ["duty"]],
    ["체력과 끈기", "힘든 일정도 묵묵히 버텨 냅니다", ["duty", "action"]],
    ["안전 · 원칙 중시", "정해진 절차와 안전을 먼저 챙깁니다", ["detail", "duty"]],
    ["기술 습득력", "장비 · 도구 다루는 법을 금방 익힙니다", ["skill", "learn"]],
  ]),
  I: T("I", [
    ["끝까지 파고드는 분석력", "‘왜?’를 해결될 때까지 묻고 원인을 찾습니다", ["analyze", "solve"]],
    ["데이터로 말하기", "느낌보다 숫자와 근거로 판단합니다", ["analyze"]],
    ["논리적인 문제 해결", "복잡한 문제를 작게 나눠 차근차근 풉니다", ["solve", "plan"]],
    ["깊은 집중력", "한 가지 일에 오래 몰입할 수 있습니다", ["detail", "skill"]],
    ["새로운 것 배우기", "모르는 분야도 스스로 공부해 익힙니다", ["learn"]],
    ["객관적인 시선", "감정에 휩쓸리지 않고 차분하게 봅니다", ["analyze", "detail"]],
  ]),
  A: T("A", [
    ["톡톡 튀는 아이디어", "남들이 생각 못 한 새로운 방법을 떠올립니다", ["create"]],
    ["감각적인 표현력", "생각을 그림 · 글 · 영상으로 잘 표현합니다", ["create", "comm"]],
    ["트렌드 감각", "요즘 사람들이 좋아하는 것을 빨리 알아챕니다", ["create", "customer"]],
    ["자유로운 도전", "틀에 얽매이지 않고 일단 시도해 봅니다", ["action", "create"]],
    ["섬세한 감수성", "작은 차이와 사람의 감정을 잘 느낍니다", ["empathy", "detail"]],
    ["나만의 스타일", "결과물에 개성과 완성도를 담습니다", ["create", "skill"]],
  ]),
  S: T("S", [
    ["따뜻한 공감 능력", "상대의 입장에서 먼저 생각하고 들어 줍니다", ["empathy", "customer"]],
    ["편안한 소통", "처음 만난 사람과도 금방 편해집니다", ["comm", "customer"]],
    ["팀워크 메이커", "갈등을 풀고 팀 분위기를 좋게 만듭니다", ["team", "comm"]],
    ["돕는 것이 보람", "누군가에게 도움이 될 때 힘이 납니다", ["customer", "duty"]],
    ["가르치고 이끌기", "아는 것을 쉽게 설명하고 함께 성장합니다", ["comm", "lead"]],
    ["배려와 인내", "어려운 상황에서도 끝까지 차분히 대합니다", ["empathy", "duty"]],
  ]),
  E: T("E", [
    ["앞장서는 리더십", "목표를 정하고 사람들을 모아 이끕니다", ["lead", "team"]],
    ["설득의 힘", "근거와 열정으로 상대의 마음을 움직입니다", ["comm", "customer"]],
    ["빠른 실행력", "생각이 정해지면 바로 움직입니다", ["action"]],
    ["목표 달성 집념", "숫자로 정한 목표를 끝까지 채웁니다", ["action", "duty"]],
    ["도전정신", "새로운 일 · 낯선 환경을 두려워하지 않습니다", ["action", "learn"]],
    ["넓은 네트워크", "사람을 잇고 기회를 만들어 냅니다", ["comm", "team"]],
  ]),
  C: T("C", [
    ["실수 없는 꼼꼼함", "작은 오류도 그냥 넘기지 않습니다", ["detail"]],
    ["체계적인 계획", "일정과 순서를 먼저 세우고 움직입니다", ["plan", "detail"]],
    ["성실한 꾸준함", "매일 같은 기준으로 맡은 일을 해냅니다", ["duty"]],
    ["정리 · 관리의 달인", "자료와 일을 한눈에 보이게 정리합니다", ["plan", "analyze"]],
    ["규칙과 신뢰", "약속과 절차를 지켜 믿음을 줍니다", ["duty", "detail"]],
    ["숫자에 강함", "계산 · 예산 · 수치를 정확하게 다룹니다", ["analyze", "detail"]],
  ]),
};

export const traitById = (id: string): Trait | undefined => TRAITS[id[0] as TypeId]?.find((t) => t.id === id);

export interface Job {
  id: string;
  emoji: string;
  name: string;
  /** 잘 맞는 유형 */
  types: TypeId[];
  /** 원하는 역량 (중요한 순서) */
  wants: CompId[];
}

export const JOBS: Job[] = [
  { id: "marketing", emoji: "📣", name: "마케팅 · 홍보", types: ["A", "E"], wants: ["create", "analyze", "comm", "customer", "action"] },
  { id: "sales", emoji: "🤝", name: "영업 · 해외영업", types: ["E", "S"], wants: ["comm", "customer", "action", "duty", "team"] },
  { id: "planning", emoji: "🧭", name: "기획 · 전략", types: ["E", "I"], wants: ["analyze", "plan", "solve", "comm", "lead"] },
  { id: "hr", emoji: "🧑‍💼", name: "인사(HR) · 총무", types: ["S", "C"], wants: ["comm", "empathy", "plan", "duty", "team"] },
  { id: "dev", emoji: "💻", name: "IT 개발", types: ["I", "R"], wants: ["solve", "skill", "learn", "analyze", "team"] },
  { id: "data", emoji: "📊", name: "데이터 분석", types: ["I", "C"], wants: ["analyze", "solve", "detail", "learn", "comm"] },
  { id: "design", emoji: "🎨", name: "디자인", types: ["A"], wants: ["create", "skill", "customer", "detail", "comm"] },
  { id: "media", emoji: "🎬", name: "콘텐츠 · 미디어", types: ["A", "E"], wants: ["create", "action", "customer", "comm", "skill"] },
  { id: "nurse", emoji: "🩺", name: "간호 · 보건", types: ["S", "I"], wants: ["duty", "empathy", "detail", "skill", "team"] },
  { id: "teacher", emoji: "🍎", name: "교육 · 강사", types: ["S", "A"], wants: ["comm", "empathy", "plan", "learn", "lead"] },
  { id: "welfare", emoji: "💛", name: "상담 · 사회복지", types: ["S"], wants: ["empathy", "comm", "duty", "solve", "team"] },
  { id: "hotel", emoji: "🏨", name: "호텔 · 관광 서비스", types: ["S", "E"], wants: ["customer", "comm", "team", "action", "detail"] },
  { id: "public", emoji: "🏛️", name: "공무원 · 공공기관", types: ["C", "S"], wants: ["duty", "detail", "plan", "comm", "solve"] },
  { id: "finance", emoji: "💰", name: "회계 · 재무 · 금융", types: ["C", "I"], wants: ["detail", "analyze", "duty", "plan", "customer"] },
  { id: "logistics", emoji: "📦", name: "물류 · 유통 · MD", types: ["C", "E"], wants: ["plan", "action", "analyze", "comm", "duty"] },
  { id: "engineer", emoji: "⚙️", name: "생산 · 설비 · 품질", types: ["R", "C"], wants: ["skill", "detail", "duty", "solve", "team"] },
  { id: "research", emoji: "🔬", name: "연구개발(R&D)", types: ["I"], wants: ["analyze", "learn", "solve", "skill", "detail"] },
  { id: "safety", emoji: "🚒", name: "경찰 · 소방 · 군", types: ["R", "S"], wants: ["duty", "action", "team", "lead", "empathy"] },
];

/** 직접 적은 직무는 어느 회사나 원하는 기본 역량으로 */
export const GENERIC_WANTS: CompId[] = ["duty", "comm", "solve", "team", "learn"];

export const jobById = (id: string) => JOBS.find((j) => j.id === id);

export interface MatchPair {
  comp: CompId;
  /** 이 역량을 보여 주는 내 강점 (없으면 보완할 점) */
  trait: Trait | null;
}

export interface Match {
  score: number;
  pairs: MatchPair[];
  /** 진단 유형이 이 직무와 잘 맞는지 */
  typeFit: boolean;
}

/**
 * 고른 강점과 직무가 원하는 역량 짝짓기.
 * 적합도는 원하는 역량(중요도 5~1점)을 강점이 얼마나 덮는지 + 유형이 맞으면 가산 — 재미로 보는 점수라 50% 아래로는 내려가지 않게.
 */
export function matchJob(traits: Trait[], wants: CompId[], types: TypeId[] = [], myType?: TypeId): Match {
  const used = new Set<string>();
  const pairs: MatchPair[] = wants.map((comp) => {
    // 아직 짝이 없는 강점을 먼저, 그다음 이미 쓴 강점
    const t = traits.find((x) => x.comps.includes(comp) && !used.has(x.id)) ?? traits.find((x) => x.comps.includes(comp)) ?? null;
    if (t) used.add(t.id);
    return { comp, trait: t };
  });
  const total = wants.reduce((s, _, i) => s + (wants.length - i), 0);
  const got = pairs.reduce((s, p, i) => s + (p.trait ? wants.length - i : 0), 0);
  const typeFit = !!myType && types.includes(myType);
  const score = Math.min(98, Math.round(50 + (got / total) * 40 + (typeFit ? 8 : 0)));
  return { score, pairs, typeFit };
}

/** 진단 결과로 추천하는 직무 (1 · 2순위 유형에 맞는 직무 먼저) */
export function recommendJobs(top: TypeId, second: TypeId): Job[] {
  const rank = (j: Job) => (j.types[0] === top ? 0 : j.types.includes(top) ? 1 : j.types.includes(second) ? 2 : 3);
  return [...JOBS].sort((a, b) => rank(a) - rank(b));
}

export const typeLabel = (id: TypeId) => `${TYPES[id].emoji} ${TYPES[id].nick}`;
