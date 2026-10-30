// ─────────────────────────────────────────────────────────────
// 1분 자기소개 — 입력 항목 · 빠른 선택 목록 · AI 를 못 쓸 때 쓰는 기본 문장 틀
// ─────────────────────────────────────────────────────────────

import { COMPS, GENERIC_WANTS, jobById, matchJob, traitById, type Match, type Trait } from "./career-match";
import { TYPES, type TypeId } from "./job-type";

export interface IntroInput {
  name: string;
  job: string;
  strengths: string[];
  experience: string;
  tone: "serious" | "bright";
  /** 직무 유형 진단 결과 (1 · 2순위) — 진단을 건너뛰면 없음 */
  type?: TypeId;
  second?: TypeId;
  /** 고른 강점 (특성 id) — 있으면 strengths 는 그 이름 */
  traits?: string[];
  /** 고른 직무 (목록에 있는 직무일 때) */
  jobId?: string;
}

const TYPE_IDS = Object.keys(TYPES) as TypeId[];

export const JOB_CHIPS = ["마케팅", "영업", "인사(HR)", "IT 개발", "디자인", "간호사", "공무원", "호텔 · 관광", "경찰", "회계 · 재무", "물류", "교사"];

export const STRENGTH_CHIPS = ["책임감", "소통 능력", "끈기", "분석력", "창의성", "리더십", "꼼꼼함", "도전정신", "협업", "성실함", "긍정적인 태도", "빠른 실행력"];

export const LIMITS = { name: 10, job: 20, strength: 12, strengths: 3, experience: 80 };

/** 서버로 보내기 전 · 받은 뒤 같은 기준으로 다듬기 */
export function cleanInput(raw: Partial<IntroInput>): IntroInput {
  const cut = (s: unknown, n: number) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, n) : "");
  const traits = (Array.isArray(raw.traits) ? raw.traits : [])
    .map((id) => (typeof id === "string" ? traitById(id) : undefined))
    .filter((t): t is Trait => !!t)
    .slice(0, LIMITS.strengths);
  const job = typeof raw.jobId === "string" ? jobById(raw.jobId) : undefined;
  return {
    name: cut(raw.name, LIMITS.name),
    job: job?.name ?? (cut(raw.job, LIMITS.job) || "희망 직무"),
    strengths: traits.length
      ? traits.map((t) => t.name)
      : (Array.isArray(raw.strengths) ? raw.strengths : []).map((s) => cut(s, LIMITS.strength)).filter(Boolean).slice(0, LIMITS.strengths),
    experience: cut(raw.experience, LIMITS.experience),
    tone: raw.tone === "bright" ? "bright" : "serious",
    type: TYPE_IDS.includes(raw.type as TypeId) ? raw.type : undefined,
    second: TYPE_IDS.includes(raw.second as TypeId) ? raw.second : undefined,
    traits: traits.map((t) => t.id),
    jobId: job?.id,
  };
}

/** 고른 강점과 직무가 원하는 역량 매칭 (화면 · 서버 같은 계산) */
export function matchOf(i: IntroInput): Match | null {
  const traits = (i.traits ?? []).map(traitById).filter((t): t is Trait => !!t);
  if (!traits.length) return null;
  const job = i.jobId ? jobById(i.jobId) : undefined;
  return matchJob(traits, job?.wants ?? GENERIC_WANTS, job?.types, i.type);
}

/** AI 를 쓸 수 없을 때의 기본 대본 (문장 틀 조합) */
export function templateScript(i: IntroInput): string {
  const m = matchOf(i);
  if (m && i.type) return matchedTemplate(i, m);
  const s = i.strengths.length ? i.strengths : ["성실함"];
  const hello = i.tone === "bright" ? "안녕하세요! 만나서 반갑습니다." : "안녕하십니까.";
  const name = i.name ? `${i.job} 직무에 지원한 ${i.name}입니다.` : `${i.job} 직무를 꿈꾸는 지원자입니다.`;
  const exp = i.experience
    ? `${i.experience} 경험을 통해 ${s[0]}의 중요성을 몸으로 배웠습니다.`
    : `학교생활과 다양한 활동 속에서 ${s[0]}을 꾸준히 키워 왔습니다.`;
  const more = s.length > 1 ? `또한 ${s.slice(1).join(", ")}을 바탕으로 맡은 일을 끝까지 해내는 사람입니다.` : "맡은 일은 끝까지 책임지고 해내는 사람입니다.";
  return [
    `${hello} ${name}`,
    `저의 가장 큰 강점은 ${s.join(", ")}입니다.`,
    exp,
    more,
    `${i.job} 분야에서 이 강점을 살려, 동료에게 믿음을 주고 고객에게 가치를 전하는 사람이 되고 싶습니다.`,
    `입사 후에는 빠르게 배우고 꾸준히 성장해 팀에 꼭 필요한 사람이 되겠습니다. 감사합니다.`,
  ].join("\n");
}

/** 진단 · 매칭 결과로 만든 기본 대본 */
function matchedTemplate(i: IntroInput, m: Match): string {
  const t = TYPES[i.type!];
  const hit = m.pairs.filter((p) => p.trait);
  const first = hit[0];
  const second = hit.find((p) => p.trait!.id !== first?.trait!.id);
  const hello = i.tone === "bright" ? "안녕하세요! 만나서 반갑습니다." : "안녕하십니까.";
  const who = i.name ? `${i.job} 직무를 꿈꾸는 ${i.name}입니다.` : `${i.job} 직무를 꿈꾸는 지원자입니다.`;
  const exp = i.experience ? `${i.experience} 경험에서도 이 강점으로 맡은 일을 해냈습니다.` : "학교생활과 여러 활동 속에서 이 강점을 꾸준히 키워 왔습니다.";
  return [
    `${hello} ${who}`,
    `저는 ‘${t.nick}’ 인재입니다. ${t.strengths.join(" · ")}, 이 세 단어가 저를 설명하는 키워드입니다.`,
    first ? `특히 ‘${first.trait!.name}’, 이것이 저의 가장 큰 강점입니다. ${first.trait!.desc}.` : `저의 강점은 ${i.strengths.join(", ")}입니다.`,
    exp,
    first
      ? `${i.job} 직무에 꼭 필요한 ${second ? `${josa(COMPS[first.comp], "과", "와")} ${COMPS[second.comp]}` : COMPS[first.comp]}, 이 역량으로 빠르게 성과를 내겠습니다.`
      : "",
    `입사 후에는 부족한 점은 빠르게 배우고, 강점은 더 키워 팀에 꼭 필요한 사람이 되겠습니다. 감사합니다.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** 받침이 있으면 a, 없으면 b (과/와 · 을/를) */
function josa(word: string, a: string, b: string) {
  const c = word.charCodeAt(word.length - 1);
  const has = c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
  return word + (has ? a : b);
}
