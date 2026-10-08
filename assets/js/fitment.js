// TIMSUN 適合タイヤ検索
// 車種から: 車両メーカー → 排気量(海外はブランド) → 車種 → 型式 → 適合するTIMSUNタイヤ
//   車種一覧は「TIMSUNタイヤが持つ適合データ」から組み立てるため、TIMSUNが合う車種しか出ない。
// サイズから: TIMSUNの取扱サイズだけを選択肢にし、該当する商品を表示する。
import { fetchFitmentIndex, fetchItems, fetchCatalog, dataAsOf } from './cj-api.js';
import { sizeOf, parseSize, isSHG, baseOf } from './data.js';

import { MAKERS, GROUP_LABEL, GROUP_ORDER, norm, fold, buildTree } from './fittree.js';
import { IMG, ITEM_URL, esc, yen } from './site.js';
import { mountFitSelect } from './fitselect.js';

const $ = (s, r = document) => r.querySelector(s);

// ── 状態とURL(共有・戻るボタン対応) ──
const state = { m: null, g: null, b: null, f: null };
function readURL() {
  const p = new URLSearchParams(location.search);
  Object.assign(state, { m: p.get('m'), g: p.get('c'), b: p.get('b'), f: p.get('f') });
}
const isSizeTab = () => new URLSearchParams(location.search).get('tab') === 'size';
function writeURL(replace = false) {
  const p = new URLSearchParams();
  if (state.m) p.set('m', state.m);
  if (state.g) p.set('c', state.g);
  if (state.b) p.set('b', state.b);
  if (state.f) p.set('f', state.f);
  const q = new URLSearchParams(location.search).get('q');
  if (q && !state.m) p.set('q', q);
  const url = `${location.pathname}${p.toString() ? `?${p}` : ''}`;
  history[replace ? 'replaceState' : 'pushState'](null, '', url);
}

let TREE = {};
const makerOf = (id) => MAKERS.find((m) => m.id === id);
const bodiesIn = (m, g) => Object.values(TREE[m]?.[g] || {}).sort((a, b) => a.ja.localeCompare(b.ja, 'ja'));
const countBodies = (m) => Object.values(TREE[m] || {}).reduce((n, g) => n + Object.keys(g).length, 0);

// ── 描画 ──
function renderMakers() {
  $('#makers').innerHTML = MAKERS.filter((mk) => TREE[mk.id]).map((mk) => `
    <button class="mk${state.m === mk.id ? ' on' : ''}" data-m="${mk.id}" aria-pressed="${state.m === mk.id}">
      ${mk.logo ? `<img src="https://cdn.customjapan.net/logo/maker/${mk.logo}.webp" alt="" width="120" height="40" loading="lazy">` : '<span class="mk-en">OVERSEAS</span>'}
      <b>${mk.name}</b><small>${countBodies(mk.id)}車種</small>
    </button>`).join('');
}

function renderGroups() {
  const box = $('#groups');
  if (!state.m) { box.hidden = true; return; }
  const gs = GROUP_ORDER.filter((g) => TREE[state.m]?.[g]);
  box.hidden = false;
  box.innerHTML = `<p class="step-t"><span>2</span>${state.m === '20' ? 'ブランドを選択' : '排気量を選択'}</p>
    <div class="chips">${gs.map((g) => `<button class="chip${state.g === g ? ' on' : ''}" data-g="${g}" aria-pressed="${state.g === g}">${GROUP_LABEL[g] || g}<small>${Object.keys(TREE[state.m][g]).length}</small></button>`).join('')}</div>`;
}

function renderBodies() {
  const box = $('#bodies');
  if (!state.m || !state.g) { box.hidden = true; return; }
  const list = bodiesIn(state.m, state.g);
  box.hidden = false;
  box.innerHTML = `<p class="step-t"><span>3</span>車種を選択<em>${makerOf(state.m).name} / ${GROUP_LABEL[state.g] || state.g}</em></p>
    <input class="narrow" type="search" placeholder="この中から車種名で絞り込み" aria-label="車種名で絞り込み">
    <div class="bodies">${list.map((b) => `<button class="bd${state.b === b.en ? ' on' : ''}" data-b="${esc(b.en)}" data-k="${esc(fold(b.ja + b.en))}" aria-pressed="${state.b === b.en}"><b>${esc(b.ja)}</b><small>${esc(b.en)}</small></button>`).join('')}</div>`;
  $('.narrow', box).addEventListener('input', (e) => {
    const q = fold(e.target.value);
    box.querySelectorAll('.bd').forEach((el) => { el.hidden = q && !el.dataset.k.includes(q); });
  });
}

function renderFrames() {
  const box = $('#frames');
  const node = state.b && TREE[state.m]?.[state.g]?.[state.b];
  if (!node) { box.hidden = true; return; }
  box.hidden = false;
  const frames = [...node.frames.keys()].sort();
  box.innerHTML = `<p class="step-t"><span>4</span>型式を選択<em>${esc(node.ja)}</em></p>
    <div class="chips">
      ${frames.map((f) => `<button class="chip${state.f === f ? ' on' : ''}" data-f="${esc(f)}" aria-pressed="${state.f === f}">${esc(f)}</button>`).join('')}
      <button class="chip ghost${state.f === '*' ? ' on' : ''}" data-f="*" aria-pressed="${state.f === '*'}">${frames.length ? '型式がわからない' : 'この車種の適合タイヤを見る'}</button>
    </div>
    ${frames.length ? '<p class="hint">型式は車検証の「型式」欄、またはフレーム番号の先頭で確認できます。</p>' : ''}`;
}

const posOf = (h) => {
  const v = (h.spec?.values || []).join(' ');
  if (/^【セット品】/.test(h.name) || v.includes('前後セット')) return ['set'];
  const p = [];
  if (v.includes('フロント')) p.push('front');
  if (v.includes('リア')) p.push('rear');
  return p.length ? p : ['other'];
};
const typeOf = (h) => { const v = (h.spec?.values || []).join(' '); return /TL/.test(v) ? 'チューブレス' : /WT/.test(v) ? 'チューブタイプ' : ''; };
const STOCK_RANK = { '◯在庫あり': 0, '△残りわずか': 1, '★在庫限り': 2, '別倉庫': 3, '入荷待': 4 };

function card(h) {
  const price = h.price?.regular?.pc?.taxIn;
  const quick = (h.icons || []).some((i) => i.cd === 'INS');
  // 自社の商品詳細(選んだサイズを開く)へ。詳細ページの無い型番だけオンラインストアへ
  const b = baseOf(h.name);
  const own = !!b; // 型番があれば自社の詳細ページがある(未登録の新しい型番も自動で作る)
  return `<a class="tire" href="${own ? `/products?p=${b}&i=${encodeURIComponent(h.id)}` : ITEM_URL(h.id)}"${own ? '' : ' target="_blank" rel="noopener"'}>
    <span class="ph"><img src="${IMG}${esc(h.img?.l || h.img?.s || '')}" alt="" width="320" height="320" loading="lazy" decoding="async"></span>
    <span class="meta">
      <span class="tags">${isSHG(h.name) ? '<span class="tag shg">STREET HIGH GRIP</span>' : ''}${quick ? '<span class="tag">即納</span>' : ''}</span>
      <b class="nm">${esc(h.name)}</b>
      <span class="sz">${esc(sizeOf(h))}${typeOf(h) ? ` / ${typeOf(h)}` : ''}</span>
      <span class="pr">${yen(price)}<small>(税込・1本)</small></span>
      <span class="st">${esc(h.status?.txt || '')}</span>
      <span class="go">${own ? '詳しく見る' : 'オンラインストアで見る'} →</span>
    </span>
  </a>`;
}

let reqSeq = 0;
async function renderResults() {
  const box = $('#results');
  const node = state.b && TREE[state.m]?.[state.g]?.[state.b];
  if (!node || !state.f) { box.hidden = true; box.innerHTML = ''; return; }
  const ids = [...(state.f === '*' ? node.all : (node.frames.get(state.f) || new Set()))];
  const title = `${node.ja}${state.f && state.f !== '*' ? `(${state.f})` : ''}`;
  box.hidden = false;
  box.innerHTML = `<p class="loading">${esc(title)}の適合タイヤを読み込んでいます…</p>`;
  const seq = ++reqSeq;
  let items;
  try { items = await fetchItems(ids); } catch (e) { console.error(e); if (seq === reqSeq) box.innerHTML = '<p class="err">商品情報を読み込めませんでした。時間をおいて再度お試しください。</p>'; return; }
  if (seq !== reqSeq) return; // 連続クリック時は最後の選択だけ描画
  showResults(`${esc(title)}に適合するTIMSUNタイヤ`, items,
    state.f === '*' ? '<p class="note">型式を選んでいないため、この車種のいずれかの型式に適合するタイヤをすべて表示しています。</p>' : '');
}

async function showResults(heading, items, pre = '') {
  const box = $('#results');
  const asof = await dataAsOf();
  const asofNote = asof ? `<p class="note">価格・在庫は${asof.replace(/^(\d+)-0?(\d+)-0?(\d+)$/, '$1年$2月$3日')}時点のものです。最新は商品ページでご確認ください。</p>` : '';
  const sort = (a, b) => (STOCK_RANK[a.status?.txt] ?? 9) - (STOCK_RANK[b.status?.txt] ?? 9) || (a.price?.regular?.pc?.taxIn ?? 0) - (b.price?.regular?.pc?.taxIn ?? 0);
  const groups = [['front', 'フロント'], ['rear', 'リア'], ['set', '前後セット'], ['other', 'その他']]
    .map(([k, label]) => [label, items.filter((h) => posOf(h).includes(k)).sort(sort)])
    .filter(([, list]) => list.length);
  box.hidden = false;
  box.innerHTML = items.length ? `
    <h2 class="res-h">${heading}<span>${items.length}点</span></h2>
    ${pre}
    ${groups.map(([label, list]) => `<section class="grp"><h3>${label}<small>${list.length}点</small></h3><div class="tires">${list.map(card).join('')}</div></section>`).join('')}
    <p class="note">年式・仕様により適合が異なる場合があります。ご購入前に商品ページの適合車種をご確認ください。</p>${asofNote}`
    : `<h2 class="res-h">${heading}</h2><p class="note">該当するTIMSUNタイヤが見つかりませんでした。条件を変えてお試しください。</p>`;
  box.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

function renderAll() {
  renderMakers(); renderGroups(); renderBodies(); renderFrames(); renderResults();
}

// ── 型式・車種名のフリーワード検索(全メーカー横断) ──
let FLAT = [];
function buildFlat() {
  FLAT = [];
  for (const [m, groups] of Object.entries(TREE)) {
    for (const [g, bodies] of Object.entries(groups)) {
      for (const b of Object.values(bodies)) {
        FLAT.push({ m, g, b: b.en, ja: b.ja, en: b.en, frames: [...b.frames.keys()], key: fold(`${b.ja}${b.en}${[...b.frames.keys()].join('')}`) });
      }
    }
  }
}
function suggest(q) {
  const box = $('#suggest');
  const k = fold(q);
  if (k.length < 2) { box.hidden = true; return; }
  const hits = [];
  for (const r of FLAT) {
    const fr = r.frames.filter((f) => fold(f).includes(k));
    if (fr.length) fr.forEach((f) => hits.push({ ...r, f }));
    else if (r.key.includes(k)) hits.push({ ...r, f: r.frames.length ? null : '*' });
    if (hits.length >= 30) break;
  }
  box.hidden = false;
  box.innerHTML = hits.length
    ? hits.map((r) => `<button data-m="${r.m}" data-g="${r.g}" data-b="${esc(r.b)}" data-f="${esc(r.f || '')}">
        <b>${esc(r.ja)}${r.f && r.f !== '*' ? `<em>${esc(r.f)}</em>` : ''}</b><small>${makerOf(r.m)?.name || ''} / ${GROUP_LABEL[r.g] || r.g}</small></button>`).join('')
    : '<p class="none">該当する車種が見つかりませんでした。TIMSUNの適合がない車種の可能性があります。</p>';
}

// ── イベント ──
function bind() {
  document.addEventListener('click', (e) => {
    const t = e.target.closest('#pBody button'); if (!t) return;
    if (t.closest('#suggest')) {
      Object.assign(state, { m: t.dataset.m, g: t.dataset.g, b: t.dataset.b, f: t.dataset.f || null });
      $('#suggest').hidden = true; $('#q').value = '';
    } else if (t.dataset.m) Object.assign(state, { m: t.dataset.m, g: null, b: null, f: null });
    else if (t.dataset.g) Object.assign(state, { g: t.dataset.g, b: null, f: null });
    else if (t.dataset.b) Object.assign(state, { b: t.dataset.b, f: null });
    else if (t.dataset.f) state.f = t.dataset.f;
    else return;
    writeURL(); renderAll();
    if (!state.f) document.getElementById(state.b ? 'frames' : state.g ? 'bodies' : 'groups')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  $('#q').addEventListener('input', (e) => suggest(e.target.value));
  addEventListener('popstate', () => { if (isSizeTab()) { selectTab('size'); runSizeFromURL(); } else { selectTab('body'); readURL(); renderAll(); } });
}

async function main() {
  bind();
  bindSize();
  if (isSizeTab()) { selectTab('size'); runSizeFromURL(); return; }
  readURL();
  try {
    TREE = buildTree(await fetchFitmentIndex());
  } catch (e) {
    console.error(e);
    $('#makers').innerHTML = '<p class="err">適合データを読み込めませんでした。時間をおいて再度お試しください。</p>';
    return;
  }
  buildFlat();
  $('#count').textContent = `${FLAT.length.toLocaleString('ja-JP')}車種`;
  // URLの状態が実在しない組み合わせなら捨てる
  if (state.m && !TREE[state.m]) Object.assign(state, { m: null, g: null, b: null, f: null });
  if (state.g && !TREE[state.m]?.[state.g]) Object.assign(state, { g: null, b: null, f: null });
  if (state.b && !TREE[state.m]?.[state.g]?.[state.b]) Object.assign(state, { b: null, f: null });
  writeURL(true);
  renderAll();
  // TOPの検索欄から来た場合(?q=)は候補を開いておく
  const q = new URLSearchParams(location.search).get('q');
  if (q) { $('#q').value = q; suggest(q); $('#q').focus(); }
}
// ── タブ ──
function selectTab(which) {
  const size = which === 'size';
  $('#tabBody').setAttribute('aria-selected', String(!size));
  $('#tabSize').setAttribute('aria-selected', String(size));
  $('#pBody').hidden = size; $('#pSize').hidden = !size;
  $('#results').hidden = true;
}

// ── サイズから探す ──
let CATALOG = null;
async function loadCatalog() {
  if (!CATALOG) {
    CATALOG = await fetchCatalog();
    const sizes = CATALOG.map(sizeOf).filter(Boolean).map(parseSize).filter(Boolean);
    const uniq = (k) => [...new Set(sizes.map((x) => x[k]).filter(Boolean))].sort((a, b) => parseFloat(a) - parseFloat(b));
    const fill = (id, list) => $(id).insertAdjacentHTML('beforeend', list.map((v) => `<option value="${v}">${v}</option>`).join(''));
    fill('#sw', uniq('w')); fill('#sa', uniq('a')); fill('#sr', uniq('r'));
  }
  return CATALOG;
}
async function runSize(w, a, r) {
  const box = $('#results');
  if (!w && !a && !r) { box.hidden = true; return; }
  box.hidden = false; box.innerHTML = '<p class="loading">該当するタイヤを探しています</p>';
  let items;
  try { items = await loadCatalog(); } catch (e) { console.error(e); box.innerHTML = '<p class="err">商品情報を読み込めませんでした。時間をおいて再度お試しください。</p>'; return; }
  const hit = items.filter((h) => { const z = parseSize(sizeOf(h)); return z && (!w || z.w === w) && (!a || z.a === a) && (!r || z.r === r); });
  const label = `${w || '—'}${a ? `/${a}` : ''}-${r || '—'}`;
  showResults(`サイズ <span class="en">${esc(label)}</span> のTIMSUNタイヤ`, hit);
}
async function runSizeFromURL() {
  const p = new URLSearchParams(location.search);
  await loadCatalog().catch(() => {});
  ['w', 'a', 'r'].forEach((k) => { const v = p.get(k); if (v) $(`#s${k}`).value = v; });
  runSize(p.get('w'), p.get('a'), p.get('r'));
}
function bindSize() {
  $('#tabBody').addEventListener('click', () => { selectTab('body'); history.replaceState(null, '', location.pathname); if (!Object.keys(TREE).length) location.reload(); else renderAll(); });
  $('#tabSize').addEventListener('click', () => { selectTab('size'); history.replaceState(null, '', `${location.pathname}?tab=size`); loadCatalog().catch(() => {}); });
  $('#sizeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const w = $('#sw').value, a = $('#sa').value, r = $('#sr').value;
    const p = new URLSearchParams({ tab: 'size' }); if (w) p.set('w', w); if (a) p.set('a', a); if (r) p.set('r', r);
    history.pushState(null, '', `${location.pathname}?${p}`);
    runSize(w, a, r);
  });
}

main();
mountFitSelect(document.querySelector('[data-fitselect]'));
