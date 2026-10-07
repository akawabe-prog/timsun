// TIMSUN TOP: 注目のタイヤ・シリーズ一覧・注目製品・使い方から選ぶ・取扱店数・ニュース・読みもの
import { fetchCatalog, fetchFitmentIndex, dataAsOf } from './cj-api.js';
import { SERIES, PATTERNS, NEWS, NEWS_CAT, ARTICLES, USECASES, FEATURED, NEW_PATTERNS, baseOf, sizeOf, parseSize, isSHG } from './data.js';
import { esc, yen, reveal, IMG, eventCard } from './site.js';
import { mountFitSelect } from './fitselect.js';

// ── 注目のタイヤ(Featured Tyres): 型番ごとのカードを横に流す。売れ筋データがないため「人気」バッジは付けない ──
const fmtDate = (d) => { const [y, m, day] = d.split('-').map(Number); return `${y}年${m}月${day}日`; };
function patternsOf(items) {
  const map = new Map();
  for (const h of items) {
    const b = baseOf(h.name); if (!b || !PATTERNS[b] || /^【セット品】/.test(h.name)) continue;
    if (!map.has(b)) map.set(b, []);
    map.get(b).push(h);
  }
  return new Map([...map].map(([id, hs]) => {
    const prices = hs.map((h) => h.price?.regular?.pc?.taxIn).filter(Boolean);
    return [id, { id, ...PATTERNS[id], from: prices.length ? Math.min(...prices) : null, sizes: new Set(hs.map(sizeOf)).size,
      shg: hs.some((h) => isSHG(h.name)), quick: hs.some((h) => (h.icons || []).some((i) => i.cd === 'INS')), img: hs.find((h) => h.img?.l)?.img.l }];
  }));
}
function renderItems(pats) {
  document.getElementById('itemsRail').innerHTML = FEATURED.map((id) => pats.get(id)).filter(Boolean).map((p) => {
    const s = SERIES.find((x) => x.id === p.s);
    const badges = [NEW_PATTERNS.includes(p.id) ? '<span class="tag badge-new">NEW</span>' : '',
      p.shg ? '<span class="tag shg">STREET HIGH GRIP</span>' : '', p.quick ? '<span class="tag">即納あり</span>' : ''].join('');
    return `<a class="icard" href="/products?p=${p.id}">
      <span class="ph"><img src="${IMG}${esc(p.img)}" alt="TIMSUN ${p.id}" width="320" height="320" loading="lazy" decoding="async"><span class="badges">${badges}</span></span>
      <span class="meta"><b class="nm">${p.id}</b><span class="srs">${esc(s?.ja || '')}・${p.sizes}サイズ</span>${p.from ? `<span class="pr">${yen(p.from)}〜<small>(税込・1本)</small></span>` : ''}</span>
    </a>`;
  }).join('');
}
document.querySelectorAll('.rail-btn').forEach((b) => b.addEventListener('click', () => {
  const r = document.getElementById(b.dataset.rail || 'itemsRail'); r.scrollBy({ left: Number(b.dataset.dir) * r.clientWidth * 0.75, behavior: 'smooth' });
}));

// ── STREET HIGH GRIP のラインアップ(上位グレードの全パターン) ──
function renderShg(pats) {
  const list = [...pats.values()].filter((p) => p.shg)
    .sort((a, b) => Number(NEW_PATTERNS.includes(b.id)) - Number(NEW_PATTERNS.includes(a.id)) || SERIES.findIndex((s) => s.id === a.s) - SERIES.findIndex((s) => s.id === b.s));
  const sizes = list.reduce((n, p) => n + p.sizes, 0);
  document.getElementById('shgCount').textContent = `${list.length}パターン・${sizes}サイズ`;
  document.getElementById('shgRail').innerHTML = list.map((p) => {
    const s = SERIES.find((x) => x.id === p.s);
    return `<a class="icard" href="/products?p=${p.id}">
      <span class="ph"><img src="${IMG}${esc(p.img)}" alt="TIMSUN ${p.id}" width="320" height="320" loading="lazy" decoding="async"><span class="badges">${NEW_PATTERNS.includes(p.id) ? '<span class="tag badge-new">NEW</span>' : ''}</span></span>
      <span class="meta"><b class="nm">${p.id}</b><span class="srs">${esc(s?.ja || '')}・${p.sizes}サイズ</span>${p.from ? `<span class="pr">${yen(p.from)}〜<small>(税込・1本)</small></span>` : ''}</span>
    </a>`;
  }).join('');
}

// ── 使い方から選ぶ(By Riding Style) ──
function renderUsecases() {
  document.getElementById('usecases').innerHTML = USECASES.map((u) => `
    <a class="ucard" href="/products#${u.series}">${u.img ? `<img src="${u.img}" alt="" width="346" height="500" loading="lazy">` : '<span class="biz">BUSINESS</span>'}
      <span><b>${esc(u.title)}</b><small>${esc(u.text)}</small></span></a>`).join('');
}

// ── タイヤの読みもの(Magazine) ──
function renderMagazine() {
  document.getElementById('magGrid').innerHTML = ARTICLES.slice(0, 6).map((a) => `
    <a class="mcard" href="/magazine?a=${a.slug}"><span class="tag${a.tag === '製品' ? ' shg' : ' muted'}">${esc(a.tag)}</span><b>${esc(a.title)}</b><small>${esc(a.lead)}</small></a>`).join('');
}

// シリーズ: 大きな縦長のパネルを横に並べる(横スクロール)
function renderSeries(counts) {
  document.getElementById('seriesGrid').innerHTML = SERIES.map((s, i) => `
    <a class="stile" href="/products#${s.id}">
      <img src="${s.img}" alt="" width="346" height="500" loading="lazy">
      <span class="stile-body">
        <span class="stile-no en">${String(i + 1).padStart(2, '0')}</span>
        <b class="stile-en en">${esc(s.en)}</b>
        <span class="stile-ja">${esc(s.ja)}</span>
        <span class="stile-cnt">${counts ? `${counts[s.id] || 0}パターン` : ''}</span>
      </span>
    </a>`).join('');
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
    const pmap = patternsOf(items);
    renderItems(pmap);
    renderShg(pmap);
    const asof = await dataAsOf();
    if (asof) { const n = document.getElementById('itemsAsof'); n.hidden = false; n.textContent = `価格は${fmtDate(asof)}時点のものです。`; }
    // 注目製品(TS720)のサイズ数と価格帯
    const ts = items.filter((h) => baseOf(h.name) === 'TS720' && !/^【セット品】/.test(h.name));
    const prices = ts.map((h) => h.price?.regular?.pc?.taxIn).filter(Boolean);
    const spec = document.getElementById('tsSpec');
    if (ts.length) spec.querySelector('[data-k="sizes"]').textContent = `${ts.length}サイズ`;
    if (prices.length) spec.querySelector('[data-k="price"]').textContent = `${yen(Math.min(...prices))}〜(税込・1本)`;
  } catch (e) { console.error(e); }
}

// 取扱店数(実データから。バナーとカードの数字を更新)
async function renderShops() {
  try {
    const shops = await fetch(new URL('../data/shops.json', import.meta.url)).then((r) => r.json());
    const n = String(Math.floor(shops.length / 10) * 10);
    const bs = document.getElementById('bnShops'); if (bs) bs.textContent = n;
    document.querySelectorAll('.js-shops').forEach((e) => { e.textContent = n; });
  } catch (e) { /* 既定の表示のまま */ }
}

// ヒーロー下部の帯: 最新ニュース1件
function renderHeroNews() {
  const n = NEWS[0]; const a = document.getElementById('heroNews'); if (!n || !a) return;
  a.href = n.u; a.target = '_blank'; a.rel = 'noopener';
  a.querySelector('time').textContent = n.d;
  a.querySelector('.hb-title').textContent = n.t;
}

// イベント(サムネイル・新しい順に4件)とニュース(イベント以外・新しい順に4件)を分けて表示
function renderNews() {
  document.getElementById('eventGrid').innerHTML = NEWS.filter((n) => n.c === 'event').slice(0, 4).map(eventCard).join('');
  document.getElementById('newsList').innerHTML = NEWS.filter((n) => n.c !== 'event').slice(0, 4).map((n) => `
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
renderUsecases();
renderMagazine();
renderShops();
renderNews();
renderHeroNews();
mountFitSelect(document.querySelector('[data-fitselect]'));

// 適合データのある車種数(バナーの数字を実データで更新。100単位で切り捨て)
(async () => {
  try {
    const set = new Set();
    for (const h of await fetchFitmentIndex()) {
      for (const [m, gs] of Object.entries(h.moto?.body?.facet || {})) for (const [g, list] of Object.entries(gs || {})) (list || []).forEach((v) => set.add(`${m}:${g}:${v.split('||')[1]}`));
    }
    const f = Math.floor(set.size / 100) * 100;
    if (f) document.querySelectorAll('.js-fit').forEach((e) => { e.textContent = f.toLocaleString('ja-JP'); });
  } catch (e) { /* 既定の表示のまま */ }
})();
