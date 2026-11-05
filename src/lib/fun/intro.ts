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
  /** 그 경험에서 내가 한 일 · 결과 (선택) */
  result?: string;
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

export const LIMITS = { name: 10, job: 20, strength: 12, strengths: 3, experience: 80, result: 100 };

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
    result: cut(raw.result, LIMITS.result),
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
  // 진단 없이 고른 장점 — 첫 번째 장점 하나를 이야기의 중심으로
  const [main, ...rest] = i.strengths.length ? i.strengths : ["성실함"];
  const hello = i.tone === "bright" ? "안녕하세요! 만나서 반갑습니다." : "안녕하십니까.";
  const who = i.name ? `${i.job} 직무에 지원한 ${i.name}입니다.` : `${i.job} 직무를 꿈꾸는 지원자입니다.`;
  const proof = i.experience
    ? `${i.experience}에서 저는 ${i.result ? formal(i.result) : `${josa(main, "으로", "로")} 맡은 일을 끝까지 해냈습니다.`} 그때 ${josa(main, "이", "가")} 결과를 바꾼다는 것을 배웠습니다.`
    : `수업 과제든 팀 프로젝트든, 저는 늘 ${josa(main, "으로", "로")} 일을 풀어 왔습니다.`;
  return [
    `${hello} ${who} 저를 한 단어로 표현하면 ‘${main}’입니다.`,
    proof,
    `${i.job} 일에서도 ${josa(main, "은", "는")} 가장 먼저 필요한 힘이라고 생각합니다.${rest.length ? ` 여기에 ${josa(rest.join(", "), "을", "를")} 더해 동료가 믿고 맡기는 사람이 되겠습니다.` : ""}`,
    `입사 후 첫 1년은 현장을 빠르게 익히고, 작은 일부터 확실한 결과로 보여 드리겠습니다.`,
    `‘${main}’ 하면 떠오르는 지원자, ${i.name || "저"}를 기억해 주십시오. 감사합니다.`,
  ].join("\n");
}

/**
 * 진단 · 매칭 결과로 만든 기본 대본 — 나열하지 않고 하나의 이야기로:
 * 한 문장 정체성 → 핵심 강점 하나를 경험으로 증명 → 직무가 원하는 역량과 연결 → 입사 후 첫 목표 → 기억에 남는 마무리
 */
function matchedTemplate(i: IntroInput, m: Match): string {
  const t = TYPES[i.type!];
  const hit = m.pairs.filter((p) => p.trait);
  const main = hit[0]?.trait ?? traitById(i.traits![0])!;
  const mainComp = hit[0]?.comp ?? main.comps[0];
  const other = hit.find((p) => p.trait!.id !== main.id);
  const bright = i.tone === "bright";
  const name = i.name ? `${i.name}입니다` : "지원자입니다";
  const hook = bright
    ? `안녕하세요! ${i.job} 직무를 꿈꾸는 ${name}. 저는 한마디로 ‘${t.nick}’입니다. ${main.desc}.`
    : `안녕하십니까. ${i.job} 직무에 지원한 ${name}. 저는 ‘${t.nick}’ 인재입니다. ${main.desc}.`;

  const proof = i.experience
    ? `${i.experience}에서 저는 ${i.result ? formal(i.result) : `‘${main.name}’ 덕분에 맡은 일을 끝까지 해낼 수 있었습니다.`} 그때 ${josa(COMPS[mainComp], "이", "가")} 결과를 바꾼다는 것을 몸으로 배웠습니다.`
    : `수업 과제든 팀 프로젝트든, 저는 늘 ‘${main.name}’으로 일을 풀어 왔습니다. 그 과정에서 ${josa(COMPS[mainComp], "이", "가")} 결과를 바꾼다는 것을 배웠습니다.`;

  // 내 강점과 이어진 역량 두 가지 (없으면 직무가 원하는 앞의 두 가지)
  const wants = (hit.length >= 2 ? hit : m.pairs).slice(0, 2).map((p) => COMPS[p.comp]);
  const link = other
    ? `${i.job} 일에는 무엇보다 ${josa(wants[0], "과", "와")} ${josa(wants[1] ?? wants[0], "이", "가")} 필요하다고 생각합니다. 제 ‘${main.name}’에 ‘${other.trait!.name}’까지 더해, 이 두 가지를 현장에서 바로 보여 드리겠습니다.`
    : `${i.job} 일에 꼭 필요한 ${COMPS[mainComp]}, 바로 제가 가장 자신 있는 부분입니다.`;

  const vision = `입사 후 첫 1년은 현장을 빠르게 익히는 데 집중하고, ${josa(COMPS[mainComp], "으로", "로")} 팀이 믿고 맡기는 사람이 되겠습니다.`;
  const close = bright ? `‘${t.nick}’ ${name.replace(/입니다$/, "")}, 꼭 함께 일하고 싶습니다. 감사합니다!` : `${main.name}, 그 자체로 기억되는 지원자가 되겠습니다. 감사합니다.`;
  return [hook, proof, link, vision, close].join("\n");
}

/** 참가자가 적은 결과 문장을 대본 말투(~습니다)로 */
function formal(s: string) {
  const t = s.trim().replace(/[.。!]+$/, "");
  if (/(습니다|니다)$/.test(t)) return `${t}.`;
  if (/어요$/.test(t)) return `${t.replace(/어요$/, "습니다")}.`;
  if (/해요$/.test(t)) return `${t.replace(/해요$/, "했습니다")}.`;
  if (/(음|함|임)$/.test(t)) return `${t}을 해냈습니다.`;
  return `${t}.`;
}

/** 받침이 있으면 a, 없으면 b (과/와 · 을/를) */
function josa(word: string, a: string, b: string) {
  const c = word.charCodeAt(word.length - 1);
  const has = c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0;
  return word + (has ? a : b);
}
