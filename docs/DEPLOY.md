# 배포 가이드 — 2026 김해 JOB FESTIVAL

Vercel 배포 → 환경변수 → Supabase 연결 → 도메인(jobfestival.co.kr) 순서로 진행합니다.
1단계(Vercel Import)를 마친 뒤 2단계부터 이어서 보세요.

---

## 1. Vercel 프로젝트 생성

1. [vercel.com](https://vercel.com) 접속 → **Continue with GitHub** 로 로그인
2. 대시보드 → **Add New… → Project**
3. `yesjob2025-cyber/jobfestival` 옆 **Import**
   - 목록에 없으면 **Adjust GitHub App Permissions** → jobfestival 저장소 접근 허용
4. Framework Preset 이 **Next.js** 로 자동 인식되는지만 확인 (나머지 기본값 유지)
5. **Deploy** 클릭 → 2~3분 뒤 `https://jobfestival-xxxx.vercel.app` 주소 생성

이 시점에는 임시 저장소(휘발성)로 동작하므로 화면 확인용으로만 쓰고, 아래 2~3단계를 반드시 진행하세요.

---

## 2. 환경변수 설정

**Vercel 프로젝트 → Settings → Environment Variables**

아래 4개를 하나씩 추가합니다. 각 항목마다 Key / Value 입력 후 **Production · Preview · Development**
3개 환경 모두 체크하고 **Save**.

| Key | Value | 설명 |
|-----|-------|------|
| `SESSION_SECRET` | 32자 이상 임의 문자열 | 로그인 쿠키 서명 키. 유출 시 세션 위조 가능 |
| `FEST_STAFF_PIN` | 4자리 숫자 | 현장 부스 운영자 공용 체크인 PIN |
| `FEST_ADMIN_PASSWORD` | 임의 비밀번호 | `/admin` 운영 대시보드 접근 비밀번호 |
| `SEED_SECRET` | 임의 문자열 | 부스 데이터 시드 엔드포인트 보호용 |

> 임의 문자열 생성 (터미널):
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
> ```

### 저장 후 반드시 재배포

환경변수는 **다음 배포부터** 적용됩니다.
**Deployments** 탭 → 맨 위 배포의 **⋯ → Redeploy → Redeploy**

### 확인

- `https://<배포주소>/admin/login` 에서 설정한 `FEST_ADMIN_PASSWORD` 로 로그인되면 성공
- `https://<배포주소>/staff` 에서 부스 선택 후 `FEST_STAFF_PIN` 입력 시 체크인 화면 진입

---

## 3. Supabase 연결 (운영 필수)

Vercel 같은 서버리스 환경은 파일시스템이 휘발성이라, Supabase 없이는 **재배포·인스턴스 교체 때마다
사전등록·지원·체크인 데이터가 초기화**됩니다. 행사 운영 전 반드시 연결하세요.

### 3-1. 프로젝트 생성

1. [supabase.com](https://supabase.com) → **Start your project** (GitHub 로그인 가능)
2. **New project**
   - Name: `jobfestival`
   - Database Password: 임의 강력 비밀번호 (별도 보관 — 앱에서는 쓰지 않음)
   - Region: **Northeast Asia (Seoul)**
3. **Create new project** → 1~2분 대기

### 3-2. 테이블 생성

1. 왼쪽 메뉴 **SQL Editor** → **New query**
2. 저장소의 [`supabase/schema.sql`](../supabase/schema.sql) 전체 내용 복사 → 붙여넣기
3. **Run** (또는 Ctrl/⌘ + Enter) → `Success. No rows returned` 확인
4. 왼쪽 **Table Editor** 에서 `fest_companies` 등 테이블 11개 생성 확인

### 3-3. 접속 키 확인

**Project Settings(톱니바퀴) → API**

| 항목 | 복사할 값 |
|------|-----------|
| Project URL | `https://xxxxxxxx.supabase.co` |
| `service_role` (secret) | `eyJ...` 로 시작하는 긴 문자열 — **Reveal** 클릭 후 복사 |

> 최신 Supabase UI 에서는 **Project Settings → API Keys** 에 있을 수 있습니다.
> `anon` / `publishable` 키가 아닌 **`service_role`(secret)** 키여야 합니다.
> 이 키는 서버에서만 사용되며 브라우저에 노출되지 않습니다. 절대 공개 저장소·채팅에 올리지 마세요.

### 3-4. Vercel 에 등록

2단계와 같은 방법으로 2개 추가 후 **Redeploy**:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | 위에서 복사한 Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 위에서 복사한 service_role 키 |

### 3-5. 부스 데이터 주입 (1회)

브라우저에서 아래 주소 접속:

```
https://<배포주소>/api/seed?secret=<SEED_SECRET에 넣은 값>
```

성공 시 응답:

```json
{"seeded":true,"counts":{"festCompanies":12,"festJobs":13,"festPromos":10,"festEvents":10,"festInterviewSlots":120}}
```

| 응답 | 의미 · 조치 |
|------|-------------|
| `{"seeded":true, ...}` | 정상 완료 |
| `{"seeded":false,"reason":"already-seeded"}` | 이미 데이터가 있음. 갈아끼우려면 뒤에 `&force=1` 추가 |
| `{"seeded":false,"reason":"json-backend-auto-seeds"}` | Supabase 환경변수가 적용 안 됨 → 값 확인 후 **Redeploy** |
| `{"error":"unauthorized"}` | `secret` 값이 `SEED_SECRET` 과 다름 |

> `&force=1` 은 **부스 데이터만** 교체합니다. 참가자·지원·체크인·설문 데이터는 삭제되지 않습니다.

### 3-6. 확인

`/companies` 에서 기업 목록이 보이고, 사전등록 후 **재배포해도 입장권이 유지되면** 연결 완료입니다.

---

## 4. 도메인 연결 (jobfestival.co.kr)

### 4-1. Vercel 에 도메인 추가

1. **Vercel 프로젝트 → Settings → Domains**
2. `jobfestival.co.kr` 입력 → **Add** → Recommended 옵션(www 리다이렉트 포함) 선택
3. Vercel 이 등록해야 할 **DNS 레코드 값**을 화면에 표시합니다
   - 루트 도메인: **A 레코드**
   - `www`: **CNAME 레코드**
   > IP·호스트 값은 계정·시점에 따라 다르므로 **반드시 화면에 표시된 값을 그대로** 사용하세요.

### 4-2. 도메인 등록기관에서 DNS 설정

`.co.kr` 은 보통 가비아·후이즈·카페24 등에서 관리합니다. (예: 가비아)

1. My가비아 → **DNS 관리툴** → 해당 도메인 **설정**
2. **레코드 수정** 에서 아래 두 줄 추가 후 저장

| 타입 | 호스트 | 값 |
|------|--------|-----|
| A | `@` | Vercel 이 안내한 IP |
| CNAME | `www` | Vercel 이 안내한 호스트 (예: `cname.vercel-dns.com.`) |

- 기존에 다른 A 레코드가 `@` 에 있으면 **삭제 후** 새 값으로 교체하세요.
- 네임서버를 가비아가 아닌 곳으로 위임했다면 그쪽 DNS 에서 설정해야 합니다.

### 4-3. 전파 대기 · 확인

- 보통 10분 ~ 1시간, 최대 24~48시간
- Vercel Domains 화면의 상태가 **Valid Configuration** 으로 바뀌면 완료
- SSL 인증서는 Vercel 이 자동 발급합니다 (`https://` 자동 적용)

---

## 5. 행사 전 최종 체크리스트

### 콘텐츠
- [ ] `src/lib/config.ts` — 장소(`venue`, `venueDetail`), 문의처(`contact`) 실제 정보로 수정
- [ ] `src/lib/seed.ts` — 참가 기업 · 기관 · 부대행사를 확정 명단으로 교체 후 `&force=1` 재시드
- [ ] `/about` 운영 시간표(`TIMETABLE`)를 확정 일정으로 수정

### 보안
- [ ] `SESSION_SECRET` · `FEST_STAFF_PIN` · `FEST_ADMIN_PASSWORD` 기본값 아닌 값으로 설정
- [ ] `service_role` 키가 저장소·문서·메신저에 노출되지 않았는지 확인

### 현장 준비
- [ ] 부스 단말(태블릿/휴대폰)에서 `https://jobfestival.co.kr/staff` 접속 → 부스별 로그인
      (카메라 QR 스캔은 **HTTPS 에서만** 동작합니다)
- [ ] 카메라 미지원 단말 대비 — 참가자 **6자리 확인 코드** 직접 입력 방식 안내 교육
- [ ] 입장 게이트 단말은 `입장 게이트 (종합안내)` 부스로 로그인
- [ ] 스탬프 완주 코드 확인은 `/admin` 하단 **스탬프 완주 코드 확인** 사용
- [ ] 행사 종료 후 `/admin` 에서 visitors · applications · checkins · surveys **CSV 내보내기**

---

## 문제 해결

| 증상 | 원인 · 조치 |
|------|-------------|
| 재배포하면 등록 데이터가 사라짐 | Supabase 미연결 → 3단계 진행 |
| `/api/seed` 가 `json-backend-auto-seeds` 응답 | `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` 미적용 → 값 확인 후 Redeploy |
| 부스 QR 카메라가 안 켜짐 | HTTPS 아님 / 브라우저 권한 거부 / 미지원 브라우저 → 6자리 코드 입력 사용 |
| 도메인이 계속 `Invalid Configuration` | DNS 레코드 오타, 기존 A 레코드 잔존, 네임서버 위임 위치 불일치 |
| 관리자 로그인이 안 됨 | `FEST_ADMIN_PASSWORD` 저장 후 Redeploy 를 안 함 |
