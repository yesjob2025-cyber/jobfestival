// ─────────────────────────────────────────────────────────────
// 2026 국립한국해양대학교(KMOU) 취업박람회 참가기업 (30개사)
//
// 기업명·홈페이지·소개·기업정보·채용정보는 배포된 "참가기업 웹북" 기준이며,
// 부스번호·기업분류·업종은 기업섭외현황 명단 기준입니다.
// altName 은 명단 표기가 웹북과 다를 때만 넣어 검색에 함께 활용합니다.
// ─────────────────────────────────────────────────────────────

export interface JobPosting {
  role: string;
  qualification: string;
  education: string;
  headcount: string;
  salary: string;
}

export interface LabeledValue {
  label: string;
  value: string;
}

export interface ExpoCompany {
  id: string;
  boothNo: string;
  code: string;
  name: string;
  /** 행사 명단 표기 (웹북과 다를 때만) */
  altName?: string;
  category: string;
  industry: string;
  homepage?: string;
  /** 홈페이지가 여러 개일 때 원문 표기 */
  homepageNote?: string;
  intro?: string;
  info?: LabeledValue[];
  jobs?: JobPosting[];
  /** 채용 표 대신 안내 문구만 있는 경우 */
  hiringNote?: string;
  conditions?: LabeledValue[];
}

export const COMPANIES: ExpoCompany[] = [
  {
    "id": "b01",
    "boothNo": "01",
    "code": "A01",
    "name": "부산교통공사",
    "category": "공기업",
    "industry": "도시철도 운송업",
    "homepage": "https://www.humetro.busan.kr",
    "intro": "부산교통공사는 부산도시철도 건설과 운영을 동시에 수행하는 도시철도 전문기관입니다. 부산도시철도 1·2·3·4호선, 114개 역사 그리고 영업거리 기준 115.2km를 운영·관리하며, 1985년 1호선 개통을 시작으로 부산 대중교통의 중추 역할을 수행해 온 지 올해로 41년째입니다. 친환경 저탄소 대중교통인 부산도시철도를 통해, 동남권 광역생활권의 주축이자 부산-울산-경남 단일생활권 조성에 앞장서는 부산 최대 공기업인 부산교통공사의 꿈을 함께 실현할 인재를 기다립니다.",
    "info": [
      {
        "label": "대표자",
        "value": "이병진"
      },
      {
        "label": "직원수",
        "value": "5,089명(계약직 포함 현원)"
      },
      {
        "label": "주소",
        "value": "부산광역시 부산진구 중앙대로644번길 20(범천동)"
      },
      {
        "label": "대표전화",
        "value": "1544-5005"
      },
      {
        "label": "업종",
        "value": "여객운송(도시철도)"
      },
      {
        "label": "팩스",
        "value": "051-640-7217"
      }
    ],
    "jobs": [
      {
        "role": "일반직",
        "qualification": "없음(단, 운전직은 관련법에 따른 제2종 전기차량 운전면허 보유자)",
        "education": "무관",
        "headcount": "변동",
        "salary": "근무형태에 따라 다름"
      },
      {
        "role": "공무직",
        "qualification": "해당분야 기능사 이상 자격증",
        "education": "무관",
        "headcount": "",
        "salary": "월 218만원"
      },
      {
        "role": "상용직",
        "qualification": "해당분야 기능사 이상 자격증",
        "education": "무관",
        "headcount": "변동",
        "salary": "근무형태에 따라 다름"
      },
      {
        "role": "기타",
        "qualification": "모집분야에 따라 다름",
        "education": "무관",
        "headcount": "변동",
        "salary": "근무형태에 따라 다름"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산광역시 및 경상남도 양산시 일원"
      },
      {
        "label": "고용형태",
        "value": "정규직(일반직·공무직·상용직 등) 및 계약직(기간제근로자)"
      },
      {
        "label": "근무형태",
        "value": "통상근무, 교대근무, 교번근무(직렬 및 고용형태에 따라 다름)"
      },
      {
        "label": "근무시간",
        "value": "고용형태에 따라 다름"
      },
      {
        "label": "복리후생",
        "value": "4대보험, 퇴직금, 평가급, 선택적 복지포인트"
      },
      {
        "label": "제출서류",
        "value": "입사지원시스템을 통한 지원(고용형태에 따라 다름)"
      },
      {
        "label": "추가사항",
        "value": "채용홈페이지 공고문 참조"
      }
    ]
  },
  {
    "id": "b02",
    "boothNo": "02",
    "code": "A02",
    "name": "한국자산관리공사",
    "category": "공공기관",
    "industry": "기금 운영업",
    "homepage": "https://www.kamco.or.kr",
    "intro": "한국자산관리공사 캠코는 『한국자산관리공사 설립 등에 관한 법률』에 따라 설립되어 금융회사 부실채권 인수, 정리 및 기업구조조정업무, 금융취약계층의 재기지원, 국유재산관리 및 체납조세정리 업무를 수행하고 있는 준정부기관입니다.공사는 상시 구조조정기구로서 국가경제와 금융산업발전에 이바지하고 있으며, 국유재산관리 등 정부위탁업무의 효율적 추진을 통한 국가재정 수입극대화를 도모함은 물론 외환위기 및 글로벌금융위기 등 위기극복의 최일선에서 가계 · 기업 · 공공부문을 포괄하여 지원하는 국가경제안전판으로서 『공적자산관리전문기관』의 역할을 수행하고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "정정훈"
      },
      {
        "label": "직원수",
        "value": "1,961명"
      },
      {
        "label": "주소",
        "value": "부산광역시 남구 문현금융로 40"
      },
      {
        "label": "대표전화",
        "value": "051-794-3118"
      },
      {
        "label": "업종",
        "value": "금융업"
      },
      {
        "label": "팩스",
        "value": "0502-927-1031"
      }
    ],
    "jobs": [
      {
        "role": "신입직",
        "qualification": "자세한 내용은추후 채용공고 참조",
        "education": "5급(대졸수준): 학력무관",
        "headcount": "104명(’26 채용완료)",
        "salary": "연 4,807만원수준"
      },
      {
        "role": "체험형 인턴",
        "qualification": "자세한 내용은추후 채용공고 참조",
        "education": "학력무관",
        "headcount": "200명 내외(상·하반기 전체)",
        "salary": "월 236만원내외"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "본사 및 전국 지역본부"
      },
      {
        "label": "고용형태",
        "value": "신입직 : 정규직 / 체험형 인턴 : 단기계약직"
      },
      {
        "label": "근무시간",
        "value": "주5일, 일 8시간"
      },
      {
        "label": "복리후생",
        "value": "유연근무·교육지원·사택지원 등"
      },
      {
        "label": "제출서류",
        "value": "온라인 접수(추후 채용공고 참조)"
      }
    ]
  },
  {
    "id": "b03",
    "boothNo": "03",
    "code": "A03",
    "name": "일양약품(주)",
    "category": "중견기업",
    "industry": "완제 의약품 제조업",
    "homepage": "https://www.recruit.ilyang.co.kr",
    "intro": "“인간존중의 사명감을 갖고 인류의 건강과 복지를 위하여 정성을 다한다”라는 기업이념 속에 지난 1946년 창업한 일양약품은 한국 제약산업의 발전사와 그 맥을 함께해왔습니다. 노루무, 원비D 뿐만 아니라 일양약품은 글로벌 산약기업에 역점을 두면서 항상 미래를 준비하는 도전과 응전을 지속하고 몇 배 이상의 긴장감과 준비를 통해 미래의 먹거리를 준비하고 있다.",
    "info": [
      {
        "label": "대표자",
        "value": "정유석"
      },
      {
        "label": "직원수",
        "value": "675명"
      },
      {
        "label": "주소",
        "value": "서울특별시 강남구 도곡로194"
      },
      {
        "label": "대표전화",
        "value": "570-3700"
      },
      {
        "label": "업종",
        "value": "제조업, (양악 외)"
      },
      {
        "label": "팩스",
        "value": "570-3708"
      }
    ],
    "jobs": [
      {
        "role": "ETC총괄본부",
        "qualification": "● 4년제 정규대학 졸업 이상인 자 ● 부산, 창원, 제주, 대전, 인천, 광주, 수원 근무 가능한 자● 남자의 경우 병역 必● 해외여행에 결격사유가 없는 자",
        "education": "대졸이상",
        "headcount": "",
        "salary": "5,050만원 이상"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산/창원/제주/대전/인천/광주/수원"
      },
      {
        "label": "고용형태",
        "value": "정규직(수습기간3개월)"
      },
      {
        "label": "근무시간",
        "value": "전국영업지점 : 09시~18시(간주근로제)"
      },
      {
        "label": "복리후생",
        "value": "임직원몰 자사제품 최대 60% 할인, 경조사 지원, 학자금 지원, 동호회 지원, 워크숍/회식비 지원, 징검다리 휴가, 제휴 리조트 회원가 이용, 건강검진, 백신 무료접종, 주거지원 및 통근버스 지원, 장기근속 및 우수사원 포상, 22개 연차 제공"
      },
      {
        "label": "제출서류",
        "value": "서류접수 → 1차면접(실무사) → 인적성검사 →2차면접(임원) → 최종합격"
      }
    ]
  },
  {
    "id": "b04",
    "boothNo": "04",
    "code": "A04",
    "name": "LG전자(주)",
    "category": "대기업",
    "industry": "통신 및 방송 장비 제조업",
    "homepage": "https://www.lge.co.kr",
    "intro": "LG전자는 ‘Life's Good’ 브랜드 철학을 바탕으로 고객에게 더 나은 삶을 제공하기 위해 ▲최고의(First) ▲차별화된(Unique) ▲세상에 없던(New) F·U·N 경험을 선사하고자 항상 노력합니다.HS(Home Appliance Solution), MS(Media Entertainment Solution, VS(Vehicle Solution), ES(Eco Solution)의 사업본부로 구성되어 있으며, 전 세계 130여 개 사업장에서 사업을 전개하며 가전, IT, 자동차부품, 사이니지 등 다양한 분야에서 기술혁신을 선도하는 글로벌 리더입니다.",
    "info": [
      {
        "label": "대표자",
        "value": "류재철"
      },
      {
        "label": "직원수",
        "value": "33,885명"
      },
      {
        "label": "주소",
        "value": "서울시 영등포구 여의대로 128 LG트윈타워"
      },
      {
        "label": "대표전화",
        "value": "02-3777-1114"
      },
      {
        "label": "업종",
        "value": "통신 및 방송 장비 제조업"
      }
    ],
    "hiringNote": "2026 하반기 채용 예정"
  },
  {
    "id": "b05",
    "boothNo": "05",
    "code": "A05",
    "name": "한국조선해양기자재연구원",
    "category": "기타",
    "industry": "기타 공학연구개발업",
    "altName": "(재)한국조선해양기자재연구원",
    "homepage": "https://www.komeri.re.kr",
    "intro": "한국조선해양기자재연구원은 산업기술혁신촉진법에 근거하여 조선해양기자재의 기술개발, 시험인증 등의 종합적인 지원을 통하여 조선해양산업 발전에 이바지하는 것을 목적으로 2001년 설립된 산업통상자원부 산하 전문생산기술연구원입니다.",
    "info": [
      {
        "label": "대표자",
        "value": "양원창"
      },
      {
        "label": "직원수",
        "value": "273명"
      },
      {
        "label": "주소",
        "value": "부산 영도구 해양로 435"
      },
      {
        "label": "대표전화",
        "value": "051-400-5000"
      },
      {
        "label": "업종",
        "value": "연구개발"
      },
      {
        "label": "팩스",
        "value": "051-400-5010"
      }
    ],
    "jobs": [
      {
        "role": "AI(근무지:서울)",
        "qualification": "채용공고 참고",
        "education": "",
        "headcount": "",
        "salary": ""
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산, 울산, 거제, 양산, 목포, 군산"
      },
      {
        "label": "고용형태",
        "value": "정규직 및 계약직"
      },
      {
        "label": "근무형태",
        "value": "시차출퇴근제"
      },
      {
        "label": "근무시간",
        "value": "09:00~18:00"
      },
      {
        "label": "복리후생",
        "value": "연간 복지카드 지급(연차별 상이), 건강검진 지원(공가), 하계휴가, 하프데이, 명절상여, 리조트, 자녀학자금, 경조금 등"
      },
      {
        "label": "제출서류",
        "value": "이력서, 자기소개서, 졸업증명서 등"
      }
    ]
  },
  {
    "id": "b06",
    "boothNo": "06",
    "code": "A06",
    "name": "CJ대한통운(주)",
    "category": "대기업",
    "industry": "도로 화물 운송업",
    "homepage": "https://www.cjlogistics.com",
    "intro": "CJ대한통운은 첨단 물류 기술과 시스템을 기반으로 최적화된 솔루션을 제시하여 고객 만족을 극대화하고 물류를 통한 새로운 가치를 만들어 나갑니다.",
    "info": [
      {
        "label": "대표자",
        "value": "신영수/민영학"
      },
      {
        "label": "직원수",
        "value": "6,057명"
      },
      {
        "label": "주소",
        "value": "서울시 종로구 종로5길 7"
      },
      {
        "label": "대표전화",
        "value": "1588-1255"
      },
      {
        "label": "업종",
        "value": "도로 화물 운송업"
      }
    ],
    "hiringNote": "2026 하반기 채용 예정"
  },
  {
    "id": "b07",
    "boothNo": "07",
    "code": "A07",
    "name": "부산신항만(주)",
    "category": "중견기업",
    "industry": "항구 및 기타해상 터미널 운영업",
    "homepage": "https://www.pncport.com",
    "intro": "DP World Busan은 세계적인 항만 운영사인 DP World의 글로벌 네트워크와 운영 노하우를 바탕으로, 동북아시아 물류 중심지인 부산신항에서 최고 수준의 컨테이너 터미널 서비스를 제공하고 있습니다.지속적인 시설 투자와 운영 혁신을 통해 항만 운영의 효율성과 생산성을 향상시키고 있으며, 고객에게 신속하고 안정적인 서비스를 제공하기 위해 최선을 다하고 있습니다. 특히 컨테이너선의 대형화 추세에 대응하여 20,000TEU급 이상의 초대형 선박이 접안 가능한 17m 수심을 확보하고, 초대형 안벽크레인과 최첨단 운영 시스템을 구축하여 경쟁력 있는 터미널 운영 환경을 갖추고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "Joe Schofield"
      },
      {
        "label": "직원수",
        "value": "912명"
      },
      {
        "label": "주소",
        "value": "부산광역시 강서구 신항남로 372"
      },
      {
        "label": "대표전화",
        "value": "051-601-8114"
      },
      {
        "label": "업종",
        "value": "컨테이너 터미널 운영 및 항만하역 서비스"
      },
      {
        "label": "팩스",
        "value": "051-601-8120"
      }
    ]
  },
  {
    "id": "b08",
    "boothNo": "08",
    "code": "A08",
    "name": "LIG Defense&Aerospace",
    "category": "대기업",
    "industry": "무기 및 총포탄 제조업",
    "altName": "LIG Defense&Aerospace(주)",
    "homepage": "https://www.ligdefenseaerospace.com",
    "intro": "첨단 무기체계를 개발·생산하는 종합방위산업체, LIG 디펜스&에어로스페이스입니다.",
    "info": [
      {
        "label": "대표자",
        "value": "신익현"
      },
      {
        "label": "직원수",
        "value": "5,959명"
      },
      {
        "label": "주소",
        "value": "경기도 용인시 기흥구 마북로207"
      },
      {
        "label": "대표전화",
        "value": "1644-2005"
      },
      {
        "label": "업종",
        "value": "무기 및 총포탄 제조업"
      }
    ],
    "hiringNote": "세부 모집요강 참고",
    "conditions": [
      {
        "label": "근무지",
        "value": "세부 모집요강 참고"
      },
      {
        "label": "고용형태",
        "value": "세부 모집요강 참고"
      },
      {
        "label": "근무형태",
        "value": "정규직"
      },
      {
        "label": "근무시간",
        "value": "세부 모집요강 참고"
      },
      {
        "label": "복리후생",
        "value": "4대보험 / 통근버스 / 차량유지비 / 중식제공(지원) / 교육비지원 / 자녀학자금지원 /주택자금지원 /기타(유연근무제도, 의료비 지원, 복지포인트, Refresh 휴가 지원금, 해외 문화 체험비 지원, 사내커플 결혼 축하금 등)"
      },
      {
        "label": "제출서류",
        "value": "세부 모집요강 참고"
      }
    ]
  },
  {
    "id": "b09",
    "boothNo": "09",
    "code": "A09",
    "name": "하나은행",
    "category": "금융기관",
    "industry": "국내은행",
    "altName": "(주)하나은행",
    "homepage": "https://www.kebhana.com",
    "intro": "하나은행은 ‘함께 성장하며 행복을 나누는 금융’이라는 미션하에, 하나로 연결된 모두의 금융을 지향합니다.손님을 우선하는 하나만의 가치를 실현하고, 지속 가능한 경영 실천으로 새로운 가치를 제공하고, 변화에 적극적으로 대응하며 더 나은 가치를 창출하고자 합니다.하나은행은 보다 나은 사회를 만들기 위해 함께 노력하는 모든 이해관계자들이 성장할 수 있는 활동을 실천하되, 기업 본연의 목적인 성장과 사회적 책임을 균형 있게 추구하는 ‘건강한 성장’을 추구합니다.",
    "info": [
      {
        "label": "대표자",
        "value": "이호성"
      },
      {
        "label": "직원수",
        "value": "약 12,900명"
      },
      {
        "label": "주소",
        "value": "서울 중구 을지로 35(을지로 1가, ㈜하나은행 본점)"
      },
      {
        "label": "대표전화",
        "value": "051-250-2380"
      },
      {
        "label": "업종",
        "value": "은행업(국내)"
      },
      {
        "label": "팩스",
        "value": "051-255-3722"
      }
    ],
    "jobs": [
      {
        "role": "미확정",
        "qualification": "",
        "education": "대학교 졸업(예정자)",
        "headcount": "미확정",
        "salary": "미확정"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "미확정"
      },
      {
        "label": "고용형태",
        "value": "정직원"
      },
      {
        "label": "근무형태",
        "value": "주 5일제 (월~금)"
      },
      {
        "label": "근무시간",
        "value": "09:00 ~ 18:00 (휴게시간 1시간)"
      },
      {
        "label": "복리후생",
        "value": "의료비 지원, 휴양시설 지원, 체력단력비 지원, 학자금 지원 등"
      },
      {
        "label": "제출서류",
        "value": "추후 안내 예정"
      }
    ]
  },
  {
    "id": "b10",
    "boothNo": "10",
    "code": "A10",
    "name": "한국항공우주산업(KAI)",
    "category": "대기업",
    "industry": "항공기,우주선 및 보조장치 제조업",
    "altName": "KAI 한국항공우주산업(주)",
    "homepage": "https://koreaaero.recruiter.co.kr",
    "intro": "KAI는 지난 40년간 항공우주산업을 이끌었던 대한민국 대표 항공우주 체계종합업체로서 KT-1 기본훈련기, T-50 고등훈련기, 수리온 기동헬기, 송골매 무인기 개발 등의 성공으로 대한민국 안보와 항공전력을 책임져왔으며, 현대 전장을 위한 첨단 소형무장헬기(LAH) 개발 성공에 더불어 미래 핵심 전력으로 꼽히는 KF-21(한국형 전투기) 개발을 통해 항공우주의 미래를 이끌어나가고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "김종출"
      },
      {
        "label": "직원수",
        "value": "약 5000명"
      },
      {
        "label": "주소",
        "value": "경상남도 사천시 사남면 공단1로 78"
      },
      {
        "label": "업종",
        "value": "항공기 제조업"
      }
    ],
    "hiringNote": "26년 하반기 공통직 신입사원 채용",
    "conditions": [
      {
        "label": "근무지",
        "value": "사천 / 대전 / 서울"
      },
      {
        "label": "고용형태",
        "value": "정규직"
      },
      {
        "label": "근무시간",
        "value": "8:00 ~17:00"
      }
    ]
  },
  {
    "id": "b11",
    "boothNo": "11",
    "code": "A11",
    "name": "부산신항국제터미널(PNIT)",
    "category": "중견기업",
    "industry": "항구 및 기타 해상 터미널 운영업",
    "altName": "부산신항국제터미널(주)",
    "homepage": "https://www.pnitl.com",
    "intro": "PNIT는 2010년 개장한 부산신항의 컨테이너 터미널 운영사로, 세계 최대의 글로벌 터미널 운영사인 PSA International의 멤버 회사입니다.PNIT는 PSA Korea의 대표적인 성장 거점이며, 최고 수준의 운영 생산성과 고객 서비스를 제공하고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "SILAS PNG YI-TA"
      },
      {
        "label": "직원수",
        "value": "453명"
      },
      {
        "label": "주소",
        "value": "부산광역시 강서구 신항남로 330"
      },
      {
        "label": "대표전화",
        "value": "051-290-8000"
      },
      {
        "label": "업종",
        "value": "화물하역업"
      },
      {
        "label": "팩스",
        "value": "051-290-8059"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산광역시 강서구"
      },
      {
        "label": "고용형태",
        "value": "정규직, 계약직"
      },
      {
        "label": "근무형태",
        "value": "교대직 : 3조 2교대"
      },
      {
        "label": "근무시간",
        "value": "비교대직 : 9:00-18:00, 교대직 : 주/야간"
      },
      {
        "label": "복리후생",
        "value": "4대보험 / 퇴직연금 / 개인연금 / 연차 / 연중휴가 / 성과금 등(정규직 기준, 고용형태에 따라 상이)"
      },
      {
        "label": "제출서류",
        "value": "이력서 및 기타 자격증명서"
      },
      {
        "label": "추가사항",
        "value": "현재 채용 계획 없음KMOU와의 PSA 글로벌 인재 발굴 프로그램(OE: Operations Executive) 시행 예정"
      }
    ]
  },
  {
    "id": "b12",
    "boothNo": "12",
    "code": "A12",
    "name": "대한항공",
    "category": "대기업",
    "industry": "항공 여객 운송업",
    "altName": "(주)대한항공 항공우주사업본부",
    "homepage": "https://koreanair.com",
    "homepageNote": "(본사) https://koreanair.com (본부) https://aerospace.koreanair.com",
    "intro": "세계 유일의 항공기를 제작하는 항공사.여객/화물 사업 뿐만아니라 대한민국의 항공우주 미래를 책임지는 대한항공입니다. 민항기 구조물 제작을 통해 보잉/에어버스와의 공동 협력으로 민항기 사업을 수행하며, 40년 이상 축적된 노하우로 군용기 정비 및 성능개량 사업을 수행하고 있습니다. 무인항공기 연구개발을 통해 우리 군에 납품하여 대한민국의 영공을 수호하고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "우기홍 외"
      },
      {
        "label": "직원수",
        "value": "약 20,000여명"
      },
      {
        "label": "주소",
        "value": "(본사) 서울특별시 강서구 하늘길 260(본부) 부산광역시 강서구 테크센터로 55"
      },
      {
        "label": "대표전화",
        "value": "(본사) 02-2656-2001(본부) 051-970-5401"
      },
      {
        "label": "업종",
        "value": "항공제조업, 여객/화물 운송업"
      }
    ],
    "jobs": [
      {
        "role": "종합직(신입)",
        "qualification": "- 분야별 모집 대상 전공자 (기 졸업자 및 2027년 2월 졸업예정자)\n- TOEIC 750점 또는 OPIc Level IM3 또는 TOEIC Speaking Level IM3 이상 취득한 자\n- 병역필 또는 면제자로 학업 성적이 우수하고 해외여행에 결격사유가 없는 자",
        "education": "무관",
        "headcount": "",
        "salary": "회사 내규에따름"
      },
      {
        "role": "종합직(경력)",
        "qualification": "- 치공구 설계 경력 4년 이상 및 3D CAD (CATIA V5 또는 NX) 실무 활용 가능자 ※ 항공/기계공학 학사 이상 ※ 항공 분야 치공구 설계 및 제작 유경험자 ※ 항공기 대형 구조물 조립 치공구 (Major Assembly Jig) 설계 경험자",
        "education": "학사 이상",
        "headcount": "",
        "salary": "처우 협상시 결정"
      },
      {
        "role": "항공우주연구개발",
        "qualification": "- 항공기 체계개발, 구조설계/해석, 공력설계/해석\n- 항공기 계통 설계 및 개발 (추진, 착륙, 유압, 환경, 전기 등)\n- 항공전자 장비 요구도 분석 및 설계\n- 항공기 감항인증 및 계측\n- RAM, PSA 분석\n- IPS 12대 요소개발\n- 전자식 기술교범개발(S-1000D 적용)\n- 체계 운영 유지비용 분석",
        "education": "학사 이상",
        "headcount": "",
        "salary": "처우 협상시 결정"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산 * 연구개발/IPS 부문은 대전 근무 **회사 업무상 필요에 의해 타지역에서 근무 할 수 있음"
      },
      {
        "label": "고용형태",
        "value": "정규직 (연구개발/IPS 부문의 경우 1년 촉탁 이후 소정의 심사를 거쳐 정규직 전환)"
      },
      {
        "label": "근무형태",
        "value": "Full time"
      },
      {
        "label": "근무시간",
        "value": "8시간 (7:30 ~16:30), 유연근무제 적용"
      },
      {
        "label": "복리후생",
        "value": "직원항공권 제공, 결혼/효도 항공권 제공 (비즈니스) 등"
      },
      {
        "label": "제출서류",
        "value": "홈페이지 공고 참조"
      }
    ]
  },
  {
    "id": "b13",
    "boothNo": "13",
    "code": "A13",
    "name": "㈜화신볼트산업",
    "category": "중소기업",
    "industry": "볼트 및 너트 제조업",
    "altName": "(주)화신볼트산업",
    "homepage": "https://www.hwashinbolt.co.kr",
    "intro": "1964년 설립되어 꾸준히 성장해 온 부산의 명문장수기업으로, 한국 특수볼트 제조업계의 선두기업으로써 국내 발전소 및 주요 중공업사에 특수 볼트 및 너트를 제작 공급하고 있습니다. 2000년대 후반부터는 수출 확대에 무게를 실으며, 현재 세계 약 40개국에 당사의 제품을 수출하고 있고, ISO, API, PED, KEPIC, NORSOK 등 다양한 인증을 보유하여 변화하는 세계의 요구에 앞서가는 적극적인 대응으로 성장해 나가고 있습니다. 명문장수기업, 부산시 명문향토기업, 청끌기업, 고용우수기업, 글로벌강소기업, 뿌리기술전문기업 등으로 선정되었고, 2030 직원들이 많이 근무하는 젊은 기업으로써 직원분들께서 더욱 성장하고 발전할 수 있는 기회를 제공하기 위해 꾸준히 노력하고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "정순원, 정태형"
      },
      {
        "label": "직원수",
        "value": "160명"
      },
      {
        "label": "주소",
        "value": "부산광역시 사하구 하신중앙로 3번길 64"
      },
      {
        "label": "대표전화",
        "value": "051-264-2522"
      },
      {
        "label": "업종",
        "value": "볼트 및 너트류 제조업"
      },
      {
        "label": "팩스",
        "value": "051-264-2527"
      }
    ],
    "jobs": [
      {
        "role": "영업지원",
        "qualification": "유통/무역 전공, 영어회화 가능자, 무역영어자격증",
        "education": "초대졸",
        "headcount": "",
        "salary": "연 3,200만원"
      },
      {
        "role": "출하",
        "qualification": "지게차 운전 자격증",
        "education": "무관",
        "headcount": "",
        "salary": "연 3,200만원"
      },
      {
        "role": "CNC",
        "qualification": "CNC프로그래밍(G코드, M코드) 가능자",
        "education": "고졸",
        "headcount": "",
        "salary": "연 3,200만원"
      },
      {
        "role": "품질보증",
        "qualification": "기계, 금속 전공자",
        "education": "대졸",
        "headcount": "",
        "salary": "연 3,200만원"
      },
      {
        "role": "품질관리",
        "qualification": "기계, 금속 전공자",
        "education": "대졸",
        "headcount": "",
        "salary": "연 3,200만원"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산광역시 사하구"
      },
      {
        "label": "고용형태",
        "value": "정규직"
      },
      {
        "label": "근무형태",
        "value": "주간근무"
      },
      {
        "label": "근무시간",
        "value": "08시~18시"
      },
      {
        "label": "복리후생",
        "value": "4대보험 / 퇴직금 / 경조사비 / 자녀학자금"
      },
      {
        "label": "제출서류",
        "value": "이력서(자기소개서 포함)"
      }
    ]
  },
  {
    "id": "b14",
    "boothNo": "14",
    "code": "A14",
    "name": "에스비 선보(주)",
    "category": "중소기업",
    "industry": "내연기관 제조업",
    "altName": "SB선보(주)",
    "homepage": "https://www.sbsunbo.com",
    "intro": "선보공업, 선보유니텍, 선보하이텍, 선보피스가 하나로 통합되어‘SB선보(주)’라는 새로운 이름으로 2025.7.1. 출범했습니다. 모듈 유니트 기술을 통해 선박 생산의 효율성과 품질을 높이는 새로운 기준을 제시하고, PRS 및 FGSS 등 LNG 연료공급 시스템을 최초로 상용화하며 글로벌 시장 진출의 기반을 다진 조선기자재 EPC 전문기업인 SB선보(주)는 IPO와 법인 통합을 통해 친환경 글로벌 에너지 리더로 성장,발전하고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "최금식, 김청욱"
      },
      {
        "label": "직원수",
        "value": "400명"
      },
      {
        "label": "주소",
        "value": "부산광역시 사하구 다산로 80(다대동)"
      },
      {
        "label": "대표전화",
        "value": "051-261-3454"
      },
      {
        "label": "업종",
        "value": "제조업"
      },
      {
        "label": "팩스",
        "value": "051-261-3455"
      }
    ],
    "jobs": [
      {
        "role": "생산관리팀",
        "qualification": "해외여행 및 건강상 결격사유가 없는 자",
        "education": "초대졸 이상",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "PM팀",
        "qualification": "[자격 요건]\n- 도면 해석 능력 및 기술적 문제 해결 역량\n- 비즈니스 영어 가능자 (해외 선주 및 파트너사 대응 가능 수준)\n[우대 조건]\n- 자격증 : PMP 자격 보유자\n- 친환경 선박 기술 또는 탄소포집 관련 프로젝트 경험자",
        "education": "초대졸 이상",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "선체구조팀",
        "qualification": "[자격 요건]\n- 구조 해석 프로그램 활용 능통자\n- 영어 커뮤니케이션 및 비즈니스 문서/이메일 작성 우수자",
        "education": "조선해양, 기계공학 등학사 이상",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "설계공정관리(EM팀)",
        "qualification": "외국어 업무 가능자",
        "education": "초대졸 이상",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "조선설계팀",
        "qualification": "- 해외 여행에 결격 사유가 없는 자\n- 전장/계장 설계 가능자",
        "education": "조선/해양 플랜트관련 학과",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "기계의장개발팀",
        "qualification": "해외 여행에 결격사유가 없는 자",
        "education": "조선/해양 플랜트관련 학과",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "프로세스개발팀",
        "qualification": "비즈니스 영어 가능자",
        "education": "초대졸 이상",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "자재조달팀",
        "qualification": "- ERP 및 MS Office 활용 능숙자\n- 비즈니스 영어 가능자",
        "education": "초대졸 이상(기계,금속 등공학계열 전공자)",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "HSE팀",
        "qualification": "- 유관전공 우대(안전공학, 산업경영공학)\n- 해외 여행에 결격 사유가 없는 자",
        "education": "초대졸 이상",
        "headcount": "",
        "salary": ""
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산광역시 사하구 다산로 80(다대동)부산광역시 사하구 감천항로 405번길 61 (구평동)"
      },
      {
        "label": "고용형태",
        "value": "정규직(3개월 시용기간)"
      },
      {
        "label": "근무형태",
        "value": "상근"
      },
      {
        "label": "근무시간",
        "value": "월수금 08:00 ~ 17:00 / 화목 08:00 ~ 18:00"
      },
      {
        "label": "복리후생",
        "value": "복지수당 연 100만원 지급, 콘도(리조트) 운영, 기숙사 운영, 기념일 축하(본인 생일 등 조기퇴근 및 선물 지급), 장기근속 포상"
      },
      {
        "label": "제출서류",
        "value": "이력서 및 포트폴리오"
      },
      {
        "label": "추가사항",
        "value": "[채용 절차]서류 전형 – 면접 전형 – 신체검사 – 입문교육 – 최종 입사"
      }
    ]
  },
  {
    "id": "b15",
    "boothNo": "15",
    "code": "A15",
    "name": "(주)동화엔텍",
    "category": "중견기업",
    "industry": "증류기, 열교환기 및 가스발생기 제조업",
    "altName": "(주)동아엔텍",
    "homepage": "https://www.dh.co.kr",
    "intro": "동화엔텍은 1980년 부산에서 선박용 열교환기 수리를 시작해, 현재 선박·발전·플랜트 산업을 아우르는 열에너지 기술 전문기업으로 성장했습니다.축적된 기술력을 바탕으로 LNG·수소·암모니아 등 친환경 에너지 분야로 사업을 확대하고 지속적으로 개발해 나가고 있습니다. 2025년에는 과학기술정보통신부로부터 연구개발특구 ‘첨단기술기업’으로 지정되며 친환경 에너지 분야의 기술 경쟁력을 인정받았습니다.동화엔텍은 저탄소·친환경 에너지 시대를 선도하는 글로벌 에너지 기술 기업을 지향합니다.",
    "info": [
      {
        "label": "대표자",
        "value": "김동건"
      },
      {
        "label": "직원수",
        "value": "260명"
      },
      {
        "label": "주소",
        "value": "부산광역시 강서구 녹산산단261로 7"
      },
      {
        "label": "대표전화",
        "value": "051-974-4763"
      },
      {
        "label": "업종",
        "value": "제조업(조선기자재)"
      },
      {
        "label": "팩스",
        "value": "051-970-1105"
      }
    ],
    "jobs": [
      {
        "role": "생산관리",
        "qualification": "- 기계·조선·산업공학 등 관련 전공자로 생산계획 및 제조 프로세스에 대한 기본 이해를 보유한 자\n- 조선·플랜트 제조현장 경험, ERP·Excel 등 데이터 기반 생산관리 및 개선활동 경험 보유자",
        "education": "대졸",
        "headcount": "",
        "salary": "연 3,600만원이상"
      },
      {
        "role": "PM",
        "qualification": "- 기계·조선·산업공학 등 관련 전공자로 프로젝트 일정· 원가·납기 관리 및 대내외 협업에 관심이 있는 자\n- 조선·플랜트 프로젝트 경험, 영어 커뮤니케이션 능력 및 고객·협력사 대응 역량 보유자",
        "education": "대졸",
        "headcount": "",
        "salary": "연 3,600만원이상"
      },
      {
        "role": "압축기/펌프 개발",
        "qualification": "- 기계공학 등 관련 전공자로 기계요소·재료역학 및 기계설계에 대한 기본 지식을 보유한 자\n- AutoCAD·SolidWorks 등 2D/3D CAD 활용 경험, 기계요소 설계 및 도면 작성 능력\n- 압력, 유량, 온도 등 기본적인 유체/열역할 지식이 있는자 - 수소압축기, 밸브, 레귤레이터 이해 및 개발 경력 등",
        "education": "대졸/석사",
        "headcount": "",
        "salary": "연 3,600만원이상(석사의 경우 별도 협의)"
      },
      {
        "role": "기기, 시스템설계",
        "qualification": "- 화학공학·기계공학·조선공학 등 관련 전공자로 열역학· 유체역학 및 공정설계에 대한 기본 지식을 보유한 자\n- AutoCAD·SolidWorks 등 2D/3D CAD 활용 경험, 열교환기·회전기기 및 ASME·API 등 관련 규격 이해 보유자\n- LNG·암모니아 등 친환경 연료공급시스템 이해, P&ID/PFD·Hydraulic Calculation·Aspen HYSYS 등 활용 경험",
        "education": "대졸",
        "headcount": "",
        "salary": "연 3,600만원이상"
      },
      {
        "role": "HR",
        "qualification": "- 전공 무관, 교육·육성·채용·온보딩 등 HR 업무에 관심이 높고 문서작성 및 커뮤니케이션 역량을 보유한 자\n- 교육·프로젝트 기획·운영 경험, ChatGPT·Gemini· Claude 등 생성형 AI를 활용한 자료분석·콘텐츠 제작· 업무개선 경험 보유자",
        "education": "대졸",
        "headcount": "",
        "salary": "연 3,600만원이상"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산광역시 강서구 녹산산단"
      },
      {
        "label": "고용형태",
        "value": "신입(인턴 후 정규직 전환)"
      },
      {
        "label": "근무형태",
        "value": "주간근무"
      },
      {
        "label": "근무시간",
        "value": "08:00~17:00"
      },
      {
        "label": "복리후생",
        "value": "4대보험, 퇴직금, 성과금 외 채용공고 참고"
      },
      {
        "label": "제출서류",
        "value": "이력서/자기소개서"
      },
      {
        "label": "추가사항",
        "value": "26년 10월 공개 채용 시작"
      }
    ]
  },
  {
    "id": "b16",
    "boothNo": "16",
    "code": "A16",
    "name": "조광요턴(주)",
    "category": "중견기업",
    "industry": "일반용 도료 및 관련제품 제조업",
    "homepage": "https://www.jotun.com/kr",
    "intro": "조광요턴(주)은 1988년 조광페인트와 노르웨이 Jotun A/S사가 공동으로 출자하여 설립된 회사로 국내굴지의 대형조선소를 비롯한 FPSO, 드릴쉽, 석유시추선 등의 해양 플랜트 분야와 발전소, 교량, 석유화학 등의 플랜트 산업에 선박도료와 중방식도료를 공급하고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "마틴 입센, 홍민규"
      },
      {
        "label": "직원수",
        "value": "약 370명"
      },
      {
        "label": "주소",
        "value": "부산 강서구 과학산단1로 96"
      },
      {
        "label": "대표전화",
        "value": "051-797-6000"
      },
      {
        "label": "업종",
        "value": "제조업"
      },
      {
        "label": "팩스",
        "value": "051-711-7738"
      }
    ],
    "jobs": [
      {
        "role": "R&D",
        "qualification": "- 화학/도료/화학공학 관련 전공 필수\n- TOEIC 750 혹은 TOEIC SPEAKING 130/OPIC IM3 이상",
        "education": "대졸",
        "headcount": "",
        "salary": "4,200만원"
      },
      {
        "role": "구매",
        "qualification": "- MS-office 사용 우수자\n- TOEIC 750 혹은 TOEIC SPEAKING 130/OPIC IM3 이상",
        "education": "대졸",
        "headcount": "",
        "salary": "4,000만원"
      },
      {
        "role": "기술영업",
        "qualification": "- TOEIC 750 혹은 TOEIC SPEAKING 130/OPIC IM3 이상\n- 차량운전 가능자",
        "education": "대졸",
        "headcount": "",
        "salary": "4,000만원"
      },
      {
        "role": "기술영업",
        "qualification": "- TOEIC 700 혹은 TOEIC SPEAKING 130/OPIC IM3 이상",
        "education": "대졸",
        "headcount": "",
        "salary": "4,000만원"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산 본사 및 각 지역 사무소"
      },
      {
        "label": "고용형태",
        "value": "정규직"
      },
      {
        "label": "근무형태",
        "value": "주 5일제"
      },
      {
        "label": "근무시간",
        "value": "08:00 – 17:00"
      },
      {
        "label": "복리후생",
        "value": "기본 연봉 회 성과급 별도 지급, 유연근무제 실시, 사내식당 운영, 하계 휴가 및 하계 휴가비 100만원 지급, 명절 귀향비 지급, 정기 건강검진 지원, 상해실비보험 가입, 노르웨이 Jotun 본사 주관 Global Academy 교육 지원, 개인 직무교육 및 계층교육 지원*영업직의 경우 개인차량(신차) 지급, 유류비 및 통행료 전액지원, 별도 인센티브 및 일비 지급"
      },
      {
        "label": "제출서류",
        "value": "자사 양식의 입사지원서 및 자기소개서, 졸업 및 성적증명서, 자격증 사본"
      },
      {
        "label": "추가사항",
        "value": "AI 활용 우수자"
      }
    ]
  },
  {
    "id": "b17",
    "boothNo": "17",
    "code": "A17",
    "name": "창신INC",
    "category": "중견기업",
    "industry": "신발 도매업",
    "altName": "(주)창신INC",
    "homepage": "https://www.changshininc.com",
    "intro": "창신INC(Changshin Inc.) 는 1981년 설립된 글로벌 신발 제조 전문기업으로, 세계적인 스포츠 브랜드 Nike의 주요 전략적 파트너로서 다양한 혁신적인 신발 제품을 개발·생산하고 있습니다.한국 본사를 중심으로 베트남, 인도네시아, 중국 등 글로벌 생산 네트워크를 운영하고 있으며, 축적된 신발 개발·제조 역량과 기술 혁신을 기반으로 글로벌 시장에서 경쟁력을 강화하고 있습니다.창신INC는 단순한 신발 제조를 넘어 혁신적인 기술과 제조 경쟁력을 통해 고객과 함께 성장하는 글로벌 기업을 지향하고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "남충일"
      },
      {
        "label": "직원수",
        "value": "1,250명"
      },
      {
        "label": "주소",
        "value": "신발 제조업"
      },
      {
        "label": "대표전화",
        "value": "051-960-8800"
      },
      {
        "label": "업종",
        "value": "서비스 (인력공급업)"
      },
      {
        "label": "팩스",
        "value": "051-961-9229"
      }
    ],
    "jobs": [
      {
        "role": "TD(신발개발)",
        "qualification": "영어 활용 능력 우수자커뮤니케이션 능력 우수자",
        "education": "대졸",
        "headcount": "",
        "salary": "4,000만원"
      },
      {
        "role": "PE(갑피개발)",
        "qualification": "제품디자인/설계 가능자",
        "education": "대졸",
        "headcount": "",
        "salary": "4,000만원"
      },
      {
        "role": "TE(바텀개발)",
        "qualification": "기계 관련 전공2D, 3D 설계 Tool 활용 가능자",
        "education": "대졸",
        "headcount": "",
        "salary": "4,000만원"
      },
      {
        "role": "CE(접착, 물성 Test)",
        "qualification": "화학 관련 전공화공, 환경, 위험물 자격증 보유자",
        "education": "대졸",
        "headcount": "",
        "salary": "4,000만원"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산"
      },
      {
        "label": "고용형태",
        "value": "정규직"
      },
      {
        "label": "근무시간",
        "value": "07:30 ~ 16:30"
      },
      {
        "label": "복리후생",
        "value": "식사제공, 건강검진, 대중교통비 지원"
      },
      {
        "label": "제출서류",
        "value": "추후 자사 채용 포탈 참조"
      }
    ]
  },
  {
    "id": "b18",
    "boothNo": "18",
    "code": "A18",
    "name": "오스템임플란트(주)",
    "category": "중견기업",
    "industry": "치과용 기기 제조업",
    "homepage": "https://www.osstem.com",
    "intro": "“임플란트 기술을 배우던 나라에서 가르치는 나라로 변화 시키고 오늘날 일상적인 치과 시술로 자리잡기까지.”오스템임플란트는 국내와 글로벌 시장에서 가장 많이 사랑 받는 대한민국 임플란트 기업으로 치과에서 필요한 기자재와 IT 서비스를 아우르는 치과 종합 솔루션 기업으로 도약했습니다.임플란트 수술의 위험 요소를 사전에 인지하고, 종합적이고 체계적인 수술을 계획할 수 있는 ‘디지털 덴티스트리’는 치과계의 주요 화두입니다. 디지털 덴티스트리 환경 구축을 위한 종합 솔루션 제공을 위해 기술력에 대한 열정과 도전으로 끊임없는 연구·개발과 혁신을 이어가겠습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "김해성"
      },
      {
        "label": "직원수",
        "value": "2,500명"
      },
      {
        "label": "주소",
        "value": "부산광역시 해운대구 반송로 513번길 66-16"
      },
      {
        "label": "대표전화",
        "value": "070-4394-8015"
      },
      {
        "label": "업종",
        "value": "제조업"
      },
      {
        "label": "팩스",
        "value": "051-861-4695"
      }
    ],
    "jobs": [
      {
        "role": "CNC가공",
        "qualification": "관련자격증 소지자",
        "education": "무관",
        "headcount": "",
        "salary": "내규"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산광역시 해운대구 반송로 513번길 66-16"
      },
      {
        "label": "고용형태",
        "value": "계약직(1년 근무후 평가를 통한 정규직 전환)"
      },
      {
        "label": "근무형태",
        "value": "주/야간 교대"
      },
      {
        "label": "근무시간",
        "value": "07:30 ~ 16:30"
      },
      {
        "label": "복리후생",
        "value": "명절상여금/휴가비/의료비지원/학자금 지원 등"
      },
      {
        "label": "제출서류",
        "value": "이력서 및 자기소개서"
      }
    ]
  },
  {
    "id": "b19",
    "boothNo": "19",
    "code": "A19",
    "name": "SGS Korea",
    "category": "외국계기업",
    "industry": "물질성분 검사 및 분석업",
    "altName": "한국에스지에스(주)",
    "homepage": "https://www.sgs.com",
    "intro": "SGS는 품질 및 정직성에서 국제표준으로 인정받고 있는 세계 최고의 검사, 검증, 시험 및 인증 기업입니다.",
    "info": [
      {
        "label": "대표자",
        "value": "이인섭"
      },
      {
        "label": "직원수",
        "value": "10만명(한국 1,100명)"
      },
      {
        "label": "주소",
        "value": "서울특별시 용산구 한강대로 257(갈월동, 청룡빌딩 12층)"
      },
      {
        "label": "대표전화",
        "value": "051-630-7086"
      },
      {
        "label": "업종",
        "value": "서비스"
      },
      {
        "label": "팩스",
        "value": "051-630-7096"
      }
    ],
    "jobs": [
      {
        "role": "금속재료시험",
        "qualification": "- 금속재료/ 재료 전공자\n- 관련 자격증 소지자\n- KS Q ISO/IEC 17025 (시험) - 관련 업무 경력 우대",
        "education": "대졸",
        "headcount": "",
        "salary": "회사내규에 따름"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산시 사하구 신산로 29번길 50"
      },
      {
        "label": "고용형태",
        "value": "계약직 1년 (최대2년, 평가 후 정규직 전환)"
      },
      {
        "label": "근무형태",
        "value": "자율출퇴근제 (8시간)"
      },
      {
        "label": "근무시간",
        "value": "09:00 ~ 18:00 (07:00~11:00 출근시간 선택가능)"
      },
      {
        "label": "복리후생",
        "value": "4대보험/퇴직금/성과금/휴가비 등"
      },
      {
        "label": "제출서류",
        "value": "이력서 / 자기소개서"
      }
    ]
  },
  {
    "id": "b20",
    "boothNo": "20",
    "code": "A20",
    "name": "한국선급",
    "category": "기타",
    "industry": "기타 기술 시험, 검사 및 분석업",
    "altName": "(사)한국선급",
    "homepage": "https://www.krs.co.kr",
    "intro": "한국선급은 선급규칙과 국제협약에 따라 생명과 재산 및 환경을 보호하는 조선 및 해양분야에서 세계를 선도하는 종합적 기술 지원자입니다.1960년 설립되어 1988년 국제선급연합회(IACS) 정회원이 된 KR은 현재 부산에 위치한 본사를 비롯, 국내외 지부 및 사무소에서 전세계 고객들에게 최상의 서비스를 제공하고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "이영석"
      },
      {
        "label": "직원수",
        "value": "1,043명"
      },
      {
        "label": "주소",
        "value": "부산광역시 강서구 명지오션시티9로 36"
      },
      {
        "label": "대표전화",
        "value": "1566-1682"
      },
      {
        "label": "업종",
        "value": "선박검사"
      },
      {
        "label": "팩스",
        "value": "070-8799-8644"
      }
    ],
    "hiringNote": "올 하반기 채용 예정"
  },
  {
    "id": "b21",
    "boothNo": "21",
    "code": "A21",
    "name": "국립해양측위정보원",
    "category": "국가기관",
    "industry": "위성항법보정시스템(DGNSS), 지상파항법시스템(Loran-C), 측위정보시스템(DGPS) 등 구축 및 운영",
    "altName": "해양수산부 국립해양측위정보원",
    "homepage": "https://www.nmpnt.go.kr",
    "intro": "국립해양측위정보원은 해양수산부 소속기관으로 대한민국 전 해역과 내륙에 정밀한 위치ㆍ항법ㆍ시각(PNT) 정보를 24시간 중단없이 제공하는 기관입니다.전 국민의 해양 안전과 편익을 최우선 가치로 하여, 위성항법보정시스템을 운영하며, 미래 해양 모빌리티 시대를 선도하기 위해 전 직원이 최선을 다하고 있습니다.정확하고 신뢰할 수 있는 위치 정보를 송출하여 선박의 안전 운항과 국가 해양 영토의 안전을 책임지는 기관입니다.",
    "info": [
      {
        "label": "대표자",
        "value": "김정식"
      },
      {
        "label": "직원수",
        "value": "48명"
      },
      {
        "label": "주소",
        "value": "충북 옥천군 옥천읍 동부로 80"
      },
      {
        "label": "대표전화",
        "value": "043-730-8000"
      },
      {
        "label": "업종",
        "value": "중앙행정기관"
      },
      {
        "label": "팩스",
        "value": "043-730-8009"
      }
    ],
    "jobs": [
      {
        "role": "과학기술직군해양수산직렬(해양교통시설직류)",
        "qualification": "- 항로표지ㆍ토목ㆍ무선설비ㆍ전기ㆍ전기공사ㆍ 전자산업기사 이상 자격증 소지자\n- 항로표지ㆍ전기ㆍ전자(구 전자기기) 기능사 자격증 취득 후 관련분야* 2년 이상 경력자 * 관련분야 : 항로표지, 토목, 무선설비, 전기, 전기공사, 전자ㆍ전파산업",
        "education": "무관",
        "headcount": "‘26년/31명(일반 29명, 장애인 2명)",
        "salary": "공무원보수규정에따름"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "충북 옥천군, 경북 포항시, 전남 함평군"
      },
      {
        "label": "고용형태",
        "value": "정규직"
      },
      {
        "label": "근무형태",
        "value": "주간근무"
      },
      {
        "label": "근무시간",
        "value": "주5일(월~금, 09:00~18:00, 주 40시간) * 시차출퇴근제, 유연근무 활용가능** 일부 직원에 한해 3조 3교대(모니터링 업무) 근무"
      },
      {
        "label": "복리후생",
        "value": "국가공무원법, 공무원 보수규정 등 관련 법령에 따름"
      },
      {
        "label": "제출서류",
        "value": "자격증명서, 경력증명서"
      }
    ]
  },
  {
    "id": "b22",
    "boothNo": "22",
    "code": "A22",
    "name": "한국해양수산연수원",
    "category": "공공기관",
    "industry": "선원 교육·훈련, 해양안전 및 수산 전문 교육",
    "homepage": "https://www.seaman.or.kr",
    "intro": "선원 및 해양수산산업 종사자들에 대한 교육훈련과 해기사 등 국가자격검정 등에 관한 업무를 수행함으로써 우수한 해양수산인력을 양성하고 해양수산 강국의 미래를 선도하는 글로벌 해양수산전문 교육기관입니다.",
    "info": [
      {
        "label": "대표자",
        "value": "윤현수"
      },
      {
        "label": "직원수",
        "value": "349명"
      },
      {
        "label": "주소",
        "value": "부산광역시 영도구 해양로 367"
      },
      {
        "label": "대표전화",
        "value": "1899-3600"
      },
      {
        "label": "업종",
        "value": "교육서비스업"
      }
    ],
    "jobs": [
      {
        "role": "교원직",
        "qualification": "채용분야별 상이 (전공학과, 승선경력, 해기사면허 등)",
        "education": "전문 학사이상",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "행정직",
        "qualification": "- (공통)어학성적\n- 채용분야별 상이 (전공학과, 관련경력, 자격증 등)",
        "education": "무관",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "선박직",
        "qualification": "- 채용분야별 상이 (승선경력, 해기사면허 등)",
        "education": "무관",
        "headcount": "",
        "salary": ""
      },
      {
        "role": "공무직",
        "qualification": "채용분야별 상이",
        "education": "무관",
        "headcount": "",
        "salary": ""
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산, 목포 등"
      },
      {
        "label": "고용형태",
        "value": "정규직, 계약직"
      },
      {
        "label": "근무형태",
        "value": "주 5일"
      },
      {
        "label": "근무시간",
        "value": "09:00~18:00"
      },
      {
        "label": "복리후생",
        "value": "선택적 복지포인트, 직장단체보험, 건강검진, 교육훈련비 등 지원"
      },
      {
        "label": "제출서류",
        "value": "이력서, 자기소개서, 졸업증명서, 기타(자격증)"
      }
    ]
  },
  {
    "id": "b23",
    "boothNo": "23",
    "code": "A23",
    "name": "국민연금공단",
    "category": "공기업",
    "industry": "연금업",
    "altName": "국민연금공단 부산지역본부",
    "homepage": "https://www.nps.or.kr",
    "intro": "“신뢰와 열정으로 국민의 행복한 미래를 창조하는 연금복지 전문가”국민연금공단은 고품질의 다양한 연금복지 서비스를 제공하여 국민의 생활안정과 노후행복에 공헌하고 있습니다.세계최고의 연금복지 서비스 기관으로 성장하기 위해 신뢰와 열정으로 국민의 행복한 미래를 창조해나갈 인재를 찾습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "김성주"
      },
      {
        "label": "직원수",
        "value": "7,539명"
      },
      {
        "label": "주소",
        "value": "전북특별자치도 전주시 덕진구 기지로 180 (만성동)"
      },
      {
        "label": "대표전화",
        "value": "1355"
      },
      {
        "label": "업종",
        "value": "연금업"
      },
      {
        "label": "팩스",
        "value": "1600-3750"
      }
    ],
    "jobs": [
      {
        "role": "6급 사무직전국",
        "qualification": "공통 지원자격 외 별도의 응시자격 없음",
        "education": "무관",
        "headcount": "-",
        "salary": "공단 제규정에따름"
      },
      {
        "role": "6급 사무직권역",
        "qualification": "공통 지원자격 외 별도의 응시자격 없음. 다만, 전국이 아닌 본인이 지원한 권역에서 최소 7년 이상 근무 가능한 사람",
        "education": "무관",
        "headcount": "-",
        "salary": "공단 제규정에따름"
      },
      {
        "role": "6급 심사직",
        "qualification": "간호사, 물리치료사, 임상병리사, 작업치료사 면허증 소지자로 면허 취득 이후 관련 업무 1년 이상 경력자** 「의료법」 제3조제2항제3호에 따른 병원급 의료기관의 임상 경력 또는 우리 공단 심사 경력(기초근평 의학적 평가 포함) ※ 경력환산은 365일을 1년으로 산정함",
        "education": "무관",
        "headcount": "-",
        "salary": "공단 제규정에따름"
      },
      {
        "role": "6급 전산직",
        "qualification": "공단에서 정한 전산 관련 자격증 중 하나 이상을 취득한 자",
        "education": "무관",
        "headcount": "-",
        "salary": "공단 제규정에따름"
      },
      {
        "role": "6급 기술직기계",
        "qualification": "건축설비기사, 공조냉동기계기사, 에너지관리기사, 건축기계설비기술사, 공조냉동기계기술사 자격증 중 하나 이상 소지자로, 해당 자격증 취득 이후 관련분야 1년 이상 경력자 ※ 경력환산은 365일을 1년으로 산정함",
        "education": "무관",
        "headcount": "-",
        "salary": "공단 제규정에따름"
      },
      {
        "role": "6급 기술직건축",
        "qualification": "건축기사, 건축시공기술사 자격증 중 하나 이상 소지자로, 해당 자격증 취득 이후 관련분야 1년 이상 경력자 ※ 경력환산은 365일을 1년으로 산정함",
        "education": "무관",
        "headcount": "-",
        "salary": "공단 제규정에따름"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "본부 및 전국 각 지사·센터"
      },
      {
        "label": "고용형태",
        "value": "정규직(시보 3개월 임용 후 근무 성적이 양호한 경우 정규 임용)"
      },
      {
        "label": "근무형태",
        "value": "정규직"
      },
      {
        "label": "근무시간",
        "value": "09:00 ~ 18:00"
      },
      {
        "label": "복리후생",
        "value": "공단 제규정 등에 따름"
      },
      {
        "label": "제출서류",
        "value": "전형 세부일정에 따름"
      },
      {
        "label": "추가사항",
        "value": "자세한 사항은 채용공고문을 참조"
      }
    ]
  },
  {
    "id": "b24",
    "boothNo": "24",
    "code": "A24",
    "name": "한국환경공단",
    "category": "준정부기관",
    "industry": "환경오염 방지, 탄소중립",
    "homepage": "https://www.keco.or.kr",
    "intro": "(기후환경에너지부 산하 준정부기관)한국환경공단은 환경오염방지·환경개선·자원순환 촉진 및 기후위기 대응을 위한 온실가스 감축사업 등 탄소중립 사회로의 이행을 효과적으로 추진함으로써 환경 친화적 국가발전에 이바지",
    "info": [
      {
        "label": "대표자",
        "value": "임상준"
      },
      {
        "label": "직원수",
        "value": "3,271명(2026년 2분기 기준)"
      },
      {
        "label": "주소",
        "value": "(본사) 인천광역시 서해구 환경로 42"
      },
      {
        "label": "대표전화",
        "value": "032-590-4000"
      },
      {
        "label": "업종",
        "value": "환경관련엔지니어링서비스업/환경분야학술 및 기술연구용역"
      }
    ],
    "hiringNote": "한국환경공단 채용공고 (한국환경공단 누리집-열린공간-채용안내)",
    "conditions": [
      {
        "label": "근무지",
        "value": "전국"
      },
      {
        "label": "고용형태",
        "value": "정규직/무기계약직/촉탁직"
      },
      {
        "label": "근무형태",
        "value": "주간근무"
      },
      {
        "label": "근무시간",
        "value": "주5일(09:00~18:00)"
      },
      {
        "label": "복리후생",
        "value": "4대보험, 퇴직금, 복지비, 휴양시설"
      },
      {
        "label": "제출서류",
        "value": "입사지원서, 자격 및 어학증빙 자료 등"
      },
      {
        "label": "추가사항",
        "value": "절차 : 서류전형 - 필기전형 - 면접전형"
      }
    ]
  },
  {
    "id": "b25",
    "boothNo": "25",
    "code": "A25",
    "name": "해양환경공단",
    "category": "공기업",
    "industry": "수도, 하수 및 폐기물 처리, 원료 재생업",
    "homepage": "https://www.koem.or.kr",
    "intro": "해양환경공단 해양환경의 보전, 관리, 개선, 해양오염 방제, 해양환경 교육과 연구개발 등을 통해 우리 삶의 터전인 바다를 보다 깨끗하고 안전하게 그리고 건강하고 풍요롭게 만들기 위해 1997년 설립된 우리나라 유일의 해양환경 전문 공공기관입니다. 해양환경공단은 국민 여러분 모두가 깨끗하고 건강한 바다와 함께 더 나은 삶을 누릴 수 있도록 최선을 다 할 것임을 약속드리며, 국민들에게 신뢰받는 해양환경 전문기관으로서 앞으로도 국민 여러분과 함께 우리 해양의 더 밝은 미래를 만들어 나가겠습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "강용석"
      },
      {
        "label": "직원수",
        "value": "740명"
      },
      {
        "label": "주소",
        "value": "서울특별시 송파구 송파대로28길 28"
      },
      {
        "label": "대표전화",
        "value": "02-3498-8500"
      },
      {
        "label": "업종",
        "value": "공공기관(준시장형 공기업)"
      },
      {
        "label": "팩스",
        "value": "02-3462-7707"
      }
    ],
    "jobs": [
      {
        "role": "일반직 6급(채용형청년인턴)",
        "qualification": "- 채용분야 관련 국가기술자격증(기사 이상)\n- 채용분야 관련 전공자(학과 졸업자)\n- (공통) 토익 점수 기준 700점 이상인 자 ※ 우대사항 : 보훈대상자, 장애인, 저소득층, 북한이탈주민, 다문화가족, 자립준비청년, 공단 경력자",
        "education": "학사 학위 이상",
        "headcount": "",
        "salary": "연 3,900만원"
      },
      {
        "role": "기술직 5급(항해)",
        "qualification": "- 해기사 면허(상선) 항해 4급 이상 소지자로 임용 즉시 승선이 가능한 자 ※ 우대사항 : 보훈대상자, 장애인, 저소득층, 북한이탈주민, 다문화가족, 자립준비청년, 공단 경력자",
        "education": "무관",
        "headcount": "",
        "salary": "연 3,100만원"
      },
      {
        "role": "기술직 5급(기관)",
        "qualification": "- 해기사 면허(상선) 기관 4급 이상 소지자로 임용 즉시 승선이 가능한 자 ※ 우대사항 : 보훈대상자, 장애인, 저소득층, 북한이탈주민, 다문화가족, 자립준비청년, 공단 경력자",
        "education": "무관",
        "headcount": "",
        "salary": "연 3,100만원"
      },
      {
        "role": "기술직 5급(환경)",
        "qualification": "- 1종 대형 운전면허 소지자\n- 국가기술자격증(기능사 이상) 소지자 ※ 우대사항 : 보훈대상자, 장애인, 저소득층, 북한이탈주민, 다문화가족, 자립준비청년, 공단 경력자",
        "education": "무관",
        "headcount": "",
        "salary": "연 3,100만원"
      },
      {
        "role": "별정직 6급",
        "qualification": "- 1종 대형 운전면허 소지자로 대형차량 운전경력 2년 이상인 자\n- 국가기술자격증(기능사 이상) ※ 우대사항 : 보훈대상자, 장애인, 저소득층, 북한이탈주민, 다문화가족, 자립준비청년, 공단 경력자",
        "education": "전문 학사학위 이상",
        "headcount": "",
        "salary": "연 3,900만원"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "본사(서울) 및 전국 14개 소속기관"
      },
      {
        "label": "고용형태",
        "value": "(일반직 6급) 채용형 청년인턴(정규직 전환형), (기술직 5급) 정규직, (별정직 6급) 정규직"
      },
      {
        "label": "근무형태",
        "value": "전일제 ※ 기술직(항해, 기관)의 경우 선박 종류에 따라 교대근무 실시"
      },
      {
        "label": "근무시간",
        "value": "주 40시간"
      },
      {
        "label": "복리후생",
        "value": "4대보험, 퇴직금, 성과금 외 채용공고 참고"
      },
      {
        "label": "제출서류",
        "value": "이력서/자기소개서"
      },
      {
        "label": "추가사항",
        "value": "26년 10월 공개 채용 시작"
      }
    ]
  },
  {
    "id": "b26",
    "boothNo": "26",
    "code": "A26",
    "name": "부산항만공사",
    "category": "공기업",
    "industry": "항구 해상 터미널 운영",
    "homepage": "https://www.busanpa.com",
    "intro": "부산항만공사는 해양수산부 산하 기타공공기관으로 부산항 개발 및 관리·운영의 전문성과 효율성을 높임으로써 부산항을 경쟁력 있는 동북아 해운물류중심기지로 육성하여 국민경제발전에 이바지하기 위해 설립되었습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "송상근"
      },
      {
        "label": "직원수",
        "value": "295명"
      },
      {
        "label": "주소",
        "value": "부산광역시 중구 대교로 122"
      },
      {
        "label": "대표전화",
        "value": "051-999-3000"
      },
      {
        "label": "업종",
        "value": "부동산업"
      },
      {
        "label": "팩스",
        "value": "051-999-3278"
      }
    ],
    "jobs": [
      {
        "role": "정규직(신입) 사무(일반)",
        "qualification": "토익(TOEIC) 700수준 이상, 한국사능력검정시험 3급 이상 합격자",
        "education": "무관",
        "headcount": "",
        "salary": "직원보수규정에 따름"
      },
      {
        "role": "정규직(신입) 사무(고졸)",
        "qualification": "최종학력이 고등학교 졸업 또는 졸업예정인 자(‘25년 교과과정 또는 ’26년 교과과정 이수), 공고마감일 기준 고졸 검정고시 합격일로부터 1년이 경과하지 않은 자",
        "education": "고졸(예정)",
        "headcount": "",
        "salary": "직원보수규정에 따름"
      },
      {
        "role": "정규직(신입) 사무(취업지원)",
        "qualification": "토익(TOEIC) 700수준 이상, 한국사능력검정시험 3급 이상 합격자, 보훈관계법률에 의한 취업지원(보호)대상자",
        "education": "무관",
        "headcount": "",
        "salary": "직원보수규정에 따름"
      },
      {
        "role": "정규직(신입) 기술(토목)",
        "qualification": "토익(TOEIC) 700수준 이상, 한국사능력검정시험 3급 이상 합격자, 토목산업기사 이상 자격증 소지자",
        "education": "무관",
        "headcount": "",
        "salary": "직원보수규정에 따름"
      },
      {
        "role": "정규직(신입)기술(건축)",
        "qualification": "토익 700수준 이상, 한국사능력검정시험 3급 이상 합격자, 건축산업기사 이상 자격증 소지자",
        "education": "무관",
        "headcount": "",
        "salary": "직원보수규정에 따름"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "부산 소재 본사 및 지사·사업소 / 해외사업소"
      },
      {
        "label": "고용형태",
        "value": "정규직(수습기간 3개월)"
      },
      {
        "label": "근무형태",
        "value": "상근직"
      },
      {
        "label": "근무시간",
        "value": "주 5일, 주 40시간 근무"
      },
      {
        "label": "복리후생",
        "value": "4대 보험 가입, 근무복 지급, 자기개발 지원 등"
      },
      {
        "label": "제출서류",
        "value": "온라인 입사지원(채용 공고 확인)"
      },
      {
        "label": "추가사항",
        "value": "자세한 내용은 채용공고를 확인하여 주시기 바랍니다."
      }
    ]
  },
  {
    "id": "b27",
    "boothNo": "27,31",
    "code": "A27",
    "name": "HD현대중공업",
    "category": "대기업",
    "industry": "기타 선박 제조업",
    "altName": "HD현대중공업(주)",
    "homepage": "https://www.hd-hhi.com",
    "intro": "[세계 조선업을 이끄는 혁신의 중심, HD현대중공업]HD현대중공업은1972년 설립돼10년 만에 세계1위 조선소로 성장, 대한민국을 세계적인 조선강국으로 이끌었습니다. 이후 세계 최대 규모의 조선소를 운영하며 선박 건조, 해양에너지, 엔진기계 분야에서 업계를 선도하고 있습니다. 또한, 지속적인 기술 혁신과 친환경·디지털 솔루션 개발을 통해 미래 해양 산업의 변화를 주도하고 있습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "이상균, 금석호"
      },
      {
        "label": "직원수",
        "value": "약 1만8천여명"
      },
      {
        "label": "주소",
        "value": "울산광역시 동구 방어진순환도로1000"
      },
      {
        "label": "대표전화",
        "value": "052-202-2114"
      },
      {
        "label": "업종",
        "value": "조선업"
      }
    ],
    "hiringNote": "공고문 참조",
    "conditions": [
      {
        "label": "근무지",
        "value": "울산본사/분당(GRC)"
      },
      {
        "label": "고용형태",
        "value": "정규직"
      },
      {
        "label": "근무시간",
        "value": "08:00-17:00"
      },
      {
        "label": "복리후생",
        "value": "4대보험 / 퇴직금 / 연말성과금 / 각종공모전"
      },
      {
        "label": "제출서류",
        "value": "HD현대 채용 홈페이지 통해 지원서 작성"
      },
      {
        "label": "추가사항",
        "value": "https://recruit.hd.com/kr/mainLayout/applyDetail/264514 (채용공고)"
      }
    ]
  },
  {
    "id": "b28",
    "boothNo": "28",
    "code": "A28",
    "name": "(주)케이조선",
    "category": "중견기업",
    "industry": "강선 건조업",
    "homepage": "https://www.kshipbuilding.com",
    "intro": "(주)케이조선은 1967년 창립 이래 끊임없는 도전과 혁신으로 세계조선시장을 선도해왔습니다.풍부한 건조 경험과 다양한 기술력을 바탕으로 중형 조선시장의 선두주자로 발돋움하고 있으며, 지속적인 연구개발을 통해 친환경 선박과 미래 선종에 대한 개발로 시대의 흐름을 선도하는 친환경 스마트 조선소로 거듭나겠습니다.",
    "info": [
      {
        "label": "대표자",
        "value": "김 찬"
      },
      {
        "label": "직원수",
        "value": "964명"
      },
      {
        "label": "주소",
        "value": "경상남도 창원시 진해구 명제로 60"
      },
      {
        "label": "대표전화",
        "value": "055-548-1122"
      },
      {
        "label": "업종",
        "value": "상선 건조"
      },
      {
        "label": "팩스",
        "value": "055-546-7928"
      }
    ],
    "jobs": [
      {
        "role": "설계부문",
        "qualification": "모집 직무 관련 학과영어 및 컴퓨터 활용 우수자",
        "education": "학사",
        "headcount": "미정",
        "salary": "내규에 따름"
      },
      {
        "role": "생산부문",
        "qualification": "모집 직무 관련 학과 및 자격증 보유자",
        "education": "학사",
        "headcount": "미정",
        "salary": "내규에 따름"
      },
      {
        "role": "영업부문",
        "qualification": "모집 직무 관련 학과 및 자격증 보유자영어 및 컴퓨터 활용 우수자",
        "education": "학사",
        "headcount": "미정",
        "salary": "내규에 따름"
      },
      {
        "role": "경영부문",
        "qualification": "모집 직무 관련 학과 및 자격증 보유자영어회화 및 컴퓨터 활용 우수자",
        "education": "학사",
        "headcount": "미정",
        "salary": "내규에 따름"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "경상남도 창원시 진해구"
      },
      {
        "label": "고용형태",
        "value": "정규직"
      },
      {
        "label": "근무형태",
        "value": "주 40시간"
      },
      {
        "label": "근무시간",
        "value": "08:00 ~ 17:00"
      },
      {
        "label": "복리후생",
        "value": "경조사 / 자녀학자금 / 통근버스 / 복지카드 / 교육비 지원 등"
      },
      {
        "label": "제출서류",
        "value": "입사지원서"
      },
      {
        "label": "추가사항",
        "value": "모집공고 상시 확인 필요"
      }
    ]
  },
  {
    "id": "b29",
    "boothNo": "29",
    "code": "A29",
    "name": "삼성중공업",
    "category": "대기업",
    "industry": "강선 건조업",
    "altName": "삼성중공업(주)",
    "homepage": "https://www.samsungshi.com",
    "intro": "삼성중공업은 글로벌 선사 및 오일 메이저의 니즈에 맞춘 선박과 해양설비를 제공하는 조선/해양산업 전문회사입니다. 또한 지속적인 연구/개발을 통해 자율운항,친환경기술을 개발하여 제품에 적용하고, 생산시스템의 스마트화를 지향하며 세계 시장을 선도하고 있습니다.",
    "info": [
      {
        "label": "주소",
        "value": "경기도 성남시 분당구 판교로 227번길23"
      },
      {
        "label": "대표전화",
        "value": "055-603-3247"
      },
      {
        "label": "업종",
        "value": "중공업"
      }
    ],
    "hiringNote": "공개불가",
    "conditions": [
      {
        "label": "근무지",
        "value": "거제, 판교, 대덕, 부산, 평택"
      },
      {
        "label": "고용형태",
        "value": "대졸신입"
      },
      {
        "label": "근무형태",
        "value": "정규직"
      },
      {
        "label": "근무시간",
        "value": "08:00 ~ 17:00"
      }
    ]
  },
  {
    "id": "b30",
    "boothNo": "30",
    "code": "A30",
    "name": "삼성전기",
    "category": "대기업",
    "industry": "그 외 기타 전자부품 제조업",
    "altName": "삼성전기(주)",
    "homepage": "https://www.samsungsem.com",
    "intro": "세계적인 종합부품 제조회사",
    "info": [
      {
        "label": "대표자",
        "value": "장덕현"
      },
      {
        "label": "직원수",
        "value": "약 13,000명 (국내)"
      },
      {
        "label": "주소",
        "value": "경기도 수원시 영통구 매영로 150"
      },
      {
        "label": "업종",
        "value": "전기전자"
      }
    ],
    "jobs": [
      {
        "role": "연구/개발",
        "qualification": "컴퓨터 전공 / 경력 2년 이상",
        "education": "대졸",
        "headcount": "",
        "salary": "협의"
      },
      {
        "role": "연구/개발",
        "qualification": "재료공학, 화학, 전기전자 전공",
        "education": "대졸",
        "headcount": "",
        "salary": "협의"
      }
    ],
    "conditions": [
      {
        "label": "근무지",
        "value": "수원, 세종, 부산 (협의)"
      },
      {
        "label": "고용형태",
        "value": "정규직 (연봉제)"
      },
      {
        "label": "근무형태",
        "value": "주간 근무"
      },
      {
        "label": "근무시간",
        "value": "선택근로제 (일 8시간)"
      },
      {
        "label": "복리후생",
        "value": "복지포인트, 근속휴가, 육아휴직 등"
      },
      {
        "label": "제출서류",
        "value": "이력서, 자기소개서, 학력증명서 등"
      }
    ]
  }
];
