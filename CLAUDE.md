# jobfestival 저장소

이 저장소에는 서로 독립된 두 가지가 들어 있다.

1. **KMOU 취업박람회 홈페이지** — Next.js (`src/`, 루트 `package.json`). 설명은 `README.md`.
2. **하루 계획 (funnyrak)** — 개인용 단일 HTML 앱.
   - 배포되는 앱: `public/funnyrak/index.html` (Next 가 정적 파일로 그대로 서빙 → `jobfestival.co.kr/funnyrak/index.html`)
   - 그 밖의 모든 것(Apps Script · 테스트 · 문서): `funnyrak/` — 규칙은 `funnyrak/CLAUDE.md`

하루 계획 작업은 루트 `package.json` 이나 `src/` 를 건드리지 않는다. `main` 에 푸시하면 Vercel 이 곧바로 배포하므로, 앱 변경은 `funnyrak/` 테스트를 통과시킨 뒤 올린다.
