# 2026 국립한국해양대학교(KMOU) 취업박람회

**jobfestival.co.kr** — 박람회 안내 · 참여기업 소개 홈페이지.

| 항목 | 내용 |
|------|------|
| 행사명 | 2026 국립한국해양대학교(KMOU) 취업박람회 |
| 일시 | 2026. 9. 10. (목) 10:00 ~ 17:00 |
| 장소 | 도서관 신관 1층 및 4층 라이브러리홀 |
| 주최/주관 | 국립한국해양대학교 학생처 학생성장지원실 |
| 후원/협찬 | 고용노동부 부산지방고용노동청 · 영도구청 · 부산경제진흥원 · 한국TOEIC위원회 |

---

## 화면 구성

| 경로 | 설명 |
|------|------|
| `/` | 메인 — **포스터(클릭 시 참여기업 목록으로 이동)**, 행사 개요, 프로그램 요약 |
| `/companies` | 참여기업 목록 — 기업분류 탭 + 검색 |
| `/companies/[id]` | 기업 상세 — 부스번호·분류·업종, 채용설명회/멘토링 연계, 이전·다음 기업 |
| `/program` | 행사 프로그램 — 채용설명회 시간표, 동문 멘토, 부대 이벤트 |
| `/future-card` | 부스 이벤트 **미래 명함 만들기** — 사진 촬영 → 얼굴 스타일 10종 → 명함 내용 → 디자인 6종 → PNG 저장 · 인쇄 |
| `/fun` | **부대행사 사이트** — 이벤트 8가지를 각각 독립된 주소로 (`/fun/future-card` · `tarot` · `palm` · `four-cut` · `id-photo` · `intro` · `animal` · `job-type`) |
| `/fun/r` · `/fun/v` | 부대행사 결과 이미지 · 자기소개 영상을 QR 로 받는 페이지 |
| `/kdu` | **2026학년도 경동대학교 Fun Fun Job Festival** 메인 (포스터 시안 기준, 별도 머리글 · 바닥글) |
| `/kdu/future-card` | 경동대용 미래 명함 만들기 — 명함에 `KDU` 표기, 경동대용 회사 · 직무 · 한마디 |
| `/host` | **행사 운영 시스템** (담당자) — 행사 만들기 · 관리 화면 · 스캐너 · 현장등록 · 결과보고서 |
| `/e/[행사코드]` · `/t/[티켓]` | 참가자 사전등록 · 휴대폰 입장 QR 티켓 (퇴장 전 설문) |

행사 안내 페이지는 **정적 데이터로만 동작**합니다. 미래 명함의 ‘휴대폰으로 받기(QR)’만 Vercel Blob 저장소를 씁니다 (아래 4번).

## 빠른 시작

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
```

---

## 내용 수정 방법

### 1) 포스터 이미지 교체

`public/` 폴더에 **`poster.jpg`** (또는 `poster.png` / `poster.webp`) 파일을 넣으면
메인 화면 포스터가 실제 이미지로 자동 교체됩니다. 파일이 없으면 코드로 그린 포스터가 표시됩니다.

### 2) 행사 정보 · 프로그램

**`src/lib/expo.ts`** 에서 관리합니다.

| 상수 | 내용 |
|------|------|
| `EXPO` | 행사명, 일시, 장소, 주최, 후원 |
| `SESSIONS` | 채용설명회 시간표 |
| `MENTORS` | 현직자 동문선배 멘토 |
| `EVENTS` | 부대 이벤트 |

### 3) 참여기업

**`src/lib/companies.ts`** 에서 관리합니다. (참가기업 웹북 PDF 기준)

| 필드 | 출처 · 설명 |
|------|------|
| `name` · `homepage` · `intro` · `info` · `jobs` · `conditions` | 웹북 |
| `boothNo` · `category` · `industry` | 기업섭외현황 명단 |
| `altName` | 명단 표기가 웹북과 다를 때만 (검색에 함께 사용) |
| `hiringNote` | 채용 표 대신 안내 문구만 있는 경우 |

선택 항목(`intro`, `jobs`, `conditions` 등)은 **비워두면 화면에서 자동으로 숨겨집니다.**
채용설명회·동문 멘토는 **기업명이 일치하면 상세 페이지에 자동으로 연결**됩니다.

### 4) 미래 명함 만들기 (`/future-card`, `/kdu/future-card`)

부스에서 태블릿 · 노트북으로 진행하는 이벤트입니다. 사진은 **기기 안에서** 처리됩니다.
(카메라는 https 주소 또는 localhost 에서만 켜집니다)

- **배경 제거 · 얼굴 위치**: Google MediaPipe 모델(`public/models/*.tflite`)을 브라우저에서 실행합니다.
  실행 파일(wasm, 약 23MB)은 `npm run dev` · `npm run build` 때 `scripts/copy-mediapipe.mjs` 가 `public/mediapipe/` 로 복사합니다 (저장소에는 없음).
- **얼굴 스타일**: 필터 12종 × 소품 12종. 소품은 찾은 얼굴 위치에 맞춰 그려지고 ▲▼ · ＋－ 로 조정합니다.
- **휴대폰으로 받기 (QR)**: 완성 명함(JPEG)을 `/api/card` 로 Vercel Blob **비공개** 저장소에 올리고 QR 을 보여 줍니다. 이미지는 `/api/card/[id]` 로만 보여 줍니다.
  QR 을 찍으면 `/kdu/card` 에서 저장 · 공유할 수 있으며, 3일 지난 이미지는 매일 `/api/card/cleanup` 크론이 지웁니다.
  경동대 버전은 완성 화면에 이미지 저장 · 인쇄 없이 QR 받기만 있습니다 (KMOU 버전은 저장 · 인쇄).

| 파일 | 내용 |
|------|------|
| `src/lib/future-card/vision.ts` | 배경 제거 · 얼굴 위치 찾기 |
| `src/lib/future-card/faces.ts` | 필터 12종 · 소품 12종 |
| `src/lib/future-card/cards-kdu.ts` | 경동대 명함 디자인 10종 |
| `src/lib/future-card/cards-kmou.ts` | KMOU 명함 디자인 6종 |
| `src/lib/future-card/draw.ts` | 명함 그리기 도우미 (글자 · 도형 · 사람 · 장식) |
| `src/lib/future-card/brand.ts` | 행사별 설정 — 학교 약칭, 회사 목록, 디자인 목록, QR 받기 여부 |
| `src/lib/future-card/share.ts` | QR 받기 (업로드 · 받기 주소) |
| `src/components/future-card/` | 단계별 화면 (두 행사가 함께 사용) |
| `src/lib/future-card/vision.ts` 의 손 · 얼굴 윤곽 모델 | 부대행사 손금 · 동물상이 함께 사용 |

**QR 받기 설정 (최초 1회, 완료됨 — `jobfestival-blob`)**: Vercel 대시보드 → **Storage → Create → Blob (Private)** 으로 저장소를 만들고 이 프로젝트에 연결하면
`BLOB_READ_WRITE_TOKEN`(또는 `BLOB_STORE_ID`) 환경변수가 자동으로 추가됩니다. 연결 뒤 새로 배포해야 켜집니다. (설정 전에는 QR 버튼이 안내 문구를 띄웁니다)

부스 운영 팁: 한 분이 끝나면 **‘다음 분 시작하기’** 를 눌러 사진과 입력을 지웁니다.

### 5) 경동대 Fun Fun Job Festival (`/kdu`)

행사 정보는 **`src/lib/kdu.ts`**, 마스코트 · 포스터 이미지는 `public/kdu/` 에 있습니다.
KMOU 페이지는 `src/app/(kmou)/`, 경동대 페이지는 `src/app/kdu/` 로 나뉘어 머리글 · 바닥글이 따로 적용됩니다. (주소는 그대로)

### 6) 부대행사 사이트 (`/fun`)

태블릿 한 대에 이벤트 하나씩 띄워 운영합니다. 결과는 모두 **QR 로 휴대폰에 받기**(위 4번의 Blob 저장소 사용).
학교 · 행사 이름은 **`src/lib/fun/config.ts`**, 색은 `tailwind.config.ts` 의 `kdu` 에서 바꿉니다.

| 이벤트 | 주소 | 방식 · 파일 |
|------|------|------|
| 미래 명함 | `/fun/future-card` | 위 4번과 같음 + 소품 24가지 + **Gemini AI 스타일 10가지** — `src/lib/fun/ai-image.ts` |
| 취업 타로 | `/fun/tarot` | 1909년 원본(공개 저작물) 78장 · 역방향 · 카드별 풀이 + **Claude 종합 풀이** — `src/lib/fun/tarot.ts` |
| 취업 손금 | `/fun/palm` | 손 마디 인식 → **사진에서 실제 주름 찾기** (카메라 · 평판 스캐너) — `src/lib/fun/palm-crease.ts` |
| 펀펀 네컷 | `/fun/four-cut` | 4컷 연속 촬영 · 배경 · 프레임 · 필터 · **스티커 꾸미기** — `src/lib/fun/stickers.ts` |
| 이력서 사진 | `/fun/id-photo` | 배경 제거 + 그림 정장 / 실사 정장 템플릿(`public/fun/suits/README.md`) / **Gemini AI 실사 정장** · 3:4 |
| 1분 자기소개 | `/fun/intro` | **Claude 가 대본 작성** → 프롬프터 보며 녹화 → 영상 QR — `src/app/api/fun/intro-script` |
| 동물상 테스트 | `/fun/animal` | 얼굴 윤곽 비율 → 6가지 동물상 — `src/lib/fun/animal.ts` |
| 직무 유형 테스트 | `/fun/job-type` | 홀랜드 6유형 12문항 — `src/lib/fun/job-type.ts` |

**1분 자기소개 AI 대본 설정**: Vercel 환경변수에 **`ANTHROPIC_API_KEY`** 를 넣으면 Claude(`claude-opus-5-5`)가 대본을 씁니다.
키가 없거나 오류가 나면 미리 만든 문장 틀로 대본을 만들어 부스 운영은 멈추지 않습니다.
영상은 브라우저에서 저장소로 바로 올라가며(`/api/fun/video`), 3일 뒤 자동 삭제됩니다.
타로 종합 풀이도 같은 키를 씁니다 (없으면 미리 만든 풀이).

**AI 이미지 설정 (Google Gemini)**: Vercel 환경변수에 **`GEMINI_API_KEY`** 를 넣으면 미래 명함 "AI 스타일" 과 이력서 사진 "AI 실사 정장" 버튼이 나타납니다.
모델은 기본 `gemini-2.5-flash-image`, 바꾸려면 `GEMINI_IMAGE_MODEL`. 사진은 Google 로 전송되며 이 사이트에는 저장하지 않습니다.
프롬프트는 서버의 정해진 목록에서만 만들며, Google AI Studio 에서 **사용 한도(예산)** 를 꼭 걸어 두세요.

**손금 스캐너**: 평판 스캐너로 손바닥을 컬러 300dpi 로 스캔(덮개 대신 어두운 천) → "스캐너 · 사진 파일로 올리기". 사진을 자르지 않고 넣어 1440px 로 분석합니다.

### 7) 행사 운영 — 등록 → 입장 → 퇴장 (`/host`)

담당자가 행사를 직접 만들고, 참가자는 사전등록 → 휴대폰 QR 로 입장 → 퇴장 전 설문 → 퇴장, 끝나면 결과보고서를 받습니다.

| 누가 | 화면 | 하는 일 |
|------|------|------|
| 담당자 | `/host` | 개설 코드로 새 행사 만들기 → 행사 코드 · 관리자 PIN · 스태프 PIN 발급 |
| 담당자 | `/host/[코드]` | 실시간 현황 (등록 · 입장 · 안 · 퇴장 · 설문 · 머문 시간), 시간대 그래프, 등록 링크 · QR 포스터, 명단 CSV, PIN 재발급 |
| 담당자 | `/host/[코드]/report` | 결과보고서 (A4 인쇄 · PDF) — 참여 현황 · 시간대별 · 참가자 구성 · 만족도 · 의견 |
| 스태프 | `/host/[코드]/scan` | 입장 / 퇴장 스캐너 — 카메라 QR · USB 바코드 스캐너 · 이름/번호 뒷자리 수동 처리, 중복 경고 · 소리 |
| 스태프 | `/host/[코드]/onsite` | 현장 등록 (등록하면 바로 입장, 화면 QR 로 티켓 전달, 30초 뒤 초기화) |
| 참가자 | `/e/[코드]` → `/t/[티켓]` | 사전등록 → 입장 QR → (입장 후) 만족도 설문 → 퇴장 QR. 스캔되면 화면이 저절로 바뀜 |

**설정 (Vercel 환경변수)**

1. **Storage → Create Database → Neon (Postgres)** 를 프로젝트에 연결하면 `DATABASE_URL` 이 자동으로 들어갑니다. 표는 처음 쓸 때 자동으로 만들어집니다.
2. `EVENT_CREATE_CODE` — 새 행사를 만들 때 넣는 **개설 코드** (담당자에게만 알려 주는 비밀번호). 없으면 행사를 만들 수 없습니다.
3. `EVENT_SECRET` — 로그인 쿠키 서명용 긴 임의 문자열 (없으면 DATABASE_URL 로 대신).
4. 다시 배포 (Redeploy).

개인정보: 동의를 받은 항목만 저장하고, 행사 종료 후 정한 기간(기본 30일)이 지나면 매일 크론(`/api/ev/cleanup`)이 이름 · 연락처 · 학번 · 이메일을 지웁니다 (통계 · 설문 점수 · 학교/학과/학년은 남음).
코드: `src/lib/ev/` (DB · 인증 · 기능), `src/app/(ev)/` (화면), `src/app/api/ev/` (API).

### 8) 배포

`main` 브랜치에 푸시하면 Vercel이 자동으로 빌드·배포합니다.

---

## 기술 스택

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · 전체 정적 생성(SSG)
