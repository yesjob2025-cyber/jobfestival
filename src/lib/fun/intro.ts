// ─────────────────────────────────────────────────────────────
// 1분 자기소개 — 입력 항목 · 빠른 선택 목록 · AI 를 못 쓸 때 쓰는 기본 문장 틀
// ─────────────────────────────────────────────────────────────

export interface IntroInput {
  name: string;
  job: string;
  strengths: string[];
  experience: string;
  tone: "serious" | "bright";
}

export const JOB_CHIPS = ["마케팅", "영업", "인사(HR)", "IT 개발", "디자인", "간호사", "공무원", "호텔 · 관광", "경찰", "회계 · 재무", "물류", "교사"];

export const STRENGTH_CHIPS = ["책임감", "소통 능력", "끈기", "분석력", "창의성", "리더십", "꼼꼼함", "도전정신", "협업", "성실함", "긍정적인 태도", "빠른 실행력"];

export const LIMITS = { name: 10, job: 20, strength: 12, strengths: 3, experience: 80 };

/** 서버로 보내기 전 · 받은 뒤 같은 기준으로 다듬기 */
export function cleanInput(raw: Partial<IntroInput>): IntroInput {
  const cut = (s: unknown, n: number) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, n) : "");
  return {
    name: cut(raw.name, LIMITS.name),
    job: cut(raw.job, LIMITS.job) || "희망 직무",
    strengths: (Array.isArray(raw.strengths) ? raw.strengths : []).map((s) => cut(s, LIMITS.strength)).filter(Boolean).slice(0, LIMITS.strengths),
    experience: cut(raw.experience, LIMITS.experience),
    tone: raw.tone === "bright" ? "bright" : "serious",
  };
}

/** AI 를 쓸 수 없을 때의 기본 대본 (문장 틀 조합) */
export function templateScript(i: IntroInput): string {
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
