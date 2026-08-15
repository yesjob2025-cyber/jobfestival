# 2026 김해 JOB FESTIVAL

**jobfestival.co.kr** — 공식 홈페이지 + 현장 이용 플랫폼.
행사 안내부터 입사지원·현장 면접, 입장 QR·부스 체크인·스탬프·만족도까지 한 사이트에서 처리합니다.

| 항목 | 내용 |
|------|------|
| 사업명 | 2026 김해 JOB FESTIVAL |
| 일시 | 2026년 9월 10일(목) 10:00 ~ 17:00 |
| 구성 | 기업관 / 직무관 / 홍보관 / 부대행사 |
| 주최 | 김해시 · 인제대 · 가야대 · 영산대 · 김해대 |

---

## 빠른 시작

```bash
npm install
cp .env.example .env.local   # 값이 없어도 기본값으로 구동됩니다
npm run dev                  # http://localhost:3000
```

외부 서비스(Supabase) 없이 **바로 실행**됩니다. 데이터는 로컬 JSON 스토어(`.data/db.json`)에
저장되고, 부스 시드 데이터(기업 12 · 직무 13 · 기관 10 · 부대행사 10)가 자동 생성됩니다.

| 기본 계정 | 값 |
|-----------|-----|
| 부스 운영자 PIN | `2026` (`FEST_STAFF_PIN`) |
| 운영 관리자 비밀번호 | `kimhae2026!` (`FEST_ADMIN_PASSWORD`) |

```bash
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 실행
npm run reset-db   # 로컬 데이터 초기화(다음 실행 시 시드 재생성)
```

---

## 화면 구성

| 경로 | 설명 |
|------|------|
| `/` | 메인 — 4개 관 소개, 참여 코스, 현장 이용 흐름, 참가기업 미리보기 |
| `/about` | 행사안내 — 개요, 행사장 구성, 당일 운영 시간표 |
| `/companies` · `/companies/[id]` | **기업관** 전체 리스트(검색·산업·고용형태·현장면접 필터) → 기업 상세(모집직무·복리후생·면접 시간표) |
| `/companies/[id]/apply` | **입사지원** — 직무 선택 + 지원서 제출 |
| `/jobs` · `/jobs/[id]` | **직무관** 전체 리스트(계열 탭·검색) → 직무 상세(업무·역량·자격·커리어 경로·채용 중인 기업) |
| `/promos` | **홍보관** 참여 기관 전체 리스트(제공 서비스·지원 대상) |
| `/events` | **부대행사** 전체 프로그램(운영시간·정원·예약 여부) |
| `/guide` | 참여방법 — JOB/Career 코스, 사전 매칭, QR 흐름, 스탬프 이벤트, FAQ |
| `/register` | 사전등록 → 입장 QR 즉시 발급 |
| `/pass` | **내 입장권** — QR·확인코드, 자동 추천 부스, 스탬프 현황, 지원 현황·면접 시간 선택, 참여 이력 |
| `/pass/find` · `/pass/survey` · `/pass/done` | 입장권 찾기 / 만족도 설문 / 참여 마무리 |
| `/p/[token]` | QR 스캔 시 열리는 참가자 확인 페이지 (부스 운영자용) |
| `/staff` · `/staff/scan` | **부스 운영자** 로그인(부스 선택 + PIN) → 카메라 QR 스캔 / 코드 입력 체크인 |
| `/admin` · `/admin/login` | 운영 대시보드 — 등록·입장·체크인·지원·면접·만족도 집계, CSV 내보내기 |

---

## 입퇴장 · 참여 체크 흐름

```
사전등록(관심 직무 · 코스 선택)
   → 입장 QR + 6자리 확인 코드 발급
   → 입장 게이트 체크인(enteredAt 기록)
   → 관심사 기반 부스 자동 추천 (사전 매칭)
   → 부스별 체크인 (관별 스탬프 적립, 같은 부스 중복은 1건만 기록)
   → 4개 관 완주 시 완주 코드 발급 → 종합안내부스에서 경품 지급 처리
   → 만족도 설문 → 참여 마무리 요약
```

- QR 내용은 `https://jobfestival.co.kr/p/<token>` **절대 URL** 이라 어떤 QR 앱으로 찍어도 열립니다.
  부스 기기가 로그인되어 있으면 그 화면에서 바로 체크인됩니다.
- `/staff/scan` 은 브라우저 `BarcodeDetector` 지원 시 카메라 연속 스캔, 미지원 시 6자리 코드
  직접 입력으로 동작합니다.
- 입사지원 후 마이페이지에서 기업별 30분 단위 면접 슬롯을 선택합니다. (정원·동일 시간 중복 검증)

---

## 아키텍처

```
src/
  app/                    # Next.js App Router (페이지 + 서버 액션)
    actions.ts            # 등록/지원/면접/체크인/설문/관리자 서버 액션
    api/qr                # 입장 QR (SVG) 생성
    api/export            # 운영자 CSV 내보내기
    api/seed              # Supabase 부스 데이터 시드 (secret 보호)
  components/             # 헤더 · 푸터 · 페이지 히어로
  lib/
    config.ts             # 행사 정보 · 관 구성 · 코스 · 스탬프 정책 (운영 정보 단일 소스)
    types.ts              # 도메인 타입
    seed.ts               # 부스 시드 데이터 (기업/직무/기관/부대행사/면접슬롯)
    repo.ts               # 조회·등록·체크인·지원·면접·스탬프·설문 로직
    recommend.ts          # 사전 매칭 / 현장 자동 추천 점수화
    data.ts               # 백엔드 추상화 (Supabase ↔ JSON 스토어)
    store.ts              # 로컬 JSON 스토어
    session.ts            # 참가자 패스 / 부스 스태프 / 운영 관리자 쿠키 세션
supabase/schema.sql       # 운영용 PostgreSQL 스키마
```

행사 정보(일시·장소·주최·연락처), 관 구성, 코스 안내, 스탬프 정책은 **`src/lib/config.ts`
한 파일**에서 관리됩니다. 여기만 고치면 전 페이지에 반영됩니다.

---

## 부스 데이터 교체

`src/lib/seed.ts` 의 기업 · 기관 · 프로그램은 화면 확인을 위한 **샘플 데이터**입니다.
참가 확정 명단으로 교체한 뒤:

- **로컬/데모** — `npm run reset-db` 후 재시작하면 새 시드가 반영됩니다.
- **운영(Supabase)** — `/api/seed?secret=<SEED_SECRET>` 호출.
  기존 부스 데이터를 갈아끼우려면 `&force=1` (참가자·지원·체크인 데이터는 삭제되지 않습니다.)

---

## 운영 배포

> 📘 **클릭 단위 상세 가이드: [docs/DEPLOY.md](docs/DEPLOY.md)**
> (Vercel 배포 → 환경변수 → Supabase 연결 → 도메인 설정 → 행사 전 체크리스트)

### 1) Supabase (데이터 영속화 — 운영 필수)

서버리스 환경은 파일시스템이 휘발성이라 JSON 스토어로는 데이터가 유지되지 않습니다.

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성
2. **SQL Editor** 에 `supabase/schema.sql` 붙여넣고 실행
3. 환경변수 설정 후 재배포

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...     # Project Settings → API → service_role
SEED_SECRET=긴_임의_문자열
SESSION_SECRET=32자_이상_임의_문자열
FEST_STAFF_PIN=현장_운영_PIN
FEST_ADMIN_PASSWORD=관리자_비밀번호
```

4. `/api/seed?secret=<SEED_SECRET>` 로 부스 데이터 1회 주입

> `service_role` 키는 서버에서만 사용되며 브라우저에 노출되지 않습니다.

### 2) 도메인 연결 (Vercel 기준)

1. Vercel → **Add New → Project** → 이 저장소 Import
2. Environment Variables 입력 후 Deploy
3. Settings → Domains 에 `jobfestival.co.kr`, `www.jobfestival.co.kr` 추가
4. 도메인 등록기관 DNS 에 Vercel 안내대로 A / CNAME 레코드 등록

### 3) 운영 전 체크리스트

- [ ] `SESSION_SECRET` · `FEST_STAFF_PIN` · `FEST_ADMIN_PASSWORD` 기본값에서 변경
- [ ] `src/lib/config.ts` 의 장소 · 연락처 실제 정보로 수정
- [ ] `src/lib/seed.ts` 참가 기업/기관/프로그램 확정본으로 교체
- [ ] Supabase 연결 및 시드 주입 확인
- [ ] 부스 운영자 단말에서 카메라 QR 스캔 동작 확인 (HTTPS 필요)

---

## 기술 스택

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS ·
jose(쿠키 세션) · qrcode(입장 QR) · 데이터: 로컬 JSON 스토어(데모) → Supabase(운영)
