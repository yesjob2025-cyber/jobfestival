// 행사 운영 — 화면 · 서버가 함께 쓰는 정의 (등록 항목 · 설문 · 상태)

/** 등록할 때 받을 수 있는 항목 (이름 · 휴대폰은 항상 받음) */
export const FIELD_OPTIONS = [
  { id: "school", label: "학교", placeholder: "예) 경동대학교" },
  { id: "major", label: "학과(전공)", placeholder: "예) 경영학과" },
  { id: "grade", label: "학년", options: ["1학년", "2학년", "3학년", "4학년", "졸업(예정)", "일반 · 기타"] },
  { id: "studentNo", label: "학번", placeholder: "예) 20231234" },
  { id: "email", label: "이메일", placeholder: "name@example.com" },
  { id: "interest", label: "관심 직무", placeholder: "예) 마케팅, IT 개발" },
] as const;
export type FieldId = (typeof FIELD_OPTIONS)[number]["id"];
export const FIELD_IDS = FIELD_OPTIONS.map((f) => f.id) as FieldId[];

export const DEFAULT_FIELDS: FieldId[] = ["school", "major", "grade"];

/** 퇴장 전 만족도 설문 기본 문항 (5점 척도) — 행사마다 바꿀 수 있음 */
export const DEFAULT_SURVEY = [
  "행사에 전반적으로 만족하셨나요?",
  "참여 기업 · 프로그램이 취업 준비에 도움이 되었나요?",
  "부대행사(이벤트)는 즐거우셨나요?",
  "다음 행사에도 참여하고 싶으신가요?",
];

export const SCALE = ["매우 불만족", "불만족", "보통", "만족", "매우 만족"] as const;

/** 참가자에게 보여 주는 행사 정보 (관리용 PIN 은 빠짐) */
export interface PublicEvent {
  code: string;
  name: string;
  hostOrg: string;
  place: string;
  startsOn: string;
  endsOn: string;
  color: string;
  fields: FieldId[];
  survey: string[];
  notice: string;
  /** 행사가 끝나고 며칠 뒤 개인정보를 지우는지 */
  retentionDays: number;
}

export type Stage = "registered" | "entered" | "surveyed" | "exited";

export interface Ticket {
  token: string;
  name: string;
  stage: Stage;
  enteredAt: string | null;
  exitedAt: string | null;
  surveyDone: boolean;
  event: PublicEvent;
}

export function stageOf(a: { entered_at: unknown; exited_at: unknown; survey_at: unknown }): Stage {
  if (a.exited_at) return "exited";
  if (a.survey_at) return "surveyed";
  if (a.entered_at) return "entered";
  return "registered";
}

export const STAGE_LABEL: Record<Stage, string> = {
  registered: "등록 완료 · 입장 전",
  entered: "입장 완료",
  surveyed: "설문 완료 · 퇴장 전",
  exited: "퇴장 완료",
};

/** 010-1234-5678 꼴로 */
export function formatPhone(p: string) {
  const d = p.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return d;
}

/** 날짜 · 시각을 한국 시간으로 */
export function kst(iso: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false, ...opts });
}

export function dateRange(a: string, b: string) {
  const f = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    const w = "일월화수목금토"[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
    return `${y}.${String(m).padStart(2, "0")}.${String(d).padStart(2, "0")}(${w})`;
  };
  return a === b ? f(a) : `${f(a)} ~ ${f(b).slice(5)}`;
}

/** 티켓 QR 에 담는 주소에서 토큰만 꺼냄 (주소 · 토큰 어느 쪽이 와도) */
export function tokenFromQr(text: string): string | null {
  const m = /(?:\/t\/)?([A-Za-z0-9_-]{16,40})\/?$/.exec(text.trim());
  return m ? m[1] : null;
}

/** 색을 밝게(+) · 어둡게(−) */
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v + amt))));
  return `rgb(${c.join(",")})`;
}
