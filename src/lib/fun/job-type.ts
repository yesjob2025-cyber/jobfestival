// ─────────────────────────────────────────────────────────────
// 직무 유형 테스트 — 홀랜드(RIASEC) 직업 흥미 6유형을 바탕으로 한 12문항 재미 테스트
// 문항마다 두 보기 중 하나를 고르면 해당 유형에 점수가 쌓입니다.
// ─────────────────────────────────────────────────────────────

export type TypeId = "R" | "I" | "A" | "S" | "E" | "C";

export interface JobType {
  id: TypeId;
  emoji: string;
  /** 재미있는 별명 */
  nick: string;
  /** 홀랜드 유형 이름 */
  name: string;
  color: string;
  desc: string;
  strengths: string[];
  jobs: string[];
  /** 잘 맞는 동료 유형 */
  partner: TypeId;
}

export const TYPES: Record<TypeId, JobType> = {
  R: { id: "R", emoji: "🔧", nick: "손끝 장인형", name: "현실형", color: "#2E9E6A",
    desc: "직접 만지고 고치고 만들어 낼 때 가장 빛나요. 말보다 결과로 보여 주는 실전파!",
    strengths: ["손재주", "책임감", "현장 감각"],
    jobs: ["기계 · 설비 엔지니어", "건축 · 토목", "경찰 · 소방", "항공 정비", "스포츠 · 재활"], partner: "C" },
  I: { id: "I", emoji: "🔬", nick: "탐구 박사형", name: "탐구형", color: "#5B5BD6",
    desc: "‘왜?’를 끝까지 파고드는 호기심 대장. 데이터와 원리 속에서 답을 찾아내요.",
    strengths: ["분석력", "논리", "집중력"],
    jobs: ["연구원 · R&D", "데이터 분석가", "개발자", "의료 · 보건 연구", "품질 관리"], partner: "A" },
  A: { id: "A", emoji: "🎨", nick: "아이디어 뱅크형", name: "예술형", color: "#E4457A",
    desc: "남들과 다른 시선이 무기! 새롭고 재미있는 것을 만들 때 에너지가 넘쳐요.",
    strengths: ["창의력", "감성", "표현력"],
    jobs: ["디자이너", "콘텐츠 크리에이터", "광고 · 마케팅", "공간 · 패션", "방송 · 미디어"], partner: "S" },
  S: { id: "S", emoji: "🤝", nick: "따뜻한 해결사형", name: "사회형", color: "#F08C00",
    desc: "사람을 돕고 함께할 때 행복한 공감 능력자. 어디서든 분위기 메이커!",
    strengths: ["공감", "소통", "배려"],
    jobs: ["간호사 · 보건", "교사 · 교육", "상담 · 복지", "인사(HR)", "호텔 · 관광 서비스"], partner: "E" },
  E: { id: "E", emoji: "🚀", nick: "열정 리더형", name: "진취형", color: "#08A0F6",
    desc: "목표가 생기면 사람을 모으고 앞장서는 추진력! 설득과 협상에 강해요.",
    strengths: ["리더십", "설득력", "도전정신"],
    jobs: ["영업 · 해외영업", "창업가", "기획 · 전략", "홍보 · PR", "MD · 유통"], partner: "R" },
  C: { id: "C", emoji: "📋", nick: "꼼꼼 관리자형", name: "관습형", color: "#13399A",
    desc: "정확하고 체계적인 일처리의 달인. 팀이 믿고 맡기는 든든한 버팀목이에요.",
    strengths: ["꼼꼼함", "성실", "계획성"],
    jobs: ["회계 · 재무", "공무원 · 공공기관", "사무 · 경영지원", "금융 · 은행", "물류 관리"], partner: "I" },
};

export interface Question {
  q: string;
  a: { text: string; type: TypeId };
  b: { text: string; type: TypeId };
}

export const QUESTIONS: Question[] = [
  { q: "조별 과제에서 내가 맡고 싶은 역할은?", a: { text: "자료를 찾고 분석하기 🔍", type: "I" }, b: { text: "발표하고 팀을 이끌기 🎤", type: "E" } },
  { q: "주말에 하고 싶은 일은?", a: { text: "가구 조립 · 요리처럼 손으로 만들기 🛠️", type: "R" }, b: { text: "전시회 · 공연 보러 가기 🎭", type: "A" } },
  { q: "친구가 고민을 털어놓으면 나는?", a: { text: "끝까지 들어 주고 공감한다 🫂", type: "S" }, b: { text: "해결 방법을 정리해 준다 📝", type: "C" } },
  { q: "새 휴대폰을 사면 가장 먼저?", a: { text: "설정을 하나하나 정리한다 ⚙️", type: "C" }, b: { text: "기능을 이것저것 실험해 본다 🧪", type: "I" } },
  { q: "동아리에서 맡고 싶은 자리는?", a: { text: "회장 · 기획부장 👑", type: "E" }, b: { text: "디자인 · 홍보 담당 🎨", type: "A" } },
  { q: "아르바이트를 고른다면?", a: { text: "카페 · 매장 손님 응대 ☕", type: "S" }, b: { text: "물류 · 현장 작업 📦", type: "R" } },
  { q: "더 끌리는 수업은?", a: { text: "실험 · 실습이 많은 수업 🔬", type: "I" }, b: { text: "토론 · 발표가 많은 수업 💬", type: "S" } },
  { q: "여행 계획을 짤 때 나는?", a: { text: "엑셀로 일정 · 예산 정리 📊", type: "C" }, b: { text: "일단 떠나서 즉흥으로! ✈️", type: "A" } },
  { q: "팀 프로젝트가 막혔을 때 나는?", a: { text: "직접 만들어 보면서 해결 🔨", type: "R" }, b: { text: "사람들을 설득해 방향을 정리 🧭", type: "E" } },
  { q: "칭찬받으면 가장 기쁜 말은?", a: { text: "“너 진짜 꼼꼼하다!”", type: "C" }, b: { text: "“너 덕분에 힘이 났어!”", type: "S" } },
  { q: "SNS에 올리고 싶은 건?", a: { text: "내가 만든 작품 · 사진 📸", type: "A" }, b: { text: "알게 된 꿀팁 · 정보 💡", type: "I" } },
  { q: "10년 뒤 나의 모습은?", a: { text: "내 회사를 운영하는 CEO 💼", type: "E" }, b: { text: "누구도 대신 못 하는 기술 전문가 🏅", type: "R" } },
];

export function scoreOf(answers: TypeId[]): { top: JobType; second: JobType; scores: Record<TypeId, number> } {
  const scores: Record<TypeId, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  answers.forEach((t) => scores[t]++);
  // 동점이면 마지막에 고른 쪽을 우선 (마지막 문항이 더 ‘지금의 나’에 가깝다고 봄)
  const order = (Object.keys(scores) as TypeId[]).sort(
    (a, b) => scores[b] - scores[a] || answers.lastIndexOf(b) - answers.lastIndexOf(a),
  );
  return { top: TYPES[order[0]], second: TYPES[order[1]], scores };
}
