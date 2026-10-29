// ─────────────────────────────────────────────────────────────
// 동물상 테스트 — 얼굴 윤곽 478점(MediaPipe Face Landmarker)으로 눈매 · 얼굴형을 재서
// 강아지 · 고양이 · 토끼 · 곰 · 여우 · 사슴상 중 가까운 쪽을 골라 줍니다. (재미로 보는 테스트)
// 다른 사람 사진과 비교하지 않고, 얼굴 비율만 씁니다.
// ─────────────────────────────────────────────────────────────

export type AnimalId = "dog" | "cat" | "rabbit" | "bear" | "fox" | "deer";

export interface Animal {
  id: AnimalId;
  emoji: string;
  name: string;
  color: string;
  desc: string;
  keywords: string[];
  jobs: string[];
  /** 찰떡 동료 동물상 */
  partner: AnimalId;
}

export const ANIMALS: Record<AnimalId, Animal> = {
  dog: { id: "dog", emoji: "🐶", name: "강아지상", color: "#C98A3C",
    desc: "처음 만나도 편안한 순둥한 인상! 누구에게나 호감을 주는 친화력 갑이에요.",
    keywords: ["친화력", "성실함", "팀워크"], jobs: ["영업 · 고객관리", "호텔 · 관광 서비스", "인사(HR)"], partner: "cat" },
  cat: { id: "cat", emoji: "🐱", name: "고양이상", color: "#7A6FE0",
    desc: "또렷한 눈매에서 느껴지는 세련된 카리스마. 내 페이스대로 확실하게 해내요.",
    keywords: ["독립심", "센스", "집중력"], jobs: ["디자인 · 콘텐츠", "기획 · 브랜딩", "IT 개발"], partner: "dog" },
  rabbit: { id: "rabbit", emoji: "🐰", name: "토끼상", color: "#E4457A",
    desc: "동그란 눈과 귀여운 인상! 밝은 에너지로 주변 분위기를 환하게 만들어요.",
    keywords: ["밝음", "순발력", "공감"], jobs: ["교육 · 유아", "간호 · 보건", "홍보 · SNS 마케팅"], partner: "bear" },
  bear: { id: "bear", emoji: "🐻", name: "곰상", color: "#8A5A3C",
    desc: "듬직하고 푸근한 인상. 믿고 맡길 수 있는 든든한 버팀목 스타일이에요.",
    keywords: ["신뢰", "끈기", "포용력"], jobs: ["공기업 · 공공기관", "엔지니어 · 설비", "경찰 · 소방"], partner: "rabbit" },
  fox: { id: "fox", emoji: "🦊", name: "여우상", color: "#F08C00",
    desc: "날렵한 눈매에 담긴 영리함! 상황 판단이 빠르고 말솜씨가 뛰어나요.",
    keywords: ["두뇌 회전", "설득력", "트렌드"], jobs: ["마케팅 · MD", "해외영업 · 무역", "방송 · 미디어"], partner: "deer" },
  deer: { id: "deer", emoji: "🦌", name: "사슴상", color: "#2E9E6A",
    desc: "맑은 눈망울과 차분한 분위기. 섬세하고 우아하게 일을 마무리해요.",
    keywords: ["섬세함", "차분함", "책임감"], jobs: ["연구 · 데이터", "회계 · 재무", "의료 · 약학"], partner: "fox" },
};

type Pt = { x: number; y: number };

/** 얼굴 비율 (모두 얼굴 폭 대비, 기울기는 도) */
export interface FaceFeatures {
  ratio: number;
  eyeAspect: number;
  eyeSize: number;
  tilt: number;
  eyeGap: number;
  nose: number;
  mouth: number;
  jaw: number;
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export function featuresOf(lm: Pt[]): FaceFeatures {
  const faceW = dist(lm[234], lm[454]);
  const faceH = dist(lm[10], lm[152]);
  const eye = (outer: number, inner: number, up: number, down: number) => ({
    w: dist(lm[outer], lm[inner]),
    h: dist(lm[up], lm[down]),
    // 바깥 눈꼬리가 안쪽보다 얼마나 올라갔는지 (도)
    tilt: (Math.atan2(lm[inner].y - lm[outer].y, Math.abs(lm[inner].x - lm[outer].x)) * 180) / Math.PI,
  });
  const L = eye(33, 133, 159, 145);
  const R = eye(263, 362, 386, 374);
  return {
    ratio: faceH / faceW,
    eyeAspect: (L.h / L.w + R.h / R.w) / 2,
    eyeSize: (L.w + R.w) / 2 / faceW,
    tilt: (L.tilt + R.tilt) / 2,
    eyeGap: dist(lm[133], lm[362]) / faceW,
    nose: dist(lm[98], lm[327]) / faceW,
    mouth: dist(lm[61], lm[291]) / faceW,
    jaw: dist(lm[172], lm[397]) / faceW,
  };
}

// 보통 얼굴(부스에서 웃으며 찍은 정면 사진 기준)의 대략적인 값과 폭 — 여기서 얼마나 벗어나는지로 점수를 매깁니다.
const MEAN: FaceFeatures = { ratio: 1.17, eyeAspect: 0.34, eyeSize: 0.205, tilt: 5, eyeGap: 0.255, nose: 0.27, mouth: 0.44, jaw: 0.84 };
const SPAN: FaceFeatures = { ratio: 0.08, eyeAspect: 0.06, eyeSize: 0.02, tilt: 4, eyeGap: 0.02, nose: 0.025, mouth: 0.04, jaw: 0.05 };

const WEIGHTS: Record<AnimalId, Partial<FaceFeatures>> = {
  dog: { tilt: -1.2, eyeAspect: 0.6, jaw: 0.4, eyeSize: 0.3 },
  cat: { tilt: 1.1, eyeAspect: -0.6, jaw: -0.5, nose: -0.3 },
  rabbit: { eyeSize: 0.9, eyeAspect: 0.8, mouth: -0.6, ratio: -0.3 },
  bear: { ratio: -1.0, jaw: 0.9, nose: 0.6, eyeSize: -0.5 },
  fox: { tilt: 1.3, eyeAspect: -0.9, ratio: 0.5, jaw: -0.4 },
  deer: { ratio: 0.9, eyeSize: 0.7, eyeGap: 0.6, jaw: -0.5 },
};

/** 동물상별 비율(%) — 큰 순서 */
export function classify(f: FaceFeatures): { animal: Animal; pct: number }[] {
  const ids = Object.keys(WEIGHTS) as AnimalId[];
  const raw = ids.map((id) => {
    let s = 0;
    for (const [k, w] of Object.entries(WEIGHTS[id]) as [keyof FaceFeatures, number][]) {
      s += w * Math.max(-2.5, Math.min(2.5, (f[k] - MEAN[k]) / SPAN[k]));
    }
    return s;
  });
  const exp = raw.map((s) => Math.exp(s * 2.2));
  const sum = exp.reduce((a, b) => a + b, 0);
  return ids
    .map((id, i) => ({ animal: ANIMALS[id], pct: Math.round((exp[i] / sum) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}
