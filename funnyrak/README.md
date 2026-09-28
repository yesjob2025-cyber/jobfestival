# 하루 계획 (funnyrak)

개인 업무 · 시간관리 웹앱. 구조와 규칙은 [`docs/작업서.md`](docs/작업서.md) 참고.

```
public/funnyrak/index.html   ← 배포되는 앱 (여기만 사이트에 공개됨)
funnyrak/
  gas/sheet-sync.gs          ← 시트 '주간업무' ↔ 앱 할 일 동기화
  gas/info-collect.gs        ← 매일 아침 뉴스 수집 → 정보함
  supabase/schema.sql        ← plans 테이블 정의 (참고용)
  test/                      ← 자동 검사 (npm test)
  docs/작업서.md
```

## 테스트

```bash
cd funnyrak
npm install     # 처음 한 번
npm test
```

GitHub 에 푸시하면 Actions 가 같은 검사를 자동으로 돌립니다 (`.github/workflows/funnyrak.yml`).

---

## 처음 한 번 해야 할 설정

### 4. Supabase 설정 가져오기

지금 쓰는 DB 를 코드로 남겨 두는 단계입니다. DB 는 바뀌지 않습니다.

1. https://supabase.com/dashboard → 프로젝트 `auymgwqonzqogqfwbnxu` → 왼쪽 **SQL Editor** → **New query**
2. 아래를 붙여넣고 **Run**

   ```sql
   select column_name, data_type, is_nullable, column_default
     from information_schema.columns
    where table_schema = 'public' and table_name = 'plans';

   select policyname, cmd, roles, qual, with_check
     from pg_policies
    where schemaname = 'public' and tablename = 'plans';
   ```
3. 결과 표 두 개를 복사해 Claude 에게 주면 `supabase/schema.sql` 을 실제 정의로 맞춥니다.
4. 같이 확인할 것: **Authentication → Sign In / Providers → Allow new users to sign up** 이 **꺼져** 있는지.
   앱의 publishable key 는 공개된 값이라, 가입이 열려 있으면 다른 사람이 계정을 만들 수 있습니다
   (RLS 덕분에 내 기록은 못 보지만, 닫아 두는 편이 안전합니다).

> 나중에 AI 요약(남은 일 2번)을 만들 때는 **Edge Functions → Secrets** 에 `ANTHROPIC_API_KEY` 를 직접 넣게 됩니다. 그때 다시 안내합니다.

### 5. Apps Script 를 저장소와 연결 (clasp)

`.gs` 를 저장소에서 고치고 명령 한 줄로 시트에 반영하는 설정입니다. **본인 PC** 에서 합니다 (Node 18 이상 필요).

> ⚠ `clasp push` 는 Apps Script 프로젝트의 파일을 **통째로** 로컬 폴더 내용으로 바꿉니다.
> 로컬에 없는 파일은 지워지므로, 아래 2단계(기존 파일 확인)를 꼭 먼저 하세요.

**1) 준비**
1. https://script.google.com/home/usersettings → **Google Apps Script API** 를 **사용**으로
2. 터미널에서
   ```bash
   npm install -g @google/clasp
   clasp login          # 브라우저가 열리면 시트 주인 계정으로 허용
   ```
3. 구글 시트 → 확장 프로그램 → Apps Script → 왼쪽 톱니바퀴(프로젝트 설정) → **스크립트 ID** 복사

**2) 기존 파일 확인 (아무것도 바뀌지 않음)**
```bash
mkdir ~/gas-check && cd ~/gas-check
clasp clone 스크립트ID
ls
```
- `appsscript.json` 과 wsync · wcollect 파일 두 개(이름은 달라도 됨)만 있다면 → 3단계로
- **그 밖의 파일**(사업총괄 · 폼 처리 등 다른 스크립트)이 있다면 → 멈추고 파일 목록을 Claude 에게 알려주세요.
  그 파일들도 저장소에 함께 넣어야 push 할 때 지워지지 않습니다. 계좌 · 주민번호 같은 값이 코드에 적혀 있으면 먼저 빼야 합니다.
- 시트 동기화와 정보 수집이 **서로 다른** Apps Script 프로젝트에 있다면 → 스크립트 ID 두 개를 알려주세요. 폴더를 나눠 드립니다.

**3) 연결**
```bash
git clone https://github.com/yesjob2025-cyber/jobfestival.git
cd jobfestival/funnyrak/gas
cp ~/gas-check/.clasp.json ~/gas-check/appsscript.json .
```
`.clasp.json` 을 열어 `"rootDir"` 이 있으면 값을 `"."` 로 바꿉니다. 그다음
```bash
clasp push           # 저장소의 .gs 두 개로 교체 — 이름이 다른 기존 파일은 이때 정리됨
```
Apps Script 편집기를 새로고침해서 `sheet-sync`, `info-collect` 두 파일이 보이면 끝입니다.
함수 이름이 그대로라 **트리거 · 스크립트 속성(SB_PW 등)은 그대로 유지**되고, `wsyncSetup` 을 다시 실행할 필요도 없습니다.
`.clasp.json` · `appsscript.json` 은 커밋해 두면 다음부터 `clasp push` 만 하면 됩니다 (비밀번호는 들어 있지 않습니다).

**이후 수정할 때**: 저장소에서 `.gs` 수정 → `npm test` → 커밋 → `cd funnyrak/gas && clasp push`

### 6. 배포 (Vercel)

이 저장소는 이미 Vercel 과 연결되어 있으므로 **새로 할 일은 없습니다.** `main` 에 병합되면 2~3분 뒤 `jobfestival.co.kr/funnyrak/index.html` 에 반영됩니다.

권장 설정 두 가지 (선택):
1. **GitHub → 저장소 Settings → Branches → Add branch ruleset** → `main` 대상 →
   *Require status checks to pass* 에 `test` (funnyrak 워크플로) 추가.
   테스트가 깨진 코드가 바로 배포되는 것을 막습니다.
2. Vercel 대시보드 → 프로젝트 → **Settings → Git** 에서 Production Branch 가 `main` 인지 확인.
   PR 을 열면 Vercel 이 미리보기 주소를 만들어 주므로, 폰에서 먼저 열어보고 병합할 수 있습니다.
   (미리보기도 같은 Supabase 를 쓰므로 실제 기록이 바뀐다는 점만 주의)
