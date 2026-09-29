/**
 * 정보 자동 수집 (1단계) — 매일 아침 앱 정보함 '새로 들어온 것'으로
 *
 * ▸ 이 파일 하나로 동작합니다. 주간업무 동기화(wsync)가 없어도 됩니다.
 *   (wsync 가 이미 있다면 같은 프로젝트에 새 파일로 추가하면 되고, 설정 값도 함께 씁니다)
 *
 * 준비: 프로젝트 설정(톱니바퀴) → 스크립트 속성에 4개 (wsync 를 설치했다면 이미 있음)
 *   SB_URL  https://auymgwqonzqogqfwbnxu.supabase.co
 *   SB_KEY  sb_publishable_3hHaYxoSr39iBac-BR1P5Q_9xe_0aGG
 *   SB_ID   funnyrak@jobfestival.co.kr
 *   SB_PW   (앱 비밀번호)
 *
 * 실행: wcollectRun ▶ (지금 한 번 수집) · wcollectSetup ▶ (매일 아침 자동 켜기, 지금은 수집 안 함)
 *       wcollectCheck ▶ — 자동 수집이 켜져 있는지 · 앱 연결 · 마지막 수집 시각 · 오늘의 전문지 확인
 *       wcollectReset ▶ — '새로 들어온 것'을 모두 비우기 (비운 기사는 다시 들어오지 않음)
 *
 * 매일 구성: 키워드 뉴스 중심 + 전문지는 하루에 한 곳씩 돌아가며(7곳 → 일주일에 한 번씩, 지난 7일치)
 *            + 정책 보도자료
 * 토 · 일:    위에 더해 연구기관 소식 (지난 7일치 — 한 주 몰아보기)
 * 자동 실행: 7시에 수집하고, 7시 실행이 실패했으면 9시에 한 번 더 시도 (이미 수집한 날은 건너뜀)
 */

const WCOL = {
  HOUR: 7,               // 매일 수집 시각
  RETRY_HOUR: 9,         // 7시 수집이 실패한 날 다시 시도하는 시각
  DAYS_NEWS: 1,          // 키워드 뉴스 · 보도자료: 최근 24시간
  DAYS_INST: 7,          // 연구기관: 토 · 일에만, 최근 7일
  DAYS_MEDIA: 7,         // 전문지: 오늘 차례인 한 곳의 최근 7일 (7곳을 돌아가며 → 매체마다 일주일에 한 번)
  MEDIA_MAX: 10,         // 오늘 차례 전문지에서 최대
  PER_QUERY: 4,          // 검색어 하나당 최대
  INBOX_MAX: 50,         // '새로 들어온 것' 최대
  QUOTA: { '뉴스·키워드': 30, '전문지·신문': 10, '정책·보도자료': 8, '연구기관': 10 },   // 하루 분류별 자리 (남으면 다른 분류가 채움)
  INBOX_DAYS: 14,        // 손대지 않은 건 며칠 뒤 정리
  QUERIES: [
    // [검색어, 렌즈, 주제]
    ['대학 취업 프로그램 운영', '프로그램 사례', '취업'],
    ['대학 진로 멘토링', '프로그램 사례', '진로'],
    ['취업박람회 개최', '프로그램 사례', '박람회'],
    ['잡페스티벌', '프로그램 사례', '박람회'],
    ['현직자 멘토링', '프로그램 사례', '멘토링'],
    ['중장년 전직 지원 프로그램', '프로그램 사례', '전직'],
    ['외국인 유학생 취업 지원', '프로그램 사례', '외국인'],
    ['대학생 리더십 프로그램', '프로그램 사례', '리더십'],
    ['대학 창업 프로그램', '프로그램 사례', '창업'],
    ['창업 경진대회', '프로그램 사례', '창업'],
    ['대학 AI 교육 프로그램', '프로그램 사례', 'AI'],
    ['생성형 AI 활용 교육', '프로그램 사례', 'AI'],
    ['청년 일자리 정책', '이슈·트렌드', '일자리'],
    ['채용 트렌드', '이슈·트렌드', '채용'],
    ['직무 중심 채용', '이슈·트렌드', '직무'],
    ['NCS 채용', '이슈·트렌드', 'NCS'],
    ['신중년 일자리', '이슈·트렌드', '중장년'],
    ['시니어 재취업', '이슈·트렌드', '중장년'],
    ['청년 창업 지원', '이슈·트렌드', '창업'],
    ['AI 채용', '이슈·트렌드', 'AI'],
    ['AI 일자리 변화', '이슈·트렌드', 'AI'],
    ['청년 고용률', '통계', '일자리'],
    ['대학 취업률 발표', '통계', '취업'],
    ['쉬었음 청년', '통계', '청년'],
    ['외국인 고용 조사', '통계', '외국인'],
    ['창업 실태조사', '통계', '창업']
  ],
  // 정책브리핑 RSS 는 서비스가 중단되어, 구글 뉴스에서 korea.kr 글만 골라 가져옵니다
  // [부처 이름, 검색어]  — 아래 KEYWORDS 중 하나라도 들어간 글만 남깁니다
  POLICY: [
    ['교육부', 'site:korea.kr 교육부'],
    ['고용노동부', 'site:korea.kr 고용노동부'],
    ['중소벤처기업부', 'site:korea.kr 중소벤처기업부']
  ],
  // 전문지 — [매체 이름, 검색어]  하루에 한 곳씩 이 순서대로 돌아감. 사이트 글 중 KEYWORDS 가 제목에 있는 것만
  MEDIA: [
    ['한국대학신문', 'site:news.unn.net'],
    ['대학저널', 'site:dhnews.co.kr'],
    ['교수신문', 'site:kyosu.net'],
    ['한경잡앤조이', 'site:magazine.hankyung.com 잡앤조이'],
    ['대학내일', 'site:univ20.com'],
    ['에듀프레스', 'site:edupress.kr'],
    ['에듀인뉴스', 'site:edunnews.co.kr']
  ],
  // 연구기관 — 기관의 조사·연구 결과를 다룬 기사 (토 · 일에만 수집)
  INSTITUTES: [
    ['한국고용정보원', '"한국고용정보원"'],
    ['한국노동연구원', '"한국노동연구원"'],
    ['한국직업능력연구원', '"한국직업능력연구원"'],
    ['한국교육개발원', '"한국교육개발원"'],
    ['한국청소년정책연구원', '"한국청소년정책연구원"']
  ],
  KEYWORDS: ['취업', '진로', '일자리', '직무', '채용', '전직', 'NCS', '리더십', '박람회', '청년', '대학',
             '외국인', '유학생', '신중년', '중장년', '시니어', '멘토링', '창업', 'AI', '인공지능', '고용'],
  TARGETS: [
    ['외국인', /외국인|유학생|이민자/], ['중장년·신중년', /중장년|신중년|시니어|고령/],
    ['예비창업자', /창업/], ['청년·대학', /청년|대학|대학생|취준생|MZ|Z세대/]
  ],
  HANDLER: 'wcollectDaily',
  OLD_HANDLERS: ['wcollectRun', 'wcollectDaily']   // 설치할 때 지우는 이 스크립트의 예전 자동 실행
};

function wcollectSetup() {
  ScriptApp.getProjectTriggers().filter(t => WCOL.OLD_HANDLERS.indexOf(t.getHandlerFunction()) > -1)
    .forEach(t => ScriptApp.deleteTrigger(t));
  [WCOL.HOUR, WCOL.RETRY_HOUR].forEach(h =>
    ScriptApp.newTrigger(WCOL.HANDLER).timeBased().atHour(h).everyDays(1).inTimezone('Asia/Seoul').create());
  wcolGet_();   // 앱 연결만 확인 (지금 수집하지는 않음)
  console.log(`설정 완료 · 매일 아침 ${WCOL.HOUR}시에 자동 수집합니다 (실패한 날은 ${WCOL.RETRY_HOUR}시에 한 번 더)`);
  try { SpreadsheetApp.getActive().toast(`설정 완료 · 매일 아침 ${WCOL.HOUR}시 자동 수집`, '정보 수집', 8); } catch (e) {}
}

/* ---------- 자동 실행 (트리거) — 오늘 이미 수집했으면 건너뜀 ---------- */
function wcollectDaily() {
  const d = wcolGet_();
  if (d.collectedAt && wcolDay_(d.collectedAt) === wcolDay_(Date.now())) {
    console.log('오늘은 이미 수집했습니다 · 건너뜀');
    return 0;
  }
  return wcollectRun();
}

/* ---------- 점검 ---------- */
function wcollectCheck() {
  const out = [];
  const trig = ScriptApp.getProjectTriggers().filter(t => WCOL.OLD_HANDLERS.indexOf(t.getHandlerFunction()) > -1);
  out.push(trig.length
    ? `자동 실행 ${trig.length}개 켜짐 (${trig.map(t => t.getHandlerFunction()).join(', ')})`
      + (trig.some(t => t.getHandlerFunction() === WCOL.HANDLER) ? '' : ' — 예전 방식입니다. wcollectSetup 을 한 번 실행하세요')
    : '자동 실행이 꺼져 있습니다 → wcollectSetup ▶ 을 실행하세요');
  try {
    const d = wcolGet_();
    out.push('앱 연결 정상');
    out.push(d.collectedAt
      ? '마지막 수집 ' + Utilities.formatDate(new Date(d.collectedAt), 'Asia/Seoul', 'yyyy-MM-dd HH:mm')
      : '아직 한 번도 수집하지 않았습니다');
    out.push(`새로 들어온 것 ${(d.inbox || []).length}건`);
  } catch (e) {
    out.push('앱 연결 실패 — ' + e.message);
  }
  out.push(`오늘의 전문지: ${wcolMediaToday_()[0]}` + (wcolWeekend_() ? ' · 오늘은 연구기관 소식도 수집' : ''));
  const msg = out.join('\n');
  console.log(msg);
  return msg;
}

/* ---------- 비우기 ---------- */
function wcollectReset() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const d = wcolGet_();
    d.inbox = d.inbox || []; d.inboxDone = d.inboxDone || {};
    const now = Date.now(), n = d.inbox.length;
    d.inbox.forEach(x => { d.inboxDone[x.id] = now; });
    d.inbox = [];
    wcolPut_(d);
    console.log(`'새로 들어온 것' ${n}건을 비웠습니다. 비운 기사는 다시 들어오지 않습니다.`);
    try { SpreadsheetApp.getActive().toast(`${n}건을 비웠습니다`, '정보 수집', 5); } catch (e) {}
  } finally { lock.releaseLock(); }
}

/* ---------- 실행 ---------- */
function wcollectRun() {
  const got = [], errs = [];
  let tried = 0;
  WCOL.QUERIES.forEach(([q, lens, topic]) => {
    tried++;
    try { wcolNews_(q, WCOL.DAYS_NEWS).slice(0, WCOL.PER_QUERY).forEach(x => got.push(Object.assign(x, { lens, topic, type: '뉴스·키워드', q }))); }
    catch (e) { errs.push(q + ' — ' + e); console.warn('뉴스 실패: ' + q + ' — ' + e); }
    Utilities.sleep(300);
  });
  const bySource = (list, type, need, max, days) => list.forEach(([name, q]) => {
    tried++;
    try {
      const rows = wcolNews_(q, days).filter(x => !need || WCOL.KEYWORDS.some(k => x.t.indexOf(k) > -1)).slice(0, max);
      rows.forEach(x => got.push(Object.assign(x, { src: name, type, lens: wcolLens_(x.t), topic: '', q })));
      console.log(`${name}: ${rows.length}건`);
    } catch (e) { errs.push(name + ' — ' + e); console.warn(type + ' 실패: ' + name + ' — ' + e); }
    Utilities.sleep(300);
  });
  bySource(WCOL.POLICY, '정책·보도자료', true, 8, WCOL.DAYS_NEWS);
  bySource([wcolMediaToday_()], '전문지·신문', true, WCOL.MEDIA_MAX, WCOL.DAYS_MEDIA);   // 하루 한 곳씩 돌아가며
  if (wcolWeekend_()) bySource(WCOL.INSTITUTES, '연구기관', false, 4, WCOL.DAYS_INST);   // 토 · 일에만

  // 가져오기가 전부 실패하면 '수집함'으로 기록하지 않고 오류로 끝냄 → 실행 기록에 실패로 남고 9시에 다시 시도
  if (errs.length && errs.length === tried) {
    throw new Error(`기사를 하나도 가져오지 못했습니다 (${tried}곳 모두 실패). 첫 오류: ${errs[0]}`);
  }
  if (errs.length) console.warn(`가져오기 실패 ${errs.length} / ${tried}곳`);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const d = wcolGet_();
    d.inbox = d.inbox || []; d.inboxDone = d.inboxDone || {}; d.info = d.info || [];
    const seen = new Set();
    const norm = s => String(s || '').replace(/\s|[\[\]()'"“”‘’…·,.!?-]/g, '').slice(0, 40);
    d.inbox.forEach(x => { seen.add(x.id); seen.add(norm(x.t)); });
    Object.keys(d.inboxDone).forEach(k => seen.add(k));
    d.info.forEach(x => { if (x.u) seen.add(x.u); seen.add(norm(x.t)); });

    const now = Date.now(), today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    const fresh = [];
    got.forEach(x => {
      const id = 'n' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, x.u || x.t)).slice(0, 12);
      const key = norm(x.t);
      if (seen.has(id) || seen.has(key) || seen.has(x.u)) return;
      seen.add(id); seen.add(key);
      fresh.push({ id, d: x.d || today, type: x.type, lens: x.lens, topic: x.topic, tg: wcolTarget_(x.t + ' ' + x.s),
        t: x.t, s: x.s, u: x.u, src: x.src || '', q: x.q || '', at: now });
    });
    // 검색어끼리 번갈아 줄 세우고 → 분류별로 번갈아 골라 최대 50건 (한쪽이 자리를 다 차지하지 않게)
    const byQ = {}, qs = [];
    fresh.forEach(x => { const k = x.q || x.src; if (!byQ[k]) { byQ[k] = []; qs.push(k); } byQ[k].push(x); });
    const mixed = [];
    while (qs.some(k => byQ[k].length)) qs.forEach(k => { if (byQ[k].length) mixed.push(byQ[k].shift()); });
    const groups = {};
    mixed.forEach(x => (groups[x.type] = groups[x.type] || []).push(x));
    const pick = [];
    Object.keys(WCOL.QUOTA).forEach(k => {                       // 1) 분류별 자리만큼
      if (groups[k]) pick.push(...groups[k].splice(0, WCOL.QUOTA[k]));
    });
    const rest = Object.keys(groups);                              // 2) 남은 자리는 번갈아 채우기
    while (pick.length < WCOL.INBOX_MAX && rest.some(k => groups[k].length)) {
      rest.forEach(k => { if (pick.length < WCOL.INBOX_MAX && groups[k].length) pick.push(groups[k].shift()); });
    }
    pick.splice(WCOL.INBOX_MAX);
    const added = pick.length;
    d.inbox = pick.concat(d.inbox);
    // 정리: 오래된 것 · 50건 넘는 것 (넘치면 오래된 것부터 밀려남)
    const cut = now - WCOL.INBOX_DAYS * 864e5;
    d.inbox = d.inbox.filter(x => (x.at || 0) > cut);
    d.inbox.slice(WCOL.INBOX_MAX).forEach(x => { d.inboxDone[x.id] = now; });
    d.inbox = d.inbox.slice(0, WCOL.INBOX_MAX);
    const cut2 = now - 45 * 864e5;
    Object.keys(d.inboxDone).forEach(k => { if (d.inboxDone[k] < cut2) delete d.inboxDone[k]; });
    d.collectedAt = now;
    wcolPut_(d);
    console.log(`수집 ${got.length}건 · 처음 보는 기사 ${fresh.length}건 중 ${added}건 추가 · 새로 들어온 것 ${d.inbox.length}건 (최대 ${WCOL.INBOX_MAX})`);
    return added;
  } finally { lock.releaseLock(); }
}

/* ---------- 날짜 · 전문지 순번 ---------- */
function wcolDay_(ts) { return Math.floor((ts + 9 * 3600e3) / 864e5); }          // 한국 날짜 기준 날 번호
function wcolWeekend_() { const w = new Date(Date.now() + 9 * 3600e3).getUTCDay(); return w === 0 || w === 6; }
function wcolMediaToday_() { return WCOL.MEDIA[wcolDay_(Date.now()) % WCOL.MEDIA.length]; }

/* ---------- 가져오기 ---------- */
function wcolNews_(q, days) {
  days = days || 1;
  const url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q + ' when:' + days + 'd') + '&hl=ko&gl=KR&ceid=KR:ko';
  return wcolRss_(url, days).map(x => {
    // 구글 뉴스 제목은 "제목 - 매체"
    const m = x.t.match(/^(.*)\s-\s([^-]+)$/);
    if (m) { x.t = m[1].trim(); x.src = x.src || m[2].trim(); }
    x.s = '';   // 구글 뉴스 설명은 제목 반복이라 비움
    return x;
  });
}
function wcolRss_(url, days) {
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; daily-plan-collector)' } });
  if (res.getResponseCode() !== 200) throw new Error('HTTP ' + res.getResponseCode());
  const doc = XmlService.parse(res.getContentText('UTF-8'));
  const ch = doc.getRootElement().getChild('channel');
  if (!ch) return [];
  const since = Date.now() - (days || 1) * 864e5 - 3600e3;   // 기간 밖 기사는 버림 (1시간 여유)
  return ch.getChildren('item').map(it => {
    const g = n => { const e = it.getChild(n); return e ? e.getText() : ''; };
    const src = it.getChild('source');
    const pd = new Date(g('pubDate'));
    return {
      t: wcolClean_(g('title')), s: wcolClean_(g('description')).slice(0, 160), u: g('link').trim(),
      src: src ? src.getText() : '', ts: isNaN(pd) ? Date.now() : pd.getTime(),
      d: isNaN(pd) ? '' : Utilities.formatDate(pd, 'Asia/Seoul', 'yyyy-MM-dd')
    };
  }).filter(x => x.t && x.ts >= since).sort((a, b) => b.ts - a.ts);
}
function wcolClean_(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}
function wcolLens_(txt) {
  if (/통계|조사|실태|발표.*[%％]|고용률|취업률/.test(txt)) return '통계';
  if (/프로그램|운영|개최|성료|캠프|박람회|교육과정/.test(txt)) return '프로그램 사례';
  return '이슈·트렌드';
}
function wcolTarget_(txt) {
  const hit = WCOL.TARGETS.find(([, re]) => re.test(txt));
  return hit ? hit[0] : '';
}

/* ---------- 앱 서버 연결 (단독 동작용) ---------- */
function wcolCfg_() {
  const p = PropertiesService.getScriptProperties().getProperties();
  ['SB_URL', 'SB_KEY', 'SB_ID', 'SB_PW'].forEach(k => {
    if (!p[k]) throw new Error('스크립트 속성 ' + k + ' 이(가) 비어 있습니다. 프로젝트 설정에서 넣어주세요.');
  });
  return p;
}
function wcolToken_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('wcol_tok');
  if (hit) return JSON.parse(hit);
  const c = wcolCfg_();
  const res = UrlFetchApp.fetch(c.SB_URL + '/auth/v1/token?grant_type=password', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { apikey: c.SB_KEY }, payload: JSON.stringify({ email: c.SB_ID, password: c.SB_PW })
  });
  if (res.getResponseCode() !== 200) throw new Error('앱 로그인 실패 — SB_ID, SB_PW 를 확인하세요.');
  const j = JSON.parse(res.getContentText());
  const tok = { t: j.access_token, uid: j.user.id };
  cache.put('wcol_tok', JSON.stringify(tok), Math.max(60, (j.expires_in || 3600) - 120));
  return tok;
}
function wcolGet_() {
  const c = wcolCfg_(), tok = wcolToken_();
  const res = UrlFetchApp.fetch(c.SB_URL + '/rest/v1/plans?select=data&user_id=eq.' + tok.uid,
    { headers: { apikey: c.SB_KEY, Authorization: 'Bearer ' + tok.t }, muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('앱 기록 불러오기 실패: ' + res.getContentText());
  const rows = JSON.parse(res.getContentText());
  if (!rows.length) throw new Error('앱에 저장된 기록이 없습니다. 앱에서 한 번 로그인해 주세요.');
  return rows[0].data || {};
}
function wcolPut_(data) {
  const c = wcolCfg_(), tok = wcolToken_();
  const res = UrlFetchApp.fetch(c.SB_URL + '/rest/v1/plans?user_id=eq.' + tok.uid, {
    method: 'patch', contentType: 'application/json', muteHttpExceptions: true,
    headers: { apikey: c.SB_KEY, Authorization: 'Bearer ' + tok.t, Prefer: 'return=minimal' },
    payload: JSON.stringify({ data: data, updated_at: new Date().toISOString() })
  });
  if (res.getResponseCode() >= 300) throw new Error('앱 저장 실패: ' + res.getContentText());
}
