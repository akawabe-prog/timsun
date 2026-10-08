// TIMSUN 製品: シリーズ別のパターン一覧と、パターン詳細(?p=TS689)
// 商品(サイズ・価格・在庫)はCJ APIから取得し、型番→シリーズの対応は data.js で行う。
import { fetchCatalog, fetchFitmentIndex, dataAsOf } from './cj-api.js';
import { SERIES, PATTERNS, baseOf, variantOf, isSHG, sizeOf } from './data.js';
import { esc, yen, reveal, IMG, ITEM_URL, spyAnchors } from './site.js';
import { PATTERN_COPY } from './pattern-copy.js';
import { SIZE_SPEC } from './size-spec.js';
import { MAKERS } from './fittree.js';

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
    if (!b) continue;
    // data.js に未登録の新しい型番も詳細ページは作る(一覧にはシリーズが決まってから並べる)
    if (!map.has(b)) map.set(b, { id: b, s: null, d: '', ...PATTERNS[b], items: [] });
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
            <p class="eyebrow">Series ${String(SERIES.indexOf(s) + 1).padStart(2, '0')}</p>
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

// ── パターン詳細 ──
// 構成: 名前とページ内メニュー → 大きな写真 → 特長(公式の説明文) → 製品の特長画像 → トレッドパターン → サイズ・価格 → 適合車種 → 同じシリーズのタイヤ
const POS_ORDER = ['フロント', 'リア', 'フロント/リア', '前後セット'];
const POS_EN = { 'フロント': 'Front', 'リア': 'Rear', 'フロント/リア': 'Front / Rear', '前後セット': 'Set' };
const jaOf = (f) => String(f).split('||')[0];
// 前後セットの商品名(【セット品】… 前 TS689F 90/90-12 54J TL 後 TS689 110/80-10 58J TL 車種名)から、前後のサイズと車種を取り出す
const setParts = (h) => {
  const m = h.name.match(/前\s+TS\S+\s+(\S+\s+\S+)\s+(?:TL|TT|WT)?\s*後\s+TS\S+\s+(\S+\s+\S+)\s+(?:TL|TT|WT)?\s*(.*)$/);
  return m ? { size: `前 ${m[1]} / 後 ${m[2]}`, for: m[3].trim() } : { size: h.name.replace(/^【セット品】/, ''), for: '' };
};

// 適合車種: 商品の車種データをメーカーごとにまとめる
function fitOf(items) {
  const out = new Map();
  for (const h of items) {
    const body = h.moto?.body?.facet || {};
    for (const [mk, groups] of Object.entries(body)) {
      for (const list of Object.values(groups || {})) {
        for (const f of list || []) {
          if (!out.has(mk)) out.set(mk, new Set());
          out.get(mk).add(jaOf(f));
        }
      }
    }
  }
  return MAKERS.filter((m) => out.get(m.id)?.size).map((m) => ({ ...m, bodies: [...out.get(m.id)].sort((a, b) => a.localeCompare(b, 'ja')) }));
}

function pickCard(h, o) {
  const sp = SIZE_SPEC[h.id];
  const row = (k, v) => (v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '');
  return `
    <section class="pd-pick" aria-label="選んだサイズ">
      <div class="wrap pd-pick-in">
        <img src="${IMG}${esc(h.img?.l || h.img?.s || '')}" alt="" width="200" height="200">
        <div class="pd-pick-main">
          <p class="pd-pick-k">選んだサイズ</p>
          <p class="pd-pick-size en">${esc(isSet(h) ? setParts(h).size : o?.size || sizeOf(h))}</p>
          <p class="pd-pick-sub">${esc(variantOf(h.name) || '')}・${esc(posOf(h))}${typeOf(h) ? `・<span class="en">${typeOf(h)}</span>` : ''}・品番 <span class="en">${esc(h.id)}</span></p>
          <dl class="pd-pick-spec">
            ${row('標準リム幅', sp?.std && `<span class="en">${esc(sp.std)}</span>インチ`)}
            ${row('許容リム幅', sp?.rims?.length && `<span class="en">${sp.rims.map(esc).join(' / ')}</span>`)}
            ${row('外径', sp?.od && `<span class="en">${esc(sp.od)}</span>mm`)}
            ${row('トレッド幅', sp?.tw && `<span class="en">${esc(sp.tw)}</span>mm`)}
          </dl>
        </div>
        <div class="pd-pick-buy">
          ${o?.msrp ? `<p class="pd-pick-msrp">メーカー希望小売価格 <span class="en">${yen(o.msrp)}</span>(税込)</p>` : ''}
          <p class="pd-pick-price"><span class="en">${yen(priceOf(h))}</span><small>オンラインストア・税込</small></p>
          <p class="pd-pick-st">${esc(h.status?.txt || '')}</p>
          <a class="btn" href="${ITEM_URL(h.id)}" target="_blank" rel="noopener">オンラインストアで購入</a>
          <a class="link" href="/shops">取扱店で相談する</a>
        </div>
      </div>
    </section>`;
}

function renderDetail(p, pickId) {
  const s = SERIES.find((x) => x.id === p.s) || { id: '', ja: 'その他', en: 'Other' };
  const copy = PATTERN_COPY[p.id] || [];
  // 一行の説明: data.js に無い新しい型番は、説明文の最初の一文を使う
  const lead = p.d || (copy[0]?.text ? `${copy[0].text.split('。')[0]}。` : `TIMSUN ${p.id}`);
  const official = new Map(copy.flatMap((c) => c.rows.map((r) => [r.code, { ...r, v: c.v }])));
  document.title = `${p.id}|${s.ja}|TIMSUN(ティムソン)日本公式サイト`;
  const singles = p.items.filter((h) => !isSet(h));
  // 写真: 型番の表記ごとに1枚目(全体)と3枚目(トレッド面)
  const byVar = new Map();
  singles.forEach((h) => { const v = variantOf(h.name) || p.id; if (!byVar.has(v) && h.img?.l) byVar.set(v, h); });
  const shots = [...byVar.entries()].flatMap(([v, h]) => {
    const base = h.img.l.replace(/_1\.jpg$/, '');
    return [{ src: `${IMG}${base}_1.jpg`, cap: v }, { src: `${IMG}${base}_3.jpg`, cap: `${v} トレッド面`, tread: true }];
  });
  const first = byVar.values().next().value || p.items[0];
  // ?i=商品ID: 適合検索などから選んだサイズ。上にまとめて見せ、サイズ表の行に印を付ける
  const pick = pickId && p.items.find((h) => String(h.id) === String(pickId));
  const infoBase = first?.img?.l ? `${IMG}${first.img.l.replace(/_1\.jpg$/, '')}` : null;
  const tread = shots.find((x) => x.tread);
  const groups = POS_ORDER.map((pos) => ({ pos, rows: p.items.filter((h) => posOf(h) === pos)
    .sort((a, b) => sizeOf(a).localeCompare(sizeOf(b), 'en', { numeric: true })) })).filter((g) => g.rows.length);
  const others = [...PATS.values()].filter((x) => x.s === p.s && x.id !== p.id)
    .sort((a, b) => Number(b.shg) - Number(a.shg) || a.id.localeCompare(b.id)).slice(0, 8);
  const types = [...new Set(singles.map(typeOf).filter(Boolean))];
  const inches = [...new Set(singles.map((h) => (sizeOf(h).match(/-(\d+)/) || [])[1]).filter(Boolean))].map(Number).sort((a, b) => a - b);
  const hasF = singles.some((h) => posOf(h).includes('フロント')), hasR = singles.some((h) => posOf(h).includes('リア'));
  const poss = [hasF && 'フロント', hasR && 'リア'].filter(Boolean);

  $('#detailView').innerHTML = `
    <header class="pd-head">
      <div class="wrap">
        <ol class="crumb"><li><a href="/">TOP</a></li><li><a href="/products">製品</a></li><li><a href="/products#${s.id}">${esc(s.ja)}</a></li><li>${p.id}</li></ol>
        <div class="pd-title">
          <div>
            ${p.shg ? '<img class="pd-grade" src="/assets/img/shg-logo.webp" alt="STREET HIGH GRIP" width="640" height="87">' : '<p class="pd-grade-std en">STANDARD</p>'}
            <h1 class="pd-name en">${p.id}</h1>
            <p class="pd-sub"><span class="en">${esc(s.en)}</span>${esc(s.ja)}${p.variants.length > 1 ? `<span class="pd-vars en">${p.variants.map(esc).join(' / ')}</span>` : ''}</p>
          </div>
          <div class="pd-cta">
            ${p.from ? `<p class="pd-from"><span class="en">${yen(p.from)}〜</span><small>税込・1本</small></p>` : ''}
            <a class="btn" href="#pdSizes">サイズと価格を見る</a>
          </div>
        </div>
      </div>
    </header>
    <nav class="anav pd-anav" aria-label="この製品の内容">
        <ul class="anav-in">
          <li><a href="#pdFeature">特長</a></li>
          ${tread ? '<li><a href="#pdTread">トレッドパターン</a></li>' : ''}
          <li><a href="#pdSizes">サイズ・価格</a></li>
          <li hidden id="pdFitNav"><a href="#pdFit">適合車種</a></li>
          ${others.length ? '<li><a href="#pdOthers">同じシリーズのタイヤ</a></li>' : ''}
        </ul>
      </nav>

    ${pick ? pickCard(pick, official.get(String(pick.id))) : ''}
    <section class="pd-hero" aria-label="製品写真">
      <div class="wrap pd-gallery">
        <figure class="pd-main"><img id="pdMain" src="${esc(pick?.img?.l ? IMG + pick.img.l : shots[0]?.src || IMG + p.img)}" alt="TIMSUN ${p.id}" width="640" height="640"></figure>
        ${shots.length > 1 ? `<div class="pd-thumbs" role="group" aria-label="写真を切り替え">${shots.map((x, i) => `
          <button type="button" class="pd-th${i ? '' : ' on'}" data-src="${esc(x.src)}" aria-label="${esc(x.cap)}"><img src="${esc(x.src)}" alt="" width="120" height="120" loading="lazy" onerror="this.parentElement.remove()"></button>`).join('')}</div>` : ''}
      </div>
    </section>

    <section class="sec pd-feature" id="pdFeature">
      <div class="wrap pd-feat">
        <div>
          <p class="eyebrow">Feature</p>
          <h2 class="pd-catch">${esc(lead)}</h2>
          <ul class="pd-chips">
            <li><small>シリーズ</small><span>${esc(s.ja)}</span></li>
            <li><small>グレード</small><span>${p.shg ? 'ストリートハイグリップ' : 'スタンダード'}</span></li>
            ${poss.length ? `<li><small>装着位置</small><span>${poss.map(esc).join('・')}</span></li>` : ''}
            ${types.length ? `<li><small>構造</small><span class="en">${types.join(' / ')}</span></li>` : ''}
            ${inches.length ? `<li><small>リム径</small><span class="en">${inches[0]}${inches.length > 1 ? `〜${inches[inches.length - 1]}` : ''}インチ</span></li>` : ''}
            <li><small>サイズ</small><span><span class="en">${p.sizes}</span>サイズ</span></li>
          </ul>
        </div>
        <div class="pd-copy">
          ${copy.length ? copy.map((c) => `
            <div class="pd-copy-b">
              ${copy.length > 1 ? `<p class="pd-copy-v en">${esc(c.v)}</p>` : ''}
              ${c.text.split('\n').map((t) => `<p>${esc(t)}</p>`).join('')}
            </div>`).join('') : `<p>${esc(lead)}</p>`}
          ${copy.length ? `<p class="note">出典: ${copy.some((c) => c.src === 'cj') ? 'カスタムジャパン オンラインストアの商品ページ' : 'TIMSUN日本公式サイトの商品ページ'}</p>` : ''}
        </div>
      </div>
      ${infoBase ? `
      <div class="wrap pd-info">
        <h3 class="pd-h3">製品の特長<small>画像を押すと大きく表示します</small></h3>
        <div class="pd-info-rail">${[4, 5, 6, 7].map((n) => `<a class="pd-info-i" href="${infoBase}_${n}.jpg" target="_blank" rel="noopener"><img src="${infoBase}_${n}.jpg" alt="${p.id} 製品の特長 ${n - 3}" width="600" height="600" loading="lazy" onerror="const b=this.closest('.pd-info');this.parentElement.remove();if(b&&!b.querySelector('.pd-info-i'))b.remove()"></a>`).join('')}</div>
      </div>` : ''}
    </section>

    ${tread ? `
    <section class="pd-tread" id="pdTread" aria-label="トレッドパターン">
      <p class="pd-tread-bg en" aria-hidden="true">${p.id}</p>
      <div class="wrap pd-tread-in">
        <img src="${esc(tread.src)}" alt="${p.id} のトレッドパターン" width="640" height="640" loading="lazy" onerror="this.closest('section').remove()">
        <div>
          <p class="eyebrow">Tread Pattern</p>
          <h2 class="h2">${p.id}のトレッドパターン</h2>
          <p class="pd-tread-t">${esc(lead)}</p>
        </div>
      </div>
    </section>` : ''}

    <section class="sec pd-sizes" id="pdSizes">
      <div class="wrap">
        <div class="sec-head en-head"><h2 class="title-en">Size &amp; Price<span class="sr">サイズ・価格</span></h2><span class="pd-count">${p.items.length}商品</span></div>
        ${groups.map((g) => `
          <div class="pd-grp">
            <h3 class="pd-grp-h"><span class="en">${POS_EN[g.pos]}</span>${esc(g.pos)}<small>${g.rows.length}</small></h3>
            <div class="sizes-wrap">
              <table class="spec sizes pd-table">
                <thead><tr><th>サイズ</th><th>構造</th><th>品番</th><th class="num">標準リム幅<br><small>インチ</small></th><th>許容リム幅<br><small>インチ</small></th><th class="num">外径<br><small>mm</small></th><th class="num">トレッド幅<br><small>mm</small></th><th class="num">メーカー希望小売価格<br><small>税込</small></th><th class="num">オンラインストア<br><small>税込</small></th><th>在庫</th><th></th></tr></thead>
                <tbody>${g.rows.map((h) => {
                  const o = official.get(String(h.id));
                  const sp = SIZE_SPEC[h.id];
                  return `<tr${pick && h === pick ? ' class="pick" id="pdPickRow"' : ''}>
                  <td class="en pd-size">${isSet(h) ? `${esc(setParts(h).size)}${setParts(h).for ? `<small>${esc(setParts(h).for)}</small>` : ''}` : `${esc(o?.size || sizeOf(h))}<small class="en">${esc(variantOf(h.name) || '')}</small>`}</td>
                  <td class="en">${typeOf(h)}</td>
                  <td class="en">${esc(h.id)}</td>
                  <td class="num en">${esc(sp?.std || '—')}</td>
                  <td class="en pd-rims">${sp?.rims?.length ? sp.rims.map(esc).join(' / ') : '—'}</td>
                  <td class="num en">${sp?.od ? `${esc(sp.od)}${sp.odr ? `<small>${esc(sp.odr.replace('-', '–'))}</small>` : ''}` : '—'}</td>
                  <td class="num en">${sp?.tw ? `${esc(sp.tw)}${sp.twr ? `<small>${esc(sp.twr.replace('-', '–'))}</small>` : ''}` : '—'}</td>
                  <td class="num">${o?.msrp ? yen(o.msrp) : o ? 'オープン価格' : '—'}</td>
                  <td class="num">${yen(priceOf(h))}</td>
                  <td class="st">${esc(h.status?.txt || '')}</td>
                  <td><a class="link" href="${ITEM_URL(h.id)}" target="_blank" rel="noopener">購入</a></td></tr>`;
                }).join('')}</tbody>
              </table>
            </div>
          </div>`).join('')}
        <p class="note sizes-note">リム幅・外径・トレッド幅はカスタムジャパン オンラインストアの商品ページの値です(括弧内は製品の許容範囲)。メーカー希望小売価格はTIMSUN日本公式サイト、オンラインストアの価格・在庫は日本総代理店カスタムジャパンのオンラインストアの情報です${ASOF ? `(${fmtDate(ASOF)}時点。最新はリンク先の商品ページでご確認ください)` : ''}。取扱店での価格は店舗にお問い合わせください。</p>
        <p class="pd-links"><a class="link" href="/magazine?a=size">タイヤサイズ表記の見方</a><a class="link" href="/shops">取扱店を探す</a></p>
      </div>
    </section>

    <section class="sec alt pd-fit" id="pdFit" hidden>
      <div class="wrap">
        <div class="sec-head en-head"><h2 class="title-en">Fitment<span class="sr">適合車種</span></h2><a class="more" href="/fitment">適合タイヤ検索</a></div>
        <p class="pd-fit-lead">${p.id}が適合する主な車種です。型式・年式によってサイズが異なるため、ご購入前に適合タイヤ検索でお確かめください。</p>
        <div id="pdFitBody"></div>
      </div>
    </section>

    ${others.length ? `
    <section class="sec pd-others" id="pdOthers">
      <div class="wrap">
        <div class="sec-head en-head"><h2 class="title-en">Other ${esc(s.en)} Tyres<span class="sr">同じシリーズのタイヤ</span></h2><a class="more" href="/products#${s.id}">${esc(s.ja)}の一覧</a></div>
        <div class="pts">${others.map(patternCard).join('')}</div>
      </div>
    </section>` : ''}`;

  // 写真の切り替え
  const main = document.getElementById('pdMain');
  document.querySelectorAll('.pd-th').forEach((b) => b.addEventListener('click', () => {
    main.src = b.dataset.src;
    document.querySelectorAll('.pd-th').forEach((x) => x.classList.toggle('on', x === b));
  }));
  reveal(document.querySelectorAll('#detailView .rv'));
  renderFit(p).finally(() => spyAnchors(document.getElementById('detailView')));
}

// 適合車種: 適合タイヤ検索と同じ車種データを読み、この型番の商品が合う車種をメーカーごとに並べる
const FIT_SHOW = 24; // 最初に見せる車種の数
async function renderFit(p) {
  let fits = [];
  try {
    const ids = new Set(p.items.map((h) => String(h.id)));
    fits = fitOf((await fetchFitmentIndex()).filter((h) => ids.has(String(h.id))));
  } catch (e) { console.error(e); }
  if (!fits.length) return;
  document.getElementById('pdFitBody').innerHTML = `
    <div class="pd-fit-tabs" role="tablist">${fits.map((m, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-mk="${m.id}">${esc(m.name)}<small>${m.bodies.length}</small></button>`).join('')}</div>
    ${fits.map((m, i) => `<div class="pd-fit-list" data-mk="${m.id}"${i ? ' hidden' : ''}>
      <ul class="${m.bodies.length > FIT_SHOW ? 'fold' : ''}">${m.bodies.map((b) => `<li><a href="/fitment?q=${encodeURIComponent(b)}">${esc(b)}</a></li>`).join('')}</ul>
      ${m.bodies.length > FIT_SHOW ? `<button type="button" class="btn btn-ghost pd-fit-more">${esc(m.name)}の${m.bodies.length}車種をすべて表示</button>` : ''}
    </div>`).join('')}`;
  document.querySelectorAll('.pd-fit-more').forEach((b) => b.addEventListener('click', () => { b.previousElementSibling.classList.remove('fold'); b.remove(); }));
  document.getElementById('pdFit').hidden = false;
  document.getElementById('pdFitNav').hidden = false;
  document.querySelectorAll('.pd-fit-tabs button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.pd-fit-tabs button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    document.querySelectorAll('.pd-fit-list').forEach((u) => { u.hidden = u.dataset.mk !== b.dataset.mk; });
  }));
}

let PATS = null;
let ASOF = null;
const fmtDate = (d) => { const [y, m, day] = d.split('-').map(Number); return `${y}年${m}月${day}日`; };
function route() {
  const id = new URLSearchParams(location.search).get('p');
  const p = id && PATS.get(id.toUpperCase());
  const pickId = new URLSearchParams(location.search).get('i');
  $('#listView').hidden = !!p;
  $('#listHero').hidden = !!p;
  $('#detailView').hidden = !p;
  if (p) { renderDetail(p, pickId); scrollTo(0, 0); dispatchEvent(new Event('scroll')); } // 上の黒い帯を隠したのでヘッダーを白に
  else if (id) { location.replace('/products'); }
}

async function main() {
  try {
    PATS = groupPatterns(await fetchCatalog());
    ASOF = await dataAsOf();
  } catch (e) {
    console.error(e);
    $('#seriesList').innerHTML = '<div class="wrap"><p class="err">製品情報を読み込めませんでした。時間をおいて再度お試しください。</p></div>';
    return;
  }
  // ?grade=shg: ストリートハイグリップだけを表示
  const grade = new URLSearchParams(location.search).get('grade');
  if (grade === 'shg' && !new URLSearchParams(location.search).get('p')) {
    document.title = 'ストリートハイグリップ|製品一覧|TIMSUN(ティムソン)日本公式サイト';
    $('#crumb').innerHTML = '<li><a href="/">TOP</a></li><li><a href="/products">製品</a></li><li>ストリートハイグリップ</li>';
    $('#pheroBody').innerHTML = `<p class="eyebrow detail-eyebrow">TIMSUN Premium Line</p>
      <h1 class="h1">ストリートハイグリップ</h1>
      <p class="lead">グリップ力と耐摩耗性のバランス、そしてウェットグリップを追求したTIMSUNの上位ブランド。走るシーンごとにパターンをそろえています。</p>
      <p class="grade-switch"><a class="tag shg" aria-current="page">STREET HIGH GRIP</a><a class="tag muted" href="/products">すべての製品</a></p>`;
    renderList(new Map([...PATS].filter(([, p]) => p.shg)));
    document.querySelector('.grades')?.setAttribute('hidden', '');
  } else {
    renderList(PATS);
  }
  if (ASOF) $('#seriesList').insertAdjacentHTML('afterbegin', `<div class="wrap"><p class="note asof">価格は${fmtDate(ASOF)}時点のものです。</p></div>`);
  route();
  addEventListener('popstate', () => location.reload());
}
main();
