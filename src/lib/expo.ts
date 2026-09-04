// ─────────────────────────────────────────────────────────────
// 2026 국립한국해양대학교 KMOU 취업박람회 — 행사 정보 · 참여기업 데이터
//
// 이 파일 하나만 수정하면 사이트 전체에 반영됩니다.
//  · 행사 개요 → EXPO
//  · 참여기업  → COMPANIES  (intro/homepage/hiring 은 비워두면 화면에서 숨겨집니다)
//  · 채용설명회 → SESSIONS
//  · 동문 멘토  → MENTORS
//  · 이벤트     → EVENTS
// ─────────────────────────────────────────────────────────────

export const EXPO = {
  title: "2026 국립한국해양대학교 KMOU 취업박람회",
  titleShort: "KMOU 취업박람회",
  year: "2026",
  dateLabel: "2026. 9. 10. (목)",
  dateShort: "9.10 THU",
  timeLabel: "10:00 ~ 17:00",
  venue: "도서관 신관 1층 및 4층 라이브러리홀",
  boothSummary: "공공기관 및 일반기업 등 35여개 부스 운영",
  host: "국립한국해양대학교 학생처 학생성장지원실",
  sponsors: [
    "고용노동부 부산지방고용노동청",
    "영도구청",
    "부산경제진흥원",
    "한국TOEIC위원회",
  ],
  platform: "글로벌 성장큐레이션 ABCDE 플랫폼 (국립대학육성사업)",
  siteUrl: "https://jobfestival.co.kr",
} as const;

/** 참여기업 */
export interface ExpoCompany {
  id: string;
  boothNo: string;
  name: string;
  category: string;
  industry: string;
  /** 아래 항목은 운영자가 채우면 상세 페이지에 노출됩니다 */
  intro?: string;
  homepage?: string;
  hiring?: string[];
  note?: string;
}

export const COMPANIES: ExpoCompany[] = [
  {
    id: "b01",
    boothNo: "01",
    name: "부산교통공사",
    category: "공기업",
    industry: "도시철도 운송업",
  },
  {
    id: "b02",
    boothNo: "02",
    name: "한국자산관리공사",
    category: "공공기관",
    industry: "기금 운영업",
  },
  {
    id: "b03",
    boothNo: "03",
    name: "일양약품(주)",
    category: "중견기업",
    industry: "완제 의약품 제조업",
  },
  {
    id: "b04",
    boothNo: "04",
    name: "LG전자(주)",
    category: "대기업",
    industry: "통신 및 방송 장비 제조업",
  },
  {
    id: "b05",
    boothNo: "05",
    name: "(재)한국조선해양기자재연구원",
    category: "공기업",
    industry: "기타 공학연구개발업",
  },
  {
    id: "b06",
    boothNo: "06",
    name: "CJ대한통운(주)",
    category: "대기업",
    industry: "도로 화물 운송업",
  },
  {
    id: "b07",
    boothNo: "07",
    name: "부산신항만(주)",
    category: "대기업",
    industry: "항구 및 기타해상 터미널 운영업",
  },
  {
    id: "b08",
    boothNo: "08",
    name: "LIG Defense&Aerospace(주)",
    category: "대기업",
    industry: "무기 및 총포탄 제조업",
  },
  {
    id: "b09",
    boothNo: "09",
    name: "(주)하나은행",
    category: "금융기관",
    industry: "국내은행",
  },
  {
    id: "b10",
    boothNo: "10",
    name: "KAI 한국항공우주산업(주)",
    category: "대기업",
    industry: "항공기,우주선 및 보조장치 제조업",
  },
  {
    id: "b11",
    boothNo: "11",
    name: "부산신항국제터미널(주)",
    category: "중견기업",
    industry: "항구 및 기타 해상 터미널 운영업",
  },
  {
    id: "b12",
    boothNo: "12",
    name: "(주)대한항공 항공우주사업본부",
    category: "대기업",
    industry: "항공 여객 운송업",
  },
  {
    id: "b13",
    boothNo: "13",
    name: "(주)화신볼트산업",
    category: "중소기업",
    industry: "볼트 및 너트 제조업",
  },
  {
    id: "b14",
    boothNo: "14",
    name: "SB선보(주)",
    category: "중소기업",
    industry: "내연기관 제조업",
  },
  {
    id: "b15",
    boothNo: "15",
    name: "(주)동아엔텍",
    category: "중견기업",
    industry: "증류기, 열교환기 및 가스발생기 제조업",
  },
  {
    id: "b16",
    boothNo: "16",
    name: "조광요턴(주)",
    category: "중견기업",
    industry: "일반용 도료 및 관련제품 제조업",
  },
  {
    id: "b17",
    boothNo: "17",
    name: "(주)창신INC",
    category: "중견기업",
    industry: "신발 도매업",
  },
  {
    id: "b18",
    boothNo: "18",
    name: "오스템임플란트(주)",
    category: "대기업",
    industry: "치과용 기기 제조업",
  },
  {
    id: "b19",
    boothNo: "19",
    name: "한국에스지에스(주)",
    category: "외국계기업",
    industry: "물질성분 검사 및 분석업",
  },
  {
    id: "b20",
    boothNo: "20",
    name: "(사)한국선급",
    category: "기타",
    industry: "기타 기술 시험, 검사 및 분석업",
  },
  {
    id: "b21",
    boothNo: "21",
    name: "해양수산부 국립해양측위정보원",
    category: "공기업",
    industry: "위성항법보정시스템(DGNSS), 지상파항법시스템(Loran-C), 측위정보시스템(DGPS) 등 구축 및 운영",
  },
  {
    id: "b22",
    boothNo: "22",
    name: "한국해양수산연수원",
    category: "공공기관",
    industry: "선원 교육·훈련, 해양안전 및 수산 전문 교육",
  },
  {
    id: "b23",
    boothNo: "23",
    name: "국민연금공단 부산지역본부",
    category: "공기업",
    industry: "연금업",
  },
  {
    id: "b24",
    boothNo: "24",
    name: "한국환경공단",
    category: "준정부기관",
    industry: "환경오염 방지, 탄소중립",
  },
  {
    id: "b25",
    boothNo: "25",
    name: "해양환경공단",
    category: "공기업",
    industry: "수도, 하수 및 폐기물 처리, 원료 재생업",
  },
  {
    id: "b26",
    boothNo: "26",
    name: "부산항만공사",
    category: "공기업",
    industry: "항구 해상 터미널 운영",
  },
  {
    id: "b27",
    boothNo: "27,31",
    name: "HD현대중공업(주)",
    category: "대기업",
    industry: "기타 선박 제조업",
  },
  {
    id: "b28",
    boothNo: "28",
    name: "(주)케이조선",
    category: "대기업",
    industry: "강선 건조업",
  },
  {
    id: "b29",
    boothNo: "29",
    name: "삼성중공업(주)",
    category: "대기업",
    industry: "강선 건조업",
  },
  {
    id: "b30",
    boothNo: "30",
    name: "삼성전기(주)",
    category: "대기업",
    industry: "그 외 기타 전자부품 제조업",
  },];

/** 채용설명회 (4층 라이브러리홀) */
export interface ExpoSession {
  time: string;
  company: string;
}

export const SESSIONS: ExpoSession[] = [
  { time: "11:00~11:50", company: "한국자산관리공사" },
  { time: "13:00~13:50", company: "HD 현대중공업(주)" },
  { time: "14:00~14:50", company: "(주)대한항공 항공우주사업본부" },
  { time: "15:00~15:50", company: "HUG 주택도시보증공사" },];

/** 현직자 동문선배 멘토링 */
export interface ExpoMentor {
  id: string;
  name: string;
  company: string;
  position: string;
  dept: string;
}

export const MENTORS: ExpoMentor[] = [
  { id: "m01", name: "김결", company: "SK하이닉스(주)", position: "TL", dept: "NAND ETCH 기술" },
  { id: "m02", name: "이동헌", company: "EXAIL", position: "지사장", dept: "한국사무소" },
  { id: "m03", name: "안준우", company: "HD현대중공업(주)", position: "엔지니어", dept: "전장설계부" },
  { id: "m04", name: "정범", company: "(주)포스에스엠", position: "선임감독", dept: "탱커선단" },
  { id: "m05", name: "남성민", company: "해양환경공단", position: "대리", dept: "교육운영처" },
  { id: "m06", name: "전태훈", company: "부산교통공사", position: "주임", dept: "경전철운영사업소 기술부 신호팀" },
  { id: "m07", name: "김동연", company: "부산환경공단", position: "대리", dept: "기장사업소 전기6급" },
  { id: "m08", name: "김태호", company: "르노코리아(주)", position: "섹션장", dept: "차량품질팀" },];

/** 부대 이벤트 */
export const EVENTS = [
  { name: "퍼스널컬러 진단", desc: "나에게 어울리는 면접 컬러를 찾아보세요" },
  { name: "캐리커처", desc: "현장에서 그려주는 나만의 캐리커처" },
  { name: "취업타로", desc: "가볍게 즐기는 취업 운세 상담" },
  { name: "천연허브 야돔 만들기", desc: "직접 만드는 천연 허브 아로마 스틱" },
] as const;

/** 기업분류 표시 순서 (필터 탭) */
export const CATEGORY_ORDER = [
  "공기업",
  "공공기관",
  "준정부기관",
  "대기업",
  "중견기업",
  "중소기업",
  "금융기관",
  "외국계기업",
  "기타",
] as const;

export function getCompany(id: string): ExpoCompany | undefined {
  return COMPANIES.find((c) => c.id === id);
}

/** 해당 기업의 채용설명회 일정 */
function normalize(name: string): string {
  return name.replace(/[\s()（）㈜]|주식회사|\(주\)|\(재\)|\(사\)/g, "");
}

export function sessionFor(company: ExpoCompany): ExpoSession | undefined {
  return SESSIONS.find((s) => normalize(s.company) === normalize(company.name));
}

/** 해당 기업에 재직 중인 동문 멘토 */
export function mentorsFor(company: ExpoCompany): ExpoMentor[] {
  return MENTORS.filter((m) => normalize(m.company) === normalize(company.name));
}
