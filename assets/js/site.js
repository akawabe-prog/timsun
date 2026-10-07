// TIMSUN 共通: スマホメニュー・スクロール表示
const menu = document.querySelector('.menu');
const gnav = document.getElementById('gnav');
if (menu && gnav) {
  const set = (open) => { menu.setAttribute('aria-expanded', String(open)); gnav.classList.toggle('open', open); };
  menu.addEventListener('click', () => set(menu.getAttribute('aria-expanded') !== 'true'));
  gnav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

// ヘッダー: 最初のセクションを過ぎたら白背景に(スマホのメニューを開いているときも白)
const hd = document.querySelector('.hd');
const first = document.querySelector('main > *:not(.sr)');
if (hd) {
  const sync = () => {
    const limit = first ? first.offsetTop + first.offsetHeight - hd.offsetHeight : 0;
    hd.classList.toggle('solid', scrollY > limit - 1);
  };
  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  sync();
}

// ページ内アンカーメニュー: 見えているセクションに印を付ける
const alinks = [...document.querySelectorAll('.anav a[href^="#"]')];
if (alinks.length && 'IntersectionObserver' in window) {
  const map = new Map(alinks.map((a) => [document.querySelector(a.getAttribute('href')), a]).filter(([el]) => el));
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    alinks.forEach((a) => a.classList.toggle('on', a === map.get(e.target)));
    const on = map.get(e.target); const ul = on?.closest('ul');
    if (ul && ul.scrollWidth > ul.clientWidth) ul.scrollTo({ left: on.offsetLeft - ul.clientWidth / 2 + on.offsetWidth / 2, behavior: 'smooth' });
  }), { rootMargin: '-140px 0px -55% 0px' });
  map.forEach((_, el) => spy.observe(el));
}

// スクロールで表示(IntersectionObserver が無い環境でも必ず表示される)
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' })
  : null;
export function reveal(nodes) { nodes.forEach((n) => (io ? io.observe(n) : n.classList.add('in'))); }
reveal(document.querySelectorAll('.rv'));
setTimeout(() => document.querySelectorAll('.rv:not(.in)').forEach((n) => { if (n.getBoundingClientRect().top < innerHeight) n.classList.add('in'); }), 1200);

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const yen = (n) => (n == null ? '' : `¥${Number(n).toLocaleString('ja-JP')}`);
export const IMG = 'https://img.customjapan.net';
export const ITEM_URL = (id) => `https://moto.customjapan.net/i/${id}`;
export const STORE_URL = 'https://www.customjapan.net/search?filter-maker=490&maker=490';

// イベントのサムネイルカード(TOPとニュースページで共通)。写真がないイベントは英語名の文字サムネイル
export const eventCard = (n) => `
  <a class="ev-card" href="${esc(n.u)}" target="_blank" rel="noopener">
    <span class="ev-ph${n.img ? '' : ' ev-type'}">${n.img
      ? `<img src="${esc(n.img)}" alt="" width="960" height="540" loading="lazy" decoding="async">`
      : `<span class="ev-type-in"><span class="ev-type-k">EVENT</span><b>${esc(n.en || '')}</b></span>`}</span>
    <span class="ev-meta"><time>${esc(n.d)}</time><b>${esc(n.t)}</b></span>
  </a>`;
