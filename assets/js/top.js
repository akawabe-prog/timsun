// TIMSUN TOP: 注目のタイヤ・シリーズ・STREET HIGH GRIP・使い方・声とメディア・読みもの・ニュース・数字
// 並びはMEDULLAのトップに倣う(気づく → 欲しくなる → 信じる → 選ぶ → 共感する → 続ける)
import { fetchCatalog, fetchFitmentIndex, dataAsOf } from './cj-api.js';
import { SERIES, PATTERNS, NEWS, NEWS_CAT, MEDIA, VOICES, ARTICLES, USECASES, FEATURED, NEW_PATTERNS, baseOf, sizeOf, parseSize, isSHG } from './data.js';
import { esc, yen, IMG, reveal } from './site.js';

const $ = (id) => document.getElementById(id);
const isSet = (h) => /^【セット品】/.test(h.name);
const priceOf = (h) => h.price?.regular?.pc?.taxIn;
const fmtDate = (d) => { const [y, m, day] = d.split('-').map(Number); return `${y}年${m}月${day}日`; };

// 型番ごとにまとめる(画像・最安値・サイズ数・グレード・即納)
function patterns(items) {
  const map = new Map();
  for (const h of items) {
    const b = baseOf(h.name); if (!b || !PATTERNS[b] || isSet(h)) continue;
    (map.get(b) || map.set(b, []).get(b)).push(h);
  }
  return new Map([...map].map(([id, hs]) => {
    const prices = hs.map(priceOf).filter(Boolean);
    return [id, { id, ...PATTERNS[id], items: hs, from: prices.length ? Math.min(...prices) : null,
      sizes: new Set(hs.map(sizeOf)).size, shg: hs.some((h) => isSHG(h.name)),
      quick: hs.some((h) => (h.icons || []).some((i) => i.cd === 'INS')), img: hs.find((h) => h.img?.l)?.img.l }];
  }));
}

// 4 注目のタイヤ
function renderItems(pats) {
  const cards = FEATURED.map((id) => pats.get(id)).filter(Boolean).map((p) => {
    const s = SERIES.find((x) => x.id === p.s);
    const badges = [NEW_PATTERNS.includes(p.id) ? '<span class="tag badge-new">NEW</span>' : '',
      p.shg ? '<span class="tag shg">STREET HIGH GRIP</span>' : '', p.quick ? '<span class="tag">即納あり</span>' : ''].join('');
    return `<a class="icard" href="/products?p=${p.id}">
      <span class="ph"><img src="${IMG}${esc(p.img)}" alt="TIMSUN ${p.id}" width="320" height="320" loading="lazy" decoding="async"><span class="badges">${badges}</span></span>
      <span class="meta"><b class="nm">${p.id}</b><span class="srs">${esc(s?.ja || '')}・${p.sizes}サイズ</span>${p.from ? `<span class="pr">${yen(p.from)}〜<small>(税込・1本)</small></span>` : ''}</span>
    </a>`;
  });
  $('itemsRail').innerHTML = cards.join('');
}

// シリーズ(画像付きの9枚のカード)
function renderSeries(pats) {
  const count = (sid) => (pats ? [...pats.values()].filter((p) => p.s === sid).length : null);
  $('seriesGrid').innerHTML = SERIES.map((s, i) => `
    <a class="sr-card rv" href="/products#${s.id}">
      <span class="ph${s.img ? '' : ' biz'}">${s.img ? `<img src="${s.img}" alt="" width="346" height="500" loading="lazy">` : 'JAPAN<br>ONLY'}</span>
      <span>
        <span class="no">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(s.en)}</h3>
        <span class="ja">${esc(s.ja)}</span>
        <span class="cnt">${count(s.id) != null ? `${count(s.id)}パターン` : ''}</span>
      </span>
      ${s.jpOnly ? '<span class="tag jp">日本独自</span>' : ''}
    </a>`).join('');
  reveal(document.querySelectorAll('#seriesGrid .rv'));
}

// 注目の新製品(TS720)のサイズ数と価格
function renderFeature(pats) {
  const p = pats.get('TS720'); const spec = $('tsSpec'); if (!p || !spec) return;
  spec.querySelector('[data-k="sizes"]').textContent = `${p.sizes}サイズ`;
  if (p.from) spec.querySelector('[data-k="price"]').textContent = `${yen(p.from)}〜(税込・1本)`;
}

// 8 使い方から選ぶ
function renderUsecases() {
  $('usecases').innerHTML = USECASES.map((u) => `
    <a class="ucard" href="/products#${u.series}">${u.img ? `<img src="${u.img}" alt="" width="346" height="500" loading="lazy">` : '<span class="biz">BUSINESS</span>'}
      <span><b>${esc(u.title)}</b><small>${esc(u.text)}</small></span></a>`).join('');
}

// 9 販売店の声・メディア掲載
function renderVoices() {
  const voices = VOICES.map((v) => `<div class="vcard voice"><span class="k">VOICE</span><p>${esc(v)}</p><span class="who">販売店アンケートより(バイクショップ勤務の方)</span></div>`);
  const media = MEDIA.map((m) => `<a class="vcard" href="${esc(m.u)}" target="_blank" rel="noopener"><span class="k">MEDIA — ${esc(m.d)}</span><p>${esc(m.name)}</p><span class="who">${esc(m.t)}</span></a>`);
  const out = []; for (let i = 0; i < Math.max(voices.length, media.length); i++) { if (voices[i]) out.push(voices[i]); if (media[i]) out.push(media[i]); }
  $('voicesRail').innerHTML = out.join('');
}

// 10 タイヤの読みもの
function renderMagazine() {
  $('magGrid').innerHTML = ARTICLES.slice(0, 6).map((a) => `
    <a class="mcard" href="/magazine?a=${a.slug}"><span class="tag${a.tag === '製品' ? ' shg' : ' muted'}">${esc(a.tag)}</span><b>${esc(a.title)}</b><small>${esc(a.lead)}</small></a>`).join('');
}

// ニュース(日付・カテゴリ・タイトルの一覧)
function renderNews() {
  $('newsList').innerHTML = NEWS.slice(0, 4).map((n) => `
    <li><a href="${esc(n.u)}" target="_blank" rel="noopener">
      <time>${esc(n.d)}</time><span class="tag${n.c === 'product' ? ' shg' : ' muted'}">${NEWS_CAT[n.c]}</span><span class="t">${esc(n.t)}</span>
    </a></li>`).join('');
}

// 数字(取扱店数・適合車種数)を実データで
async function renderNumbers() {
  try {
    const shops = await fetch(new URL('../data/shops.json', import.meta.url)).then((r) => r.json());
    const n = Math.floor(shops.length / 10) * 10;
    document.querySelectorAll('.js-shops').forEach((e) => { e.textContent = String(n); });
    document.querySelectorAll('.js-shops-n').forEach((e) => { e.innerHTML = `${n}<small>+</small>`; });
    const bs = $('bnShops'); if (bs) bs.textContent = String(n);
  } catch (e) { /* 既定の表示のまま */ }
  try {
    const set = new Set();
    for (const h of await fetchFitmentIndex()) {
      for (const [m, gs] of Object.entries(h.moto?.body?.facet || {})) for (const [g, list] of Object.entries(gs || {})) (list || []).forEach((v) => set.add(`${m}:${g}:${v.split('||')[1]}`));
    }
    const f = Math.floor(set.size / 100) * 100;
    if (f) { document.querySelectorAll('.js-fit').forEach((e) => { e.innerHTML = `${f.toLocaleString('ja-JP')}<small>+</small>`; }); const bf = $('bnFit'); if (bf) bf.textContent = `${f.toLocaleString('ja-JP')}車種以上`; }
  } catch (e) { /* 既定の表示のまま */ }
}

async function renderCatalogParts() {
  try {
    const items = await fetchCatalog();
    const pats = patterns(items);
    renderItems(pats); renderSeries(pats); renderFeature(pats); fillSizeSelects(items);
    const asof = await dataAsOf();
    if (asof) { const n = $('itemsAsof'); n.hidden = false; n.textContent = `価格は${fmtDate(asof)}時点のものです。`; }
  } catch (e) {
    console.error(e);
    $('itemsRail').innerHTML = '<p class="err">製品情報を読み込めませんでした。</p>';
  }
}

// 注目のタイヤの前後ボタン
document.querySelectorAll('.rail-btn').forEach((b) => b.addEventListener('click', () => {
  const r = $('itemsRail'); r.scrollBy({ left: Number(b.dataset.dir) * r.clientWidth * 0.75, behavior: 'smooth' });
}));

// ヒーロー下部の帯: 最新ニュース1件
function renderHeroNews() {
  const n = NEWS[0]; const a = document.getElementById('heroNews'); if (!n || !a) return;
  a.href = n.u; a.target = '_blank'; a.rel = 'noopener';
  a.querySelector('time').textContent = n.d;
  a.querySelector('.hb-title').textContent = n.t;
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

renderSeries(null);
renderCatalogParts();
renderNumbers();
renderUsecases();
renderVoices();
renderMagazine();
renderNews();
renderHeroNews();
