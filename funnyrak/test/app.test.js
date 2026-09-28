// 하루 계획 앱(index.html) 기본 검사 — 작업서 4장 '반드시 지킬 규칙'을 자동으로 확인한다.
const test = require('node:test');
const assert = require('node:assert/strict');
const { appHtml, appScript, loadApp } = require('./load-app');
const ROUTINE_KEYS = require('./fixtures/routine-keys.json');

test('스크립트 문법 오류 없음', () => {
  assert.doesNotThrow(() => new Function(appScript()));
});

test('규칙 1 — 저장 키는 daily-plan-v11', () => {
  assert.match(appScript(), /const KEY='daily-plan-v11';/);
});

test('규칙 5 — 외부 스크립트는 supabase-js 하나뿐', () => {
  const srcs = [...appHtml().matchAll(/<script\s+src="([^"]+)"/g)].map(m => m[1]);
  assert.equal(srcs.length, 1, '외부 스크립트: ' + srcs.join(', '));
  assert.match(srcs[0], /@supabase\/supabase-js/);
});

test('규칙 3 — 기본 루틴 항목의 k 가 사라지지 않음', async () => {
  const w = await loadApp(null);
  try {
    const r = w.eval('defaultRoutine(99)');
    const now = new Set();
    for (const d of Object.keys(r)) for (const b of Object.keys(r[d])) r[d][b].forEach(x => now.add(d + '/' + b + '/' + (x.k || x.n)));
    const missing = ROUTINE_KEYS.filter(k => !now.has(k));
    assert.deepEqual(missing, [], '과거 기록이 끊길 수 있는 k 변경: ' + missing.join(', ') +
      '\n의도한 변경이면 migrate() 에 이름 변경을 넣고 test/fixtures/routine-keys.json 을 고치세요');
  } finally { w.close(); }
});

test('빈 상태로 열면 화면이 그려지고 로컬에 저장됨', async () => {
  const w = await loadApp(null, { wait: 1200 });
  try {
    const text = w.document.body.textContent;
    assert.match(text, /루틴/);
    assert.ok(w.eval('ST.routine && ST.routine.wd'), '기본 루틴이 채워져야 합니다');
    assert.ok(w.localStorage.getItem('daily-plan-v11'), '저장 키로 기록이 남아야 합니다');
  } finally { w.close(); }
});

test('기존 기록을 불러와도 체크·할 일이 유지됨 (마이그레이션 안전)', async () => {
  const seed = {
    log: { '2026-09-01': ['1-아침-아침기도'] },
    todos: [{ id: 'a1', t: '제안서 초안', cat: '업무', lv: '중요', pid: null, done: false, u: 1 }],
    picks: {}, weekNote: {}, reps: {}, rec: {}, extra: {}
  };
  const w = await loadApp(seed);
  try {
    assert.deepEqual(JSON.parse(w.eval("JSON.stringify(ST.log['2026-09-01'])")), ['1-아침-아침기도']);
    assert.equal(w.eval("ST.todos.find(t=>t.id==='a1').t"), '제안서 초안');
  } finally { w.close(); }
});

test('규칙 4 — mergeTodos: 최신(u) 우선 · 삭제 기록 · 수집함 처리 반영', async () => {
  const w = await loadApp(null);
  try {
    w.eval(`
      ST.todos=[{id:'x',t:'앱에서 고침',u:200},{id:'y',t:'앱에서 지움',u:100}];
      ST.gone={y:150};
      ST.inbox=[{id:'n1',t:'기사1',at:1}];ST.inboxDone={n2:5};
    `);
    const changed = w.eval(`mergeTodos({
      todos:[{id:'x',t:'시트 옛값',u:100},{id:'y',t:'앱에서 지움',u:100},{id:'z',t:'시트에서 추가',u:300}],
      gone:{},
      inbox:[{id:'n2',t:'이미 버림',at:3},{id:'n3',t:'새 기사',at:2}],inboxDone:{},collectedAt:9
    })`);
    assert.equal(changed, true);
    const todos = JSON.parse(w.eval('JSON.stringify(ST.todos)'));
    assert.deepEqual(todos.map(t => [t.id, t.t]), [['x', '앱에서 고침'], ['z', '시트에서 추가']]);
    assert.deepEqual(JSON.parse(w.eval('JSON.stringify(ST.inbox.map(x=>x.id))')), ['n3', 'n1']);
    assert.equal(w.eval('ST.collectedAt'), 9);
  } finally { w.close(); }
});
