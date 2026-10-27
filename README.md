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
| `/kdu` | **2026학년도 경동대학교 Fun Fun Job Festival** 메인 (포스터 시안 기준, 별도 머리글 · 바닥글) |
| `/kdu/future-card` | 경동대용 미래 명함 만들기 — 명함에 `KDU` 표기, 경동대용 회사 · 직무 · 한마디 |

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

**QR 받기 설정 (최초 1회, 완료됨 — `jobfestival-blob`)**: Vercel 대시보드 → **Storage → Create → Blob (Private)** 으로 저장소를 만들고 이 프로젝트에 연결하면
`BLOB_READ_WRITE_TOKEN`(또는 `BLOB_STORE_ID`) 환경변수가 자동으로 추가됩니다. 연결 뒤 새로 배포해야 켜집니다. (설정 전에는 QR 버튼이 안내 문구를 띄웁니다)

부스 운영 팁: 한 분이 끝나면 **‘다음 분 시작하기’** 를 눌러 사진과 입력을 지웁니다.

### 5) 경동대 Fun Fun Job Festival (`/kdu`)

행사 정보는 **`src/lib/kdu.ts`**, 마스코트 · 포스터 이미지는 `public/kdu/` 에 있습니다.
KMOU 페이지는 `src/app/(kmou)/`, 경동대 페이지는 `src/app/kdu/` 로 나뉘어 머리글 · 바닥글이 따로 적용됩니다. (주소는 그대로)

### 6) 배포

`main` 브랜치에 푸시하면 Vercel이 자동으로 빌드·배포합니다.

---

## 기술 스택

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · 전체 정적 생성(SSG)
