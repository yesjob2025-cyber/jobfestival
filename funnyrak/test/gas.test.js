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
