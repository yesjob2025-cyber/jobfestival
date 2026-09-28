# 하루 계획 (funnyrak)

전체 구조 · 데이터 모델 · 규칙 · 남은 일은 작업서에 있다. 작업 전에 반드시 읽을 것.

@docs/작업서.md

## 파일 위치 (작업서 1장보다 이 표가 우선)

| 조각 | 파일 |
|---|---|
| 앱 | `../public/funnyrak/index.html` — 단일 파일 유지 (작업서 규칙 5) |
| 시트 동기화 | `gas/sheet-sync.gs` |
| 정보 수집 | `gas/info-collect.gs` |
| DB 정의 | `supabase/schema.sql` |
| 테스트 | `test/` — `npm test` (jsdom + Apps Script mock) |

## 작업 순서

1. `cd funnyrak && npm install` (처음 한 번)
2. 코드 수정
3. `npm test` 통과 확인. 새 기능에는 테스트를 함께 추가한다.
   - 앱: `test/load-app.js` 의 `loadApp(seed)` 로 로컬 모드 실행 → `w.eval('ST')` 로 상태 확인
   - Apps Script: `test/gas-env.js` 의 `createEnv({ data, fetch })` — `env.db.data` 가 Supabase 의 `plans.data`
4. 루틴 기본 항목 `k` 를 의도적으로 바꿨다면 `migrate()` 에 이름 변경을 넣고 `test/fixtures/routine-keys.json` 을 고친다.
5. 브랜치에 푸시 → PR. `main` 병합 = 실제 배포.

## 비밀 정보

- 앱 비밀번호(`SB_PW`) · Anthropic 키 등은 저장소에 절대 넣지 않는다. Apps Script 는 스크립트 속성, 서버 키는 Supabase Edge Function 시크릿에 둔다.
- `SB_URL` · publishable key 는 브라우저에 공개되는 값이라 코드에 있어도 된다 (RLS 가 보호).
- `.gs` 수정은 저장소에서 하고, Apps Script 반영은 README 의 clasp 절차로 한다.
