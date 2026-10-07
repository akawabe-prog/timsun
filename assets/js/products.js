// TIMSUN 製品: シリーズ別のパターン一覧と、パターン詳細(?p=TS689)
// 商品(サイズ・価格・在庫)はCJ APIから取得し、型番→シリーズの対応は data.js で行う。
import { fetchCatalog } from '/assets/js/cj-api.js';
import { SERIES, PATTERNS, baseOf, variantOf, isSHG, sizeOf } from '/assets/js/data.js';
import { esc, yen, reveal, IMG, ITEM_URL } from '/assets/js/site.js';

const $ = (s) => document.querySelector(s);
const isSet = (h) => /^【セット品】/.test(h.name);
const priceOf = (h) => h.price?.regular?.pc?.taxIn;
const STOCK_RANK = { '◯在庫あり': 0, '△残りわずか': 1, '★在庫限り': 2, '別倉庫': 3, '入荷待': 4 };
const posOf = (h) => {
  const v = (h.spec?.values || []).join(' ');
  if (isSet(h)) return '前後セット';
  const f = v.includes('フロント'), r = v.includes('リア');
  return f && r ? 'フロント/リア' : f ? 'フロント' : r ? 'リア' : '—';
};
const typeOf = (h) => { const v = (h.spec?.values || []).join(' '); return /TL/.test(v) ? 'TL' : /WT|TT/.test(v) ? 'TT' : ''; };

// 型番ごとにまとめる
function groupPatterns(items) {
  const map = new Map();
  for (const h of items) {
    const b = baseOf(h.name);
    if (!b || !PATTERNS[b]) continue;
    if (!map.has(b)) map.set(b, { id: b, ...PATTERNS[b], items: [] });
    map.get(b).items.push(h);
  }
  for (const p of map.values()) {
    const singles = p.items.filter((h) => !isSet(h));
    const prices = singles.map(priceOf).filter(Boolean);
    p.shg = p.items.some((h) => isSHG(h.name));
    p.variants = [...new Set(singles.map((h) => variantOf(h.name)).filter(Boolean))].sort();
    p.sizes = new Set(singles.map(sizeOf).filter(Boolean)).size;
    p.from = prices.length ? Math.min(...prices) : null;
    p.img = (singles.find((h) => h.img?.l) || p.items[0])?.img?.l;
  }
  return map;
}

function patternCard(p) {
  return `<a class="pt rv" href="/products?p=${p.id}">
    <span class="ph"><img src="${IMG}${esc(p.img)}" alt="" width="320" height="320" loading="lazy" decoding="async"></span>
    <span class="meta">
      <span class="tags">${p.shg ? '<span class="tag shg">STREET HIGH GRIP</span>' : '<span class="tag muted">STANDARD</span>'}</span>
      <b class="en nm">${p.id}</b>
      ${p.variants.length > 1 ? `<span class="vars en">${p.variants.map(esc).join(' / ')}</span>` : ''}
      <span class="d">${esc(p.d)}</span>
      <span class="foot"><span>${p.sizes}サイズ</span>${p.from ? `<span class="en">${yen(p.from)}〜</span>` : ''}</span>
    </span>
  </a>`;
}

function renderList(pats) {
  const bySeries = (sid) => [...pats.values()].filter((p) => p.s === sid)
    .sort((a, b) => Number(b.shg) - Number(a.shg) || a.id.localeCompare(b.id));
  const series = SERIES.filter((s) => bySeries(s.id).length);
  $('#snav').innerHTML = series.map((s) => `<a href="#${s.id}">${esc(s.ja)}<small>${bySeries(s.id).length}</small></a>`).join('');
  $('#seriesList').innerHTML = series.map((s, i) => `
    <section class="series-sec${i % 2 ? ' alt' : ''}" id="${s.id}">
      <div class="wrap">
        <header class="series-head">
          ${s.img ? `<img src="${s.img}" alt="" width="346" height="500" loading="lazy">` : '<span class="biz en">JAPAN<br>ONLY</span>'}
          <div>
            <p class="eyebrow">Series ${String(SERIES.indexOf(s) + 1).padStart(2, '0')}${s.jpOnly ? ' — 日本独自' : ''}</p>
            <h2 class="h2"><span class="en">${esc(s.en)}</span><small>${esc(s.ja)}</small></h2>
            <p class="lead">${esc(s.lead)}</p>
          </div>
        </header>
        <div class="pts">${bySeries(s.id).map(patternCard).join('')}</div>
      </div>
    </section>`).join('');
  reveal(document.querySelectorAll('#seriesList .rv'));
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

function renderDetail(p) {
  const s = SERIES.find((x) => x.id === p.s);
  document.title = `${p.id}|${s.ja}|TIMSUN(ティムソン)日本公式サイト`;
  $('#crumb').innerHTML = `<li><a href="/">TOP</a></li><li><a href="/products">製品</a></li><li><a href="/products#${s.id}">${esc(s.ja)}</a></li><li>${p.id}</li>`;
  $('#pheroBody').innerHTML = `
    <p class="eyebrow detail-eyebrow">${esc(s.en)} Series</p>
    <h1 class="h1 en">${p.id}</h1>
    <p class="lead">${esc(p.d)}</p>`;
  const rows = [...p.items].sort((a, b) => Number(isSet(a)) - Number(isSet(b)) || sizeOf(a).localeCompare(sizeOf(b), 'en', { numeric: true }));
  $('#detailView').innerHTML = `
    <div class="wrap detail">
      <div class="detail-vis"><img src="${IMG}${esc(p.img)}" alt="TIMSUN ${p.id}" width="500" height="500"></div>
      <div class="detail-info">
        ${p.shg ? '<img class="shg-logo" src="/assets/img/shg-logo.webp" alt="STREET HIGH GRIP" width="640" height="87">' : '<p class="grade-name en">STANDARD</p>'}
        <table class="spec">
          <tr><th>シリーズ</th><td><a class="link" href="/products#${s.id}">${esc(s.ja)}</a></td></tr>
          <tr><th>グレード</th><td>${p.shg ? 'ストリートハイグリップ' : 'スタンダード'}</td></tr>
          ${p.variants.length ? `<tr><th>型番</th><td class="en">${p.variants.map(esc).join(' / ')}</td></tr>` : ''}
          <tr><th>サイズ数</th><td>${p.sizes}サイズ</td></tr>
          ${p.from ? `<tr><th>価格</th><td class="en">${yen(p.from)}〜<small>(税込・1本)</small></td></tr>` : ''}
        </table>
        <p class="detail-links"><a class="btn" href="/fitment">適合車種を調べる</a><a class="link" href="/shops">取扱店を探す</a></p>
      </div>
    </div>
    <div class="wrap">
      <h2 class="h3 sizes-h">サイズ一覧<span class="en">${rows.length}</span></h2>
      <div class="sizes-wrap">
        <table class="spec sizes">
          <thead><tr><th>商品名</th><th>サイズ</th><th>位置</th><th>タイプ</th><th class="num">価格(税込)</th><th>在庫</th><th></th></tr></thead>
          <tbody>${rows.map((h) => `<tr>
            <td>${esc(h.name)}</td><td class="en">${esc(sizeOf(h))}</td><td>${posOf(h)}</td><td class="en">${typeOf(h)}</td>
            <td class="num">${yen(priceOf(h))}</td><td class="st">${esc(h.status?.txt || '')}</td>
            <td><a class="link" href="${ITEM_URL(h.id)}" target="_blank" rel="noopener">購入</a></td></tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="note sizes-note">価格・在庫は日本総代理店カスタムジャパンのオンラインストアの情報です。取扱店での価格は店舗にお問い合わせください。</p>
    </div>`;
}

let PATS = null;
function route() {
  const id = new URLSearchParams(location.search).get('p');
  const p = id && PATS.get(id.toUpperCase());
  $('#listView').hidden = !!p;
  $('#detailView').hidden = !p;
  if (p) { renderDetail(p); scrollTo(0, 0); }
  else if (id) { location.replace('/products'); }
}

async function main() {
  try {
    PATS = groupPatterns(await fetchCatalog());
  } catch (e) {
    console.error(e);
    $('#seriesList').innerHTML = '<div class="wrap"><p class="err">製品情報を読み込めませんでした。時間をおいて再度お試しください。</p></div>';
    return;
  }
  renderList(PATS);
  route();
  addEventListener('popstate', () => location.reload());
}
main();
