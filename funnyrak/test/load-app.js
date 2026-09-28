// 앱(index.html)을 jsdom 에서 '로컬 모드'로 띄우는 도우미.
// supabase·폰트는 떼어내고 SB_URL 을 비워 서버 없이 동작하게 한다.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const APP = path.join(__dirname, '..', '..', 'public', 'funnyrak', 'index.html');
const SB_LINE = "const SB_URL = 'https://auymgwqonzqogqfwbnxu.supabase.co';";

function appHtml() {
  return fs.readFileSync(APP, 'utf8');
}

function appScript() {
  const m = appHtml().match(/<script>([\s\S]*)<\/script>\s*<\/body>/);
  if (!m) throw new Error('index.html 에서 본문 <script> 를 찾지 못했습니다');
  return m[1];
}

function loadApp(seed, { wait = 400 } = {}) {
  const src = appHtml();
  if (src.indexOf(SB_LINE) < 0) throw new Error('SB_URL 줄이 바뀌었습니다. test/load-app.js 의 SB_LINE 을 맞춰주세요');
  const html = src
    .replace(/<script src="https:\/\/cdn[^>]*><\/script>/, '')
    .replace(/<link[^>]*>/g, '')
    .replace(SB_LINE, "const SB_URL = '';");
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    url: 'https://x/',
    beforeParse(w) {
      if (seed) w.localStorage.setItem('daily-plan-v11', JSON.stringify(seed));
      w.alert = () => {};
      w.confirm = () => true;
      w.scrollTo = () => {};
    }
  });
  const w = dom.window;
  return new Promise(res => setTimeout(() => res(w), wait));
}

module.exports = { APP, appHtml, appScript, loadApp };
