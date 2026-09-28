// 서재 — 연도별 목록이 기본으로 접혀 있고, 연도별로 펼쳐 볼 수 있는지.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./load-app');

const book = (id, t, end) => ({ id, t, st: 'd', cat: '일반교양', end, start: end, u: 1 });
const seed = {
  books: [book('b1', '책 2024-가', '2024-03-01'), book('b2', '책 2024-나', '2024-05-01'),
          book('b3', '책 2025-가', '2025-02-01'), book('b4', '책 2026-가', '2026-01-10')],
  bookSeed: 1
};

test('서재 — 기본은 모두 접힘, 연도·모두 펼치기·막대·검색으로 보기', async () => {
  const w = await loadApp(seed);
  try {
    const d = w.document;
    const body = () => d.getElementById('s12Body');
    const titles = () => [...body().querySelectorAll('.bk .bt1')].map(x => x.textContent);
    const head = y => body().querySelector(`.grp[data-y="${y}"]`);
    const btn = label => [...body().querySelectorAll('button')].find(b => b.textContent === label);

    d.getElementById('libBtn').click();
    assert.deepEqual(titles(), [], '처음에는 책이 보이지 않아야 합니다');
    assert.ok(head('2024') && head('2025') && head('2026'), '연도 제목은 보여야 합니다');
    assert.match(head('2024').textContent, /2024년\s*2권/);

    head('2024').click();
    assert.deepEqual(titles().sort(), ['책 2024-가', '책 2024-나']);
    head('2024').click();
    assert.deepEqual(titles(), []);

    btn('모두 펼치기').click();
    assert.equal(titles().length, 4);
    btn('모두 접기').click();
    assert.deepEqual(titles(), []);

    d.querySelector('.lyear [data-y="2025"]').click();
    assert.deepEqual(titles(), ['책 2025-가'], '막대를 누르면 그 해만 펼쳐져야 합니다');

    const sr = body().querySelector('.lsearch');
    sr.value = '가'; sr.dispatchEvent(new w.Event('input'));
    assert.equal(titles().length, 3, '검색 중에는 결과가 모두 보여야 합니다');
  } finally { w.close(); }
});
