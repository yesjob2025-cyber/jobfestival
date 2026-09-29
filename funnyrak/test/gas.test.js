// Apps Script 두 개(sheet-sync.gs · info-collect.gs)를 mock 환경에서 돌려보는 검사.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createEnv } = require('./gas-env');

const plain = x => JSON.parse(JSON.stringify(x));

test('두 스크립트가 한 프로젝트에 같이 올라가도 이름이 겹치지 않음', () => {
  const env = createEnv();
  ['wsyncSetup', 'wsyncPull', 'wsyncPush', 'wsyncOnEdit', 'wcollectRun', 'wcollectSetup', 'wcollectReset']
    .forEach(fn => assert.equal(env.run('typeof ' + fn), 'function', fn));
});

test('wsyncPull — 업무만 시트에 쓰고 개인 할 일은 빼기', () => {
  const env = createEnv({ data: { todos: [
    { id: 'p1', t: '해양대 박람회', cat: '업무', lv: '중요', pid: null, done: false, u: 1 },
    { id: 'k1', t: '부스 배치', cat: '업무', lv: '일상', pid: 'p1', ph: '준비', done: false, u: 1 },
    { id: 'h1', t: '병원 예약', cat: '개인', lv: '일상', pid: null, done: false, u: 1 },
    { id: 's1', t: '메일 회신', cat: '업무', lv: '일상', pid: null, done: false, u: 1 }
  ] } });
  env.sheet('주간업무');
  env.run('wsyncPull()');
  const rows = env.sheets['주간업무'].grid.slice(1).filter(r => r && r[0]).map(r => r.slice(0, 4));
  assert.deepEqual(rows, [
    ['p1', '해양대 박람회', '', '▶ 사업 전체'],
    ['k1', '해양대 박람회', '준비', '부스 배치'],
    ['s1', '', '', '메일 회신']
  ]);
  assert.equal(env.puts, 0, 'pull 은 앱 데이터를 저장하지 않아야 합니다');
});

test('wsyncPush — 완료 체크 · 새 줄 추가 · 삭제 체크가 앱 데이터에 반영', () => {
  const env = createEnv({ data: { todos: [
    { id: 'p1', t: '해양대 박람회', cat: '업무', lv: '중요', pid: null, done: false, u: 1 },
    { id: 'k1', t: '부스 배치', cat: '업무', lv: '일상', pid: 'p1', ph: '준비', done: false, u: 1 },
    { id: 's1', t: '메일 회신', cat: '업무', lv: '일상', pid: null, done: false, u: 1 },
    { id: 'h1', t: '병원 예약', cat: '개인', lv: '일상', pid: null, done: false, u: 1 }
  ] } });
  env.sheet('주간업무');
  env.run('wsyncPull()');
  const g = env.sheets['주간업무'].grid;
  const row = id => g.find(r => r && r[0] === id);
  row('k1')[5] = true;                                              // 완료
  row('s1')[7] = true;                                              // 삭제
  g.push(['', '해양대 박람회', '정산', '결과보고서', '중요', false, '', false]);   // 새 줄
  g.push(['h1', '', '', '개인 건드리기', '일상', true, '', false]);   // 개인 ID — 무시돼야 함
  env.run('wsyncPush()');

  const todos = env.db.data.todos;
  const by = id => todos.find(t => t.id === id);
  assert.equal(by('k1').done, true);
  assert.match(by('k1').doneAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(by('s1'), undefined);
  assert.ok(env.db.data.gone.s1, '삭제 기록(묘비)이 남아야 합니다');
  const added = todos.find(t => t.t === '결과보고서');
  assert.deepEqual(plain({ pid: added.pid, ph: added.ph, lv: added.lv, cat: added.cat }),
    { pid: 'p1', ph: '정산', lv: '중요', cat: '업무' });
  assert.deepEqual(plain(by('h1')), { id: 'h1', t: '병원 예약', cat: '개인', lv: '일상', pid: null, done: false, u: 1 });
});

const rss = items => `<?xml version="1.0"?><rss><channel>${items.map(([t, link, src]) =>
  `<item><title>${t} - ${src}</title><link>${link}</link><pubDate>${new Date().toUTCString()}</pubDate><source>${src}</source><description>x</description></item>`
).join('')}</channel></rss>`;

test('wcollectRun — 수집해서 inbox 에 넣고, 이미 본 기사는 다시 넣지 않음', () => {
  const env = createEnv({
    data: { info: [{ id: 'i1', t: '보관한 기사', u: 'https://n/keep' }], inbox: [], inboxDone: {} },
    fetch: url => [200, rss([
      ['대학 취업 프로그램 성황', 'https://n/a', '대학저널'],
      ['청년 고용률 발표', 'https://n/b', '한국경제'],
      ['보관한 기사', 'https://n/keep', '어딘가']
    ])]
  });
  const added = env.run('wcollectRun()');
  const inbox = env.db.data.inbox;
  assert.equal(added, 2);
  assert.deepEqual(inbox.map(x => x.t).sort(), ['대학 취업 프로그램 성황', '청년 고용률 발표']);
  assert.ok(inbox.every(x => x.id.startsWith('n') && x.at && x.type));

  assert.equal(env.run('wcollectRun()'), 0, '두 번째 실행에서는 새로 추가되는 게 없어야 합니다');
  assert.ok(env.db.data.inbox.length <= 50);
});

test('wcollectReset — inbox 를 비우고 다시 들어오지 않게 표시', () => {
  const env = createEnv({ data: { inbox: [{ id: 'nA', t: 'a', at: Date.now() }], inboxDone: {} } });
  env.run('wcollectReset()');
  assert.deepEqual(plain(env.db.data.inbox), []);
  assert.ok(env.db.data.inboxDone.nA);
});

const MEDIA_SITES = ['news.unn.net', 'dhnews.co.kr', 'kyosu.net', 'magazine.hankyung.com', 'univ20.com', 'edupress.kr', 'edunnews.co.kr'];
const mediaHits = env => MEDIA_SITES.filter(site => env.urls.some(u => decodeURIComponent(u).indexOf('site:' + site) > -1));

test('전문지는 하루에 한 곳만 · 날짜가 바뀌면 다음 곳으로', () => {
  const seen = [];
  for (let i = 0; i < 7; i++) {
    const t = Date.UTC(2026, 8, 29, 0, 0) + i * 864e5;   // 매일 한국 시각 09:00
    const env = createEnv({ data: { inbox: [], inboxDone: {} }, fetch: () => [200, rss([])] });
    env.run(`Date.now = () => ${t}`);                   // 스크립트 쪽 시계만 옮김
    env.run('wcollectRun()');
    const hits = mediaHits(env);
    assert.equal(hits.length, 1, '하루에 전문지 한 곳만 가져와야 합니다: ' + hits.join(', '));
    seen.push(hits[0]);
  }
  assert.equal(new Set(seen).size, 7, '일주일이면 7곳을 한 번씩 돌아야 합니다');
});

test('키워드 뉴스가 가장 많은 자리를 차지', () => {
  const env = createEnv();
  const q = JSON.parse(env.run('JSON.stringify(WCOL.QUOTA)'));
  const top = Object.keys(q).sort((a, b) => q[b] - q[a])[0];
  assert.equal(top, '뉴스·키워드');
});

test('wcollectSetup — 7시 · 9시 자동 실행을 만들고, 예전 wcollectRun 트리거는 정리', () => {
  const env = createEnv({ data: {} });
  env.run("ScriptApp.newTrigger('wcollectRun').timeBased().atHour(7).everyDays(1).create()");
  env.run("ScriptApp.newTrigger('wsyncPull').timeBased().everyMinutes(5).create()");
  env.run('wcollectSetup()');
  const mine = env.triggers.filter(t => /^wcollect/.test(t.fn));
  assert.deepEqual(mine.map(t => [t.fn, t.hour]), [['wcollectDaily', 7], ['wcollectDaily', 9]]);
  assert.ok(env.triggers.some(t => t.fn === 'wsyncPull'), '시트 동기화 트리거는 그대로 둬야 합니다');
  assert.match(env.run('wcollectCheck()'), /자동 실행 2개 켜짐/);
});

test('wcollectDaily — 오늘 이미 수집했으면 건너뛰고, 아니면 수집', () => {
  const env = createEnv({ data: { inbox: [], inboxDone: {}, collectedAt: Date.now() - 60e3 },
    fetch: () => [200, rss([['대학 취업 프로그램', 'https://n/x', '대학저널']])] });
  assert.equal(env.run('wcollectDaily()'), 0);
  assert.equal(env.puts, 0);
  env.db.data.collectedAt = Date.now() - 3 * 864e5;
  assert.equal(env.run('wcollectDaily()'), 1);
  assert.equal(env.puts, 1);
});

const INST = ['한국고용정보원', '한국노동연구원', '한국직업능력연구원', '한국교육개발원', '한국청소년정책연구원'];
const instHits = env => INST.filter(n => env.urls.some(u => decodeURIComponent(u).indexOf('"' + n + '"') > -1));

test('연구기관은 토 · 일에만 · 키워드 · 전문지 · 보도자료는 매일', () => {
  // 2026-10-02 금 / 10-03 토 / 10-04 일 / 10-05 월 — 한국 시각 07:00
  const days = [['금', 2, false], ['토', 3, true], ['일', 4, true], ['월', 5, false]];
  for (const [name, dd, weekend] of days) {
    const t = Date.UTC(2026, 9, dd, 7) - 9 * 3600e3;
    const env = createEnv({ data: { inbox: [], inboxDone: {} }, fetch: () => [200, rss([])] });
    env.run(`Date.now = () => ${t}`);
    env.run('wcollectRun()');
    const dec = env.urls.map(decodeURIComponent);
    assert.equal(instHits(env).length, weekend ? INST.length : 0, name + '요일 연구기관');
    assert.ok(dec.some(u => u.indexOf('대학 취업 프로그램 운영') > -1), name + '요일 키워드 뉴스');
    assert.ok(dec.some(u => u.indexOf('site:korea.kr') > -1), name + '요일 보도자료');
    assert.equal(mediaHits(env).length, 1, name + '요일 전문지');
  }
});

test('가져오기가 전부 실패하면 오류로 끝나고 수집 시각을 남기지 않음 (9시 재시도 가능)', () => {
  const env = createEnv({ data: { inbox: [], inboxDone: {} }, fetch: () => [503, ''] });
  assert.throws(() => env.run('wcollectRun()'), /하나도 가져오지 못했습니다/);
  assert.equal(env.puts, 0);
  assert.equal(env.db.data.collectedAt, undefined);
});
