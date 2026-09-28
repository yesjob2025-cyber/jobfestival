/**
 * 하루 계획 ↔ 구글 시트 '주간업무' 탭 동기화 (업무만, 개인 제외)
 *
 * ▸ 이 파일은 기존 스크립트와 섞여도 안전하도록 모든 이름에 wsync 를 붙였습니다.
 * ▸ 다른 탭(사업총괄 · 비용정리 · 초기의뢰 등)은 전혀 건드리지 않습니다.
 * ▸ 설치할 때도 이 스크립트가 만든 자동 실행만 새로 만들고, 기존 설정은 그대로 둡니다.
 *
 * 설정: 프로젝트 설정 → 스크립트 속성에 4개 추가
 *   SB_URL  https://auymgwqonzqogqfwbnxu.supabase.co
 *   SB_KEY  sb_publishable_3hHaYxoSr39iBac-BR1P5Q_9xe_0aGG
 *   SB_ID   funnyrak@jobfestival.co.kr
 *   SB_PW   (앱 비밀번호)
 * 그다음 함수 목록에서 wsyncSetup 을 골라 ▶ 실행
 */

const WSYNC = {
  SHEET: '주간업무',
  HEAD: ['ID', '사업', '단계', '업무', '등급', '완료', '완료일', '삭제'],
  COL: { id: 1, prj: 2, ph: 3, task: 4, lv: 5, done: 6, date: 7, del: 8 },
  KEEP_DONE_DAYS: 14,
  TZ: 'Asia/Seoul',
  PRJ_MARK: '▶ 사업 전체',
  HANDLERS: ['wsyncOnEdit', 'wsyncPull', 'wsyncMenu']
};

/* ---------- 처음 설정 ---------- */
function wsyncSetup() {
  const ss = SpreadsheetApp.getActive();
  const W = WSYNC, C = W.COL;
  let sh = ss.getSheetByName(W.SHEET);
  if (!sh) sh = ss.insertSheet(W.SHEET);
  sh.getRange(1, 1, 1, W.HEAD.length).setValues([W.HEAD])
    .setFontWeight('bold').setBackground('#171C26').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  [[C.id, 60], [C.prj, 220], [C.ph, 70], [C.task, 300], [C.lv, 55], [C.done, 50], [C.date, 90], [C.del, 50]]
    .forEach(([c, w]) => sh.setColumnWidth(c, w));

  // 이 스크립트가 만든 자동 실행만 지우고 다시 만들기 (기존 폼·스크립트 트리거는 유지)
  ScriptApp.getProjectTriggers()
    .filter(t => W.HANDLERS.indexOf(t.getHandlerFunction()) > -1)
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('wsyncOnEdit').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('wsyncPull').timeBased().everyMinutes(5).create();
  ScriptApp.newTrigger('wsyncMenu').forSpreadsheet(ss).onOpen().create();

  wsyncGet_();
  wsyncPull();
  wsyncMenu();
  ss.toast('설정 완료. 5분마다 앱의 변경을 가져오고, 시트에서 고치면 바로 앱으로 보냅니다.', '주간업무 동기화', 8);
}
function wsyncMenu() {
  SpreadsheetApp.getUi().createMenu('주간업무 동기화')
    .addItem('지금 앱에서 가져오기', 'wsyncPull')
    .addItem('지금 앱으로 보내기', 'wsyncPush')
    .addToUi();
}

/* ---------- Supabase ---------- */
function wsyncCfg_() {
  const p = PropertiesService.getScriptProperties().getProperties();
  ['SB_URL', 'SB_KEY', 'SB_ID', 'SB_PW'].forEach(k => {
    if (!p[k]) throw new Error('스크립트 속성 ' + k + ' 이(가) 비어 있습니다.');
  });
  return p;
}
function wsyncToken_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('wsync_tok');
  if (hit) return JSON.parse(hit);
  const c = wsyncCfg_();
  const res = UrlFetchApp.fetch(c.SB_URL + '/auth/v1/token?grant_type=password', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { apikey: c.SB_KEY },
    payload: JSON.stringify({ email: c.SB_ID, password: c.SB_PW })
  });
  if (res.getResponseCode() !== 200) throw new Error('로그인 실패 — SB_ID, SB_PW 를 확인하세요.');
  const j = JSON.parse(res.getContentText());
  const tok = { t: j.access_token, uid: j.user.id };
  cache.put('wsync_tok', JSON.stringify(tok), Math.max(60, (j.expires_in || 3600) - 120));
  return tok;
}
function wsyncHdr_(tok) { return { apikey: wsyncCfg_().SB_KEY, Authorization: 'Bearer ' + tok.t }; }
function wsyncGet_() {
  const c = wsyncCfg_(), tok = wsyncToken_();
  const res = UrlFetchApp.fetch(c.SB_URL + '/rest/v1/plans?select=data&user_id=eq.' + tok.uid,
    { headers: wsyncHdr_(tok), muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('불러오기 실패: ' + res.getContentText());
  const rows = JSON.parse(res.getContentText());
  if (!rows.length) throw new Error('앱에 저장된 기록이 없습니다. 앱에서 한 번 로그인해 주세요.');
  const d = rows[0].data || {};
  d.todos = d.todos || []; d.gone = d.gone || {};
  return d;
}
function wsyncPut_(data) {
  const c = wsyncCfg_(), tok = wsyncToken_();
  const h = wsyncHdr_(tok); h.Prefer = 'return=minimal';
  const res = UrlFetchApp.fetch(c.SB_URL + '/rest/v1/plans?user_id=eq.' + tok.uid, {
    method: 'patch', contentType: 'application/json', headers: h, muteHttpExceptions: true,
    payload: JSON.stringify({ data: data, updated_at: new Date().toISOString() })
  });
  if (res.getResponseCode() >= 300) throw new Error('저장 실패: ' + res.getContentText());
}

/* ---------- 앱 → 시트 ---------- */
function wsyncPull() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try { wsyncWrite_(wsyncGet_(), true); } finally { lock.releaseLock(); }
}
function wsyncToday_() { return Utilities.formatDate(new Date(), WSYNC.TZ, 'yyyy-MM-dd'); }
function wsyncIsWork_(t) { return (t.cat || '업무') === '업무'; }

function wsyncWrite_(d, keepTyped) {
  const W = WSYNC, C = W.COL, N = W.HEAD.length;
  const sh = SpreadsheetApp.getActive().getSheetByName(W.SHEET);
  const last = sh.getLastRow();

  // ID 없이 입력 중인 줄 보존
  const pending = [];
  if (last > 1) {
    sh.getRange(2, 1, last - 1, N).getValues().forEach(r => {
      const typed = !r[C.id - 1] && (r[C.prj - 1] || r[C.task - 1]);
      if (typed && (keepTyped || !r[C.task - 1])) pending.push(r);
    });
  }

  const cut = Utilities.formatDate(new Date(Date.now() - W.KEEP_DONE_DAYS * 864e5), W.TZ, 'yyyy-MM-dd');
  const show = t => !t.done || (t.doneAt && t.doneAt >= cut);
  const todos = d.todos.filter(wsyncIsWork_);
  const kids = id => todos.filter(t => t.pid === id);
  const out = [];
  todos.filter(t => !t.pid).forEach(p => {
    const all = kids(p.id), ks = all.filter(show);
    if (!show(p) && !ks.length) return;
    if (!all.length) {
      out.push([p.id, '', '', p.t, p.lv || '일상', !!p.done, p.doneAt || '', false]);
      return;
    }
    out.push([p.id, p.t, '', W.PRJ_MARK, p.lv || '일상', !!p.done, p.doneAt || '', false]);
    const order = [];
    all.forEach(k => { const ph = k.ph || ''; if (order.indexOf(ph) < 0) order.push(ph); });
    order.forEach(ph => ks.filter(k => (k.ph || '') === ph).forEach(k => {
      out.push([k.id, p.t, k.ph || '', k.t, k.lv || '일상', !!k.done, k.doneAt || '', false]);
    }));
  });
  pending.forEach(r => out.push(r));

  if (last > 1) sh.getRange(2, 1, last - 1, N).clearContent().clearDataValidations();
  const n = out.length, pad = n + 20;
  if (n) sh.getRange(2, 1, n, N).setValues(out);

  sh.getRange(2, C.done, pad, 1).insertCheckboxes();
  sh.getRange(2, C.del, pad, 1).insertCheckboxes();
  sh.getRange(2, C.lv, pad, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['중요', '일상'], true).build());
  sh.getRange(2, C.id, pad, 1).setFontColor('#B6BCC6');
  sh.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$F2=TRUE')
      .setFontColor('#9AA0AA').setStrikethrough(true).setRanges([sh.getRange(2, 2, pad, 6)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$D2="' + W.PRJ_MARK + '"')
      .setBold(true).setBackground('#F4F4F0').setRanges([sh.getRange(2, 2, pad, 7)]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($E2="중요",$F2=FALSE)')
      .setFontColor('#9B2C3B').setRanges([sh.getRange(2, C.lv, pad, 1)]).build()
  ]);
  sh.getRange(1, 1).setNote('마지막 동기화 ' + Utilities.formatDate(new Date(), W.TZ, 'MM-dd HH:mm'));
}

/* ---------- 시트 → 앱 ---------- */
function wsyncOnEdit(e) {
  if (!e || !e.range || e.range.getSheet().getName() !== WSYNC.SHEET || e.range.getRow() < 2) return;
  wsyncPush();
}
function wsyncPush() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = wsyncGet_();
    if (wsyncApply_(d)) wsyncPut_(d);
    wsyncWrite_(d, false);
  } finally { lock.releaseLock(); }
}
function wsyncApply_(d) {
  const W = WSYNC, C = W.COL, N = W.HEAD.length;
  const sh = SpreadsheetApp.getActive().getSheetByName(W.SHEET);
  const last = sh.getLastRow();
  if (last < 2) return false;
  const rows = sh.getRange(2, 1, last - 1, N).getValues();
  const now = Date.now(), today = wsyncToday_();
  const byId = {}; d.todos.forEach(t => byId[t.id] = t);
  let changed = false;
  const touch = t => { t.u = now; changed = true; };
  let seq = 0;
  const newId = () => 't' + now.toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 4);

  rows.forEach(r => {
    const id = String(r[C.id - 1] || '').trim();
    const prj = String(r[C.prj - 1] || '').trim();
    const ph = String(r[C.ph - 1] || '').trim();
    const task = String(r[C.task - 1] || '').trim();
    const lv = r[C.lv - 1] === '중요' ? '중요' : '일상';
    const done = r[C.done - 1] === true;
    const del = r[C.del - 1] === true;

    if (id) {
      const t = byId[id];
      if (!t || !wsyncIsWork_(t)) return;             // 개인 업무는 건드리지 않음
      if (del) {
        const kill = [id].concat(d.todos.filter(k => k.pid === id).map(k => k.id));
        kill.forEach(k => d.gone[k] = now);
        d.todos = d.todos.filter(k => kill.indexOf(k.id) < 0);
        changed = true; return;
      }
      const isPrj = !t.pid;
      const name = isPrj ? (task && task !== W.PRJ_MARK ? task : prj) : task;
      if (name && name !== t.t) { t.t = name; touch(t); }
      if (!isPrj && ph !== (t.ph || '')) { if (ph) t.ph = ph; else delete t.ph; touch(t); }
      if (lv !== (t.lv || '일상')) { t.lv = lv; touch(t); }
      if (done !== !!t.done) { t.done = done; t.doneAt = done ? today : null; touch(t); }
      return;
    }

    // 새 줄 — '업무' 칸이 채워져야 추가 (구분은 항상 업무)
    if (!task || del || task === W.PRJ_MARK) return;
    if (!prj) {
      d.todos.push({ id: newId(), t: task, cat: '업무', lv, pid: null, done, doneAt: done ? today : null, u: now });
      changed = true; return;
    }
    let parent = d.todos.find(t => !t.pid && wsyncIsWork_(t) && t.t === prj && !t.done);
    if (!parent) {
      parent = { id: newId(), t: prj, cat: '업무', lv: '중요', pid: null, done: false, u: now };
      d.todos.push(parent);
    }
    const kid = { id: newId(), t: task, cat: '업무', lv, pid: parent.id, done, doneAt: done ? today : null, u: now };
    if (ph) kid.ph = ph;
    d.todos.push(kid);
    changed = true;
  });
  return changed;
}
