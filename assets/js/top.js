// TIMSUN TOP: シリーズ一覧・注目製品・取扱店数・ニュース
import { fetchCatalog } from './cj-api.js';
import { SERIES, PATTERNS, NEWS, NEWS_CAT, baseOf, sizeOf, parseSize } from './data.js';
import { esc, yen, reveal } from './site.js';

const PREFS = ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島', '東京', '神奈川', '埼玉', '千葉', '茨城', '栃木', '群馬', '山梨', '新潟', '長野', '富山', '石川', '福井', '愛知', '岐阜', '静岡', '三重', '大阪', '兵庫', '京都', '滋賀', '奈良', '和歌山', '鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知', '福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'];

function renderSeries(counts) {
  document.getElementById('seriesGrid').innerHTML = SERIES.map((s, i) => `
    <a class="sr-card rv" href="/products#${s.id}">
      <span class="ph${s.img ? '' : ' biz'}">${s.img ? `<img src="${s.img}" alt="" width="346" height="500" loading="lazy">` : 'JAPAN<br>ONLY'}</span>
      <span>
        <span class="no">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(s.en)}</h3>
        <span class="ja">${esc(s.ja)}</span>
        <span class="cnt">${counts ? `${counts[s.id] || 0}パターン` : ''}</span>
      </span>
      ${s.jpOnly ? '<span class="tag jp">日本独自</span>' : ''}
    </a>`).join('');
  reveal(document.querySelectorAll('#seriesGrid .rv'));
}

async function renderCatalogParts() {
  renderSeries(null);
  try {
    const items = await fetchCatalog();
    // シリーズごとのパターン数
    const pats = {};
    for (const h of items) {
      const b = baseOf(h.name); const p = b && PATTERNS[b];
      if (p) (pats[p.s] ??= new Set()).add(b);
    }
    renderSeries(Object.fromEntries(Object.entries(pats).map(([k, v]) => [k, v.size])));
    fillSizeSelects(items);
    // 注目製品(TS720)のサイズ数と価格帯
    const ts = items.filter((h) => baseOf(h.name) === 'TS720' && !/^【セット品】/.test(h.name));
    const prices = ts.map((h) => h.price?.regular?.pc?.taxIn).filter(Boolean);
    const spec = document.getElementById('tsSpec');
    if (ts.length) spec.querySelector('[data-k="sizes"]').textContent = `${ts.length}サイズ`;
    if (prices.length) spec.querySelector('[data-k="price"]').textContent = `${yen(Math.min(...prices))}〜(税込・1本)`;
  } catch (e) { console.error(e); }
}

async function renderShops() {
  const sel = document.getElementById('pref');
  sel.insertAdjacentHTML('beforeend', PREFS.map((p) => `<option value="${p}">${p}</option>`).join(''));
  try {
    const shops = await fetch(new URL('../data/shops.json', import.meta.url)).then((r) => r.json());
    const bs = document.getElementById('bnShops'); if (bs) bs.textContent = String(Math.floor(shops.length / 10) * 10);
    const by = shops.reduce((m, s) => ((m[s.pref] = (m[s.pref] || 0) + 1), m), {});
    sel.querySelectorAll('option[value]').forEach((o) => { if (o.value) o.textContent = `${o.value}(${by[o.value] || 0}店)`; });
  } catch (e) { /* 既定の表示のまま */ }
}

// ヒーロー下部の帯: 最新ニュース1件
function renderHeroNews() {
  const n = NEWS[0]; const a = document.getElementById('heroNews'); if (!n || !a) return;
  a.href = n.u; a.target = '_blank'; a.rel = 'noopener';
  a.querySelector('time').textContent = n.d;
  a.querySelector('.hb-title').textContent = n.t;
}

function renderNews() {
  document.getElementById('newsList').innerHTML = NEWS.slice(0, 4).map((n) => `
    <li><a href="${esc(n.u)}" target="_blank" rel="noopener">
      <time>${esc(n.d)}</time><span class="tag${n.c === 'product' ? ' shg' : ' muted'}">${NEWS_CAT[n.c]}</span><span class="t">${esc(n.t)}</span>
    </a></li>`).join('');
}

// ヒーロー映像: 一時停止ボタン。動きを減らす設定なら止めておく。画面外では停止
const video = document.querySelector('.hero-video');
const pause = document.querySelector('.hero-pause');
if (video && pause) {
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sync = () => { pause.setAttribute('aria-pressed', String(paused)); pause.setAttribute('aria-label', paused ? '映像を再生' : '映像を一時停止'); };
  if (paused) video.pause();
  sync();
  pause.addEventListener('click', () => { paused = !paused; paused ? video.pause() : video.play().catch(() => {}); sync(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) video.pause(); else if (!paused) video.play().catch(() => {}); }, { threshold: 0.2 }).observe(video);
  }
}

// フルサイズバナー: 6秒ごとに自動で切り替え。前後・ドット・一時停止・スワイプ。
// 動きを減らす設定では自動再生しない。マウスを乗せている間・フォーカス中は止める。
(function banners() {
  const track = document.getElementById('bnTrack'); if (!track) return;
  const slides = [...track.children]; const dots = document.getElementById('bnDots');
  const pauseBtn = document.querySelector('.bn-pause');
  let i = 0, timer = null, stopped = matchMedia('(prefers-reduced-motion: reduce)').matches, hover = false;
  dots.innerHTML = slides.map((_, k) => `<button type="button" aria-label="${k + 1}枚目を表示"></button>`).join('');
  const go = (n) => {
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-100 * i}%)`;
    slides.forEach((s, k) => { const on = k === i; s.classList.toggle('is-active', on); s.setAttribute('aria-hidden', String(!on)); s.tabIndex = on ? 0 : -1; });
    [...dots.children].forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
  };
  const play = () => { clearInterval(timer); if (!stopped && !hover) timer = setInterval(() => go(i + 1), 6000); };
  const syncPause = () => { pauseBtn.setAttribute('aria-pressed', String(stopped)); pauseBtn.setAttribute('aria-label', stopped ? '自動再生を開始' : '自動再生を停止'); };
  document.querySelector('.bn-prev').addEventListener('click', () => { go(i - 1); play(); });
  document.querySelector('.bn-next').addEventListener('click', () => { go(i + 1); play(); });
  dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { go([...dots.children].indexOf(b)); play(); } });
  pauseBtn.addEventListener('click', () => { stopped = !stopped; syncPause(); play(); });
  const root = track.closest('.banners');
  root.addEventListener('mouseenter', () => { hover = true; play(); });
  root.addEventListener('mouseleave', () => { hover = false; play(); });
  root.addEventListener('focusin', () => { hover = true; play(); });
  root.addEventListener('focusout', () => { hover = false; play(); });
  let x0 = null;
  track.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); play(); } x0 = null; });
  go(0); syncPause(); play();
})();

// 検索パネルのタブ
const tabs = [...document.querySelectorAll('.finder-tabs [role=tab]')];
tabs.forEach((t) => t.addEventListener('click', () => {
  tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', String(on)); document.getElementById(x.getAttribute('aria-controls')).hidden = !on; });
}));

// サイズ検索の選択肢(TIMSUNの取扱サイズから作る)
function fillSizeSelects(items) {
  const sizes = items.map(sizeOf).filter(Boolean).map(parseSize).filter(Boolean);
  const uniq = (k) => [...new Set(sizes.map((x) => x[k]).filter(Boolean))].sort((a, b) => parseFloat(a) - parseFloat(b));
  const fill = (id, list) => document.getElementById(id).insertAdjacentHTML('beforeend', list.map((v) => `<option value="${v}">${v}</option>`).join(''));
  fill('sw', uniq('w')); fill('sa', uniq('a')); fill('sr', uniq('r'));
}

renderCatalogParts();
renderShops();
renderNews();
renderHeroNews();
