// TIMSUN 取扱店: 地方 → 都道府県で選び、店舗名・住所で絞り込む(?pref=東京 で直接開ける)
import { esc } from './site.js';

const REGIONS = [
  ['北海道・東北', ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島']],
  ['関東', ['東京', '神奈川', '埼玉', '千葉', '茨城', '栃木', '群馬', '山梨']],
  ['信越・北陸', ['新潟', '長野', '富山', '石川', '福井']],
  ['東海', ['愛知', '岐阜', '静岡', '三重']],
  ['近畿', ['大阪', '兵庫', '京都', '滋賀', '奈良', '和歌山']],
  ['中国', ['鳥取', '島根', '岡山', '広島', '山口']],
  ['四国', ['徳島', '香川', '愛媛', '高知']],
  ['九州・沖縄', ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄']],
];
const $ = (s) => document.querySelector(s);
const fold = (s) => String(s).normalize('NFKC').toLowerCase().replace(/[\s\-‐ー－]/g, '');
let SHOPS = [];
let pref = new URLSearchParams(location.search).get('pref') || '';

function renderRegions() {
  const by = SHOPS.reduce((m, s) => ((m[s.pref] = (m[s.pref] || 0) + 1), m), {});
  $('#regions').innerHTML = REGIONS.map(([name, prefs]) => `
    <div class="region"><h3>${name}</h3><div>${prefs.map((p) => `
      <button type="button" data-p="${p}" class="${p === pref ? 'on' : ''}" aria-pressed="${p === pref}" ${by[p] ? '' : 'disabled'}>${p}<small>${by[p] || 0}</small></button>`).join('')}
    </div></div>`).join('');
}

function renderShops() {
  const k = fold($('#kw').value);
  const list = SHOPS.filter((s) => (!pref || s.pref === pref) && (!k || fold(`${s.name}${s.addr}`).includes(k)));
  const scope = pref || (k ? '全国' : '');
  $('#shopCount').innerHTML = scope ? `${esc(scope)}の取扱店 <b>${list.length}</b> 店` : '都道府県を選ぶか、店舗名・市区町村で絞り込んでください。';
  if (!scope) { $('#shops').innerHTML = ''; return; }
  $('#shops').innerHTML = list.map((s) => `
    <div class="shop">
      <b>${esc(s.name)}</b>
      <span class="addr">〒${esc(s.zip)} ${esc(s.addr)}</span>
      <a class="tel" href="tel:${esc(s.tel.replace(/[^\d]/g, ''))}">${esc(s.tel)}</a>
      <a class="map link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} ${s.addr}`)}" target="_blank" rel="noopener">地図で見る</a>
    </div>`).join('') || '<p class="note">該当する取扱店が見つかりませんでした。</p>';
}

async function main() {
  try {
    SHOPS = await fetch(new URL('../data/shops.json', import.meta.url)).then((r) => r.json());
  } catch (e) {
    $('#shops').innerHTML = '<p class="err">取扱店を読み込めませんでした。時間をおいて再度お試しください。</p>';
    return;
  }
  $('#total').textContent = String(Math.floor(SHOPS.length / 10) * 10);
  renderRegions(); renderShops();
  $('#regions').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-p]'); if (!b) return;
    pref = pref === b.dataset.p ? '' : b.dataset.p;
    history.replaceState(null, '', pref ? `?pref=${encodeURIComponent(pref)}` : location.pathname);
    renderRegions(); renderShops();
    $('#shopCount').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  $('#kw').addEventListener('input', renderShops);
}
main();
