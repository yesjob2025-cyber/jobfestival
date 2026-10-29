// ─────────────────────────────────────────────────────────────
// 취업 타로 — 메이저 아르카나 22장을 취업 이야기로 다시 풀었습니다.
// 모든 카드는 긍정적으로 풀이합니다 (재미로 보는 운세).
// ─────────────────────────────────────────────────────────────

export interface TarotCard {
  no: number;
  /** 원래 타로 이름 */
  tarot: string;
  /** 취업 버전 이름 */
  name: string;
  emoji: string;
  keyword: string;
  /** 지금의 나 */
  now: string;
  /** 다가올 기회 */
  chance: string;
  /** 합격을 위한 조언 */
  advice: string;
  /** 행운의 직무 */
  job: string;
}

export const TAROT: TarotCard[] = [
  { no: 0, tarot: "THE FOOL", name: "새내기 도전자", emoji: "🎒", keyword: "새로운 시작",
    now: "두려움보다 설렘이 큰 시기예요. 겁 없이 부딪히는 용기가 가장 큰 무기!",
    chance: "생각지 못한 분야에서 첫 기회가 찾아와요. 일단 지원해 보세요.",
    advice: "완벽하게 준비될 때를 기다리지 말고, 지금 첫발을 내디뎌요.",
    job: "스타트업 · 신사업 기획" },
  { no: 1, tarot: "THE MAGICIAN", name: "기획의 마법사", emoji: "🪄", keyword: "실행력",
    now: "필요한 재료는 이미 다 갖췄어요. 이제 꺼내 쓰기만 하면 돼요.",
    chance: "내가 만든 결과물이 면접관의 눈길을 사로잡을 기회가 와요.",
    advice: "포트폴리오에 ‘직접 해 본 것’을 한 줄이라도 더 넣어 보세요.",
    job: "서비스 기획 · 마케팅" },
  { no: 2, tarot: "THE HIGH PRIESTESS", name: "조용한 전략가", emoji: "📚", keyword: "통찰",
    now: "남들이 못 보는 것을 보는 눈이 있어요. 차분함이 곧 경쟁력!",
    chance: "공부해 둔 지식이 시험 · 면접에서 빛을 발해요.",
    advice: "지원 회사를 깊이 공부하면 답변의 깊이가 달라져요.",
    job: "연구 · 데이터 분석" },
  { no: 3, tarot: "THE EMPRESS", name: "풍요의 크리에이터", emoji: "🌸", keyword: "창의 · 풍요",
    now: "아이디어가 샘솟는 시기! 표현하는 만큼 결과가 따라와요.",
    chance: "나다운 감각을 알아봐 주는 회사를 만나게 돼요.",
    advice: "자기소개서에 나만의 색깔을 숨기지 말고 드러내세요.",
    job: "디자인 · 콘텐츠 제작" },
  { no: 4, tarot: "THE EMPEROR", name: "든든한 리더", emoji: "👑", keyword: "리더십 · 안정",
    now: "책임감 있게 일을 끝까지 해내는 사람이라는 신뢰를 받고 있어요.",
    chance: "안정적인 조직에서 나를 원하는 소식이 들려와요.",
    advice: "팀을 이끈 경험을 구체적인 숫자로 이야기해 보세요.",
    job: "경영지원 · 공공기관" },
  { no: 5, tarot: "THE HIEROPHANT", name: "멘토의 조언", emoji: "🎓", keyword: "배움 · 멘토",
    now: "배우려는 자세가 돋보이는 시기. 좋은 스승이 곁에 있어요.",
    chance: "선배나 멘토를 통해 알짜 채용 정보를 얻게 돼요.",
    advice: "오늘 박람회에서 현직자에게 질문 하나는 꼭 해 보세요!",
    job: "교육 · 인사(HR)" },
  { no: 6, tarot: "THE LOVERS", name: "운명의 회사", emoji: "💞", keyword: "선택 · 궁합",
    now: "여러 갈래 길 앞에 서 있어요. 고민한다는 건 기회가 많다는 뜻!",
    chance: "나와 ‘궁합’이 딱 맞는 회사가 곧 나타나요.",
    advice: "연봉만 보지 말고 나와 맞는 문화인지 꼭 확인해요.",
    job: "영업 · 고객관리" },
  { no: 7, tarot: "THE CHARIOT", name: "합격 질주", emoji: "🏎️", keyword: "추진력",
    now: "목표를 향해 달리는 엔진이 켜졌어요. 속도가 붙는 중!",
    chance: "서류 → 면접으로 빠르게 이어지는 흐름이 와요.",
    advice: "일정을 미리 정리해 두면 기회를 놓치지 않아요.",
    job: "물류 · 해외영업" },
  { no: 8, tarot: "STRENGTH", name: "단단한 멘탈", emoji: "🦁", keyword: "끈기 · 용기",
    now: "몇 번 넘어져도 다시 일어나는 힘이 있어요. 진짜 강한 사람!",
    chance: "끝까지 버틴 사람에게 오는 반전 합격 소식이 기다려요.",
    advice: "실패 경험을 ‘극복 스토리’로 바꿔 말해 보세요.",
    job: "경찰 · 소방 · 군 간부" },
  { no: 9, tarot: "THE HERMIT", name: "자기 탐색가", emoji: "🏮", keyword: "성찰",
    now: "나를 깊이 들여다보는 시간. 이 시간이 방향을 정해 줘요.",
    chance: "‘내가 진짜 원하는 일’이 선명해지는 순간이 와요.",
    advice: "강점 세 가지를 적어 보면 지원할 곳이 보여요.",
    job: "연구개발 · 전문직" },
  { no: 10, tarot: "WHEEL OF FORTUNE", name: "기회의 바퀴", emoji: "🎡", keyword: "전환점",
    now: "운의 바퀴가 내 쪽으로 돌기 시작했어요.",
    chance: "갑자기 열리는 수시 채용 · 추천 기회를 잡게 돼요.",
    advice: "채용 알림을 켜 두세요. 타이밍이 곧 운이에요!",
    job: "IT · 신산업" },
  { no: 11, tarot: "JUSTICE", name: "공정한 평가", emoji: "⚖️", keyword: "균형 · 결과",
    now: "노력한 만큼 정확하게 돌아오는 시기예요.",
    chance: "실력을 객관적으로 인정받는 시험 · 평가에서 좋은 결과가!",
    advice: "자격증 · 어학 점수 같은 증빙을 챙겨 두면 든든해요.",
    job: "공기업 · 법무 · 회계" },
  { no: 12, tarot: "THE HANGED MAN", name: "관점 전환", emoji: "🙃", keyword: "새로운 시각",
    now: "잠깐 멈춘 것 같지만, 사실 시야를 넓히는 중이에요.",
    chance: "전혀 생각 못 한 직무가 나와 잘 맞는다는 걸 알게 돼요.",
    advice: "관심 없던 기업 부스도 한 곳 들러 보세요!",
    job: "컨설팅 · 직무 전환" },
  { no: 13, tarot: "DEATH", name: "새 출발", emoji: "🦋", keyword: "변화 · 졸업",
    now: "학생에서 사회인으로, 멋진 변신을 앞두고 있어요.",
    chance: "새로운 환경이 나를 한 단계 성장시켜 줘요.",
    advice: "익숙한 것을 내려놓을 때 더 큰 문이 열려요.",
    job: "해외 · 신규 프로젝트" },
  { no: 14, tarot: "TEMPERANCE", name: "밸런스 마스터", emoji: "🧪", keyword: "조화",
    now: "공부 · 일 · 쉼의 균형을 잘 잡고 있어요.",
    chance: "협업 능력을 높이 사는 팀에서 연락이 와요.",
    advice: "‘함께 해서 잘된 경험’을 면접 답변으로 준비하세요.",
    job: "간호 · 보건 · 복지" },
  { no: 15, tarot: "THE DEVIL", name: "열정의 몰입", emoji: "🔥", keyword: "집중 · 열정",
    now: "한 번 빠지면 끝장을 보는 몰입력이 있어요.",
    chance: "좋아하는 일을 직업으로 만들 기회가 다가와요.",
    advice: "‘덕질’도 경력이 돼요. 좋아하는 걸 당당히 말해요.",
    job: "게임 · 엔터 · 콘텐츠" },
  { no: 16, tarot: "THE TOWER", name: "판 뒤집기", emoji: "⚡", keyword: "돌파",
    now: "낡은 계획을 깨고 새 판을 짤 에너지가 넘쳐요.",
    chance: "예상 밖의 전개가 오히려 더 좋은 기회로 이어져요.",
    advice: "플랜 B를 준비해 두면 위기가 곧 기회가 돼요.",
    job: "창업 · 혁신 부서" },
  { no: 17, tarot: "THE STAR", name: "희망의 별", emoji: "⭐", keyword: "희망",
    now: "묵묵히 준비해 온 시간이 별처럼 빛나기 시작해요.",
    chance: "오랫동안 바라던 곳에서 좋은 소식이 들려와요.",
    advice: "꿈의 회사를 소리 내어 말해 보세요. 운이 따라와요.",
    job: "항공 · 관광 · 서비스" },
  { no: 18, tarot: "THE MOON", name: "숨은 가능성", emoji: "🌙", keyword: "직감",
    now: "아직 드러나지 않은 재능이 숨어 있어요.",
    chance: "직감을 믿고 지원한 곳에서 기회가 생겨요.",
    advice: "끌리는 공고가 있다면 망설이지 말고 지원!",
    job: "예술 · 심리 · 상담" },
  { no: 19, tarot: "THE SUN", name: "최종 합격", emoji: "☀️", keyword: "성공",
    now: "밝은 에너지가 주변까지 환하게 만드는 사람이에요.",
    chance: "‘최종 합격’ 문자를 받는 장면이 그려져요!",
    advice: "면접에서는 지금 그 미소 그대로면 충분해요.",
    job: "홍보 · 대외협력" },
  { no: 20, tarot: "JUDGEMENT", name: "재도전의 나팔", emoji: "📯", keyword: "재도전",
    now: "한 번의 아쉬움을 딛고 다시 도전할 준비가 됐어요.",
    chance: "예전에 아쉬웠던 곳에서 다시 기회가 와요.",
    advice: "지난 지원서를 다듬어 다시 내 보세요. 이번엔 달라요!",
    job: "공무원 · 공공기관" },
  { no: 21, tarot: "THE WORLD", name: "꿈의 완성", emoji: "🌍", keyword: "완성 · 글로벌",
    now: "지금까지의 모든 경험이 하나로 이어지는 시기예요.",
    chance: "더 넓은 무대 — 글로벌 기업 · 해외 근무 기회가 보여요.",
    advice: "어학과 경험을 연결한 ‘나만의 이야기’를 완성하세요.",
    job: "해외영업 · 무역 · 글로벌" },
];

export const TOPICS = [
  { id: "job", emoji: "💼", name: "취업운", lead: "올해 취업운" },
  { id: "interview", emoji: "🎤", name: "면접운", lead: "다가오는 면접운" },
  { id: "career", emoji: "🧭", name: "진로 · 직무", lead: "나에게 맞는 진로운" },
  { id: "salary", emoji: "💰", name: "연봉 · 커리어", lead: "연봉 · 커리어운" },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];

export const POSITIONS = ["지금의 나", "다가올 기회", "합격을 위한 조언"] as const;

const LUCKY_ITEMS = ["네이비 넥타이", "손목시계", "하늘색 셔츠", "단정한 구두", "자신감 있는 미소", "검은 볼펜", "포트폴리오 파일", "깔끔한 헤어", "물 한 병", "따뜻한 커피"];
const LUCKY_COLORS = ["스카이 블루", "네이비", "옐로", "코랄 핑크", "화이트", "민트"];

/** 뽑은 카드로 정해지는 행운 정보 — 같은 카드면 같은 결과 */
export function luckOf(cards: TarotCard[], topic: TopicId) {
  const seed = cards.reduce((a, c) => a * 31 + c.no + 7, topic.length * 101);
  return {
    score: 82 + (seed % 17),
    item: LUCKY_ITEMS[seed % LUCKY_ITEMS.length],
    color: LUCKY_COLORS[(seed >> 3) % LUCKY_COLORS.length],
    job: cards[1].job,
  };
}

export function shuffled(): TarotCard[] {
  const deck = [...TAROT];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
