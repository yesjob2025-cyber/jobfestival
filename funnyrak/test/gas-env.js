// Apps Script 서비스 흉내(mock). 두 .gs 파일을 한 프로젝트처럼 vm 에 올리고,
// Supabase 'plans' 행은 메모리 객체(env.db)로, 스프레드시트는 2차원 배열로 대신한다.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');

const GAS = path.join(__dirname, '..', 'gas');

function fmtDate(d, tz, f) {
  const p = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(d).forEach(x => { p[x.type] = x.value; });
  return f.replace('yyyy', p.year).replace('MM', p.month).replace('dd', p.day)
    .replace('HH', p.hour === '24' ? '00' : p.hour).replace('mm', p.minute);
}

function makeSheet(name) {
  const grid = [];
  const sh = {
    grid, name,
    getName: () => name,
    getLastRow: () => { for (let i = grid.length; i > 0; i--) if ((grid[i - 1] || []).some(v => v !== '' && v !== false && v != null)) return i; return 0; },
    getRange(r, c, nr = 1, nc = 1) {
      const rng = {
        getRow: () => r,
        getSheet: () => sh,
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => {
          const v = (grid[r - 1 + i] || [])[c - 1 + j]; return v === undefined ? '' : v;
        })),
        setValues(vals) {
          vals.forEach((row, i) => row.forEach((v, j) => { (grid[r - 1 + i] = grid[r - 1 + i] || [])[c - 1 + j] = v; }));
          return rng;
        },
        clearContent() { for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) if (grid[r - 1 + i]) grid[r - 1 + i][c - 1 + j] = ''; return rng; },
        insertCheckboxes() {
          for (let i = 0; i < nr; i++) { const row = (grid[r - 1 + i] = grid[r - 1 + i] || []); if (row[c - 1] === undefined || row[c - 1] === '') row[c - 1] = false; }
          return rng;
        }
      };
      ['setFontWeight', 'setBackground', 'setFontColor', 'setNote', 'setDataValidation', 'clearDataValidations']
        .forEach(k => { rng[k] = () => rng; });
      return rng;
    },
    setFrozenRows() {}, setColumnWidth() {}, setConditionalFormatRules() {}
  };
  return sh;
}

function chain() { const o = new Proxy({}, { get: (_, k) => k === 'build' ? () => ({}) : () => o }); return o; }

function xmlEl(el) {
  return {
    getChild: n => { const c = [...el.children].find(x => x.tagName === n); return c ? xmlEl(c) : null; },
    getChildren: n => [...el.children].filter(x => x.tagName === n).map(xmlEl),
    getText: () => el.textContent,
    getRootElement: () => xmlEl(el)
  };
}

function createEnv({ data = {}, fetch } = {}) {
  const env = { db: { data: JSON.parse(JSON.stringify(data)) }, puts: 0, logs: [], sheets: {} };
  const ss = {
    getSheetByName: n => env.sheets[n] || null,
    insertSheet: n => (env.sheets[n] = makeSheet(n)),
    toast() {}
  };
  const props = { SB_URL: 'https://sb.test', SB_KEY: 'k', SB_ID: 'me@test', SB_PW: 'pw' };
  const cache = {};
  const domParser = new (new JSDOM('').window.DOMParser)();

  const UrlFetchApp = {
    fetch(url, opt = {}) {
      const res = (code, body) => ({ getResponseCode: () => code, getContentText: () => body });
      if (url.startsWith('https://sb.test/auth/')) return res(200, JSON.stringify({ access_token: 't', user: { id: 'u1' }, expires_in: 3600 }));
      if (url.startsWith('https://sb.test/rest/v1/plans')) {
        if ((opt.method || 'get') === 'patch') { env.db = JSON.parse(opt.payload); env.puts++; return res(204, ''); }
        return res(200, JSON.stringify([{ data: JSON.parse(JSON.stringify(env.db.data)) }]));
      }
      if (fetch) return res(...fetch(url));
      return res(404, '');
    }
  };

  const ctx = {
    console: { log: m => env.logs.push(m), warn: m => env.logs.push(m) },
    UrlFetchApp,
    SpreadsheetApp: { getActive: () => ss, getUi: () => chain(), newDataValidation: chain, newConditionalFormatRule: chain },
    ScriptApp: { getProjectTriggers: () => [], deleteTrigger() {}, newTrigger: () => chain() },
    PropertiesService: { getScriptProperties: () => ({ getProperties: () => ({ ...props }) }) },
    CacheService: { getScriptCache: () => ({ get: k => cache[k] || null, put: (k, v) => { cache[k] = v; } }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock() {} }) },
    Utilities: {
      formatDate: fmtDate,
      sleep() {},
      DigestAlgorithm: { MD5: 'md5' },
      computeDigest: (alg, s) => [...crypto.createHash(alg).update(String(s)).digest()],
      base64EncodeWebSafe: b => Buffer.from(b.map(x => x & 255)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
    },
    XmlService: { parse: s => xmlEl(domParser.parseFromString(s, 'text/xml').documentElement) }
  };
  vm.createContext(ctx);
  for (const f of fs.readdirSync(GAS).filter(f => f.endsWith('.gs')).sort()) {
    vm.runInContext(fs.readFileSync(path.join(GAS, f), 'utf8'), ctx, { filename: f });
  }
  env.ctx = ctx;
  env.run = code => vm.runInContext(code, ctx);
  env.sheet = name => env.sheets[name] || ss.insertSheet(name);
  return env;
}

module.exports = { createEnv };
