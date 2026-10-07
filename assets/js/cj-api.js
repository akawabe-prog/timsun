// TIMSUN × Custom Japan — API接続(init → Algolia検索プロキシ)
//
// 1. api-i の /init で認証Cookie(guid / authorization / cid)を受け取る
// 2. api-a (Algoliaプロキシ) に Cookie付きで検索を投げる
// ※ api-a は Cookie が無いと 400 を返す。
// ※ CORSで許可されたオリジンからしか呼べない。公開ドメインはCJ側で許可リストへの追加が必要。
//
// APIを呼べない環境(localhost・GitHub Pages など、CORSの許可外)では、
// 同梱の assets/data/catalog.json(表示用の商品データ。作成時点の価格・在庫)で表示する。
// 許可されたドメインでAPIが失敗したときも、同じデータに切り替える。

const INIT_URL = 'https://api-i.customjapan.net/api/v1/init';
const SEARCH_URL = 'https://api-a.customjapan.net/1/indexes/*/queries';
const SITE = 'ec';              // x-site ヘッダー。TIMSUNサイト用の値がCJから払い出されたら差し替える
export const TIMSUN_MAKER_ID = '490';

// TIMSUNのバイクタイヤだけに限定する共通条件(参考: tire.customjapan.net と同じ条件 + メーカー指定)
export const BASE_FILTER = [
  'icon.discon:"false"',
  'category.tree.lvl0:"moto"',
  'category.tree.lvl1:"moto > tire"',
  'category.class.lvl1:"10 > bp"',
  `maker.id:"${TIMSUN_MAKER_ID}"`,
].join(' AND ');

const IS_LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
// 最初から同梱データを使う環境(APIはCORSで必ず失敗するため、呼ばずに済ませる)
const STATIC_ONLY = IS_LOCAL || /\.github\.io$/.test(location.hostname);

let initPromise = null;
function ensureInit() {
  if (!initPromise) {
    initPromise = fetch(INIT_URL, {
      headers: { 'x-site': SITE },
      credentials: 'include',
      // no-cache は必須。省くと Safari が別ログイン状態のレスポンスを使い回す(CJ開発ガイド準拠)
      cache: 'no-cache',
    }).then((r) => {
      if (!r.ok) throw new Error(`init failed: ${r.status}`);
    }).catch((e) => { initPromise = null; throw e; });
  }
  return initPromise;
}

async function search(params, retried = false) {
  await ensureInit();
  const r = await fetch(SEARCH_URL, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ indexName: 'item', params: { query: '', attributesToHighlight: [], ...params } }] }),
  });
  // Cookie切れ等は init し直して1回だけ再試行
  if ((r.status === 400 || r.status === 401 || r.status === 403) && !retried) {
    initPromise = null;
    return search(params, true);
  }
  if (!r.ok) throw new Error(`search failed: ${r.status}`);
  const j = await r.json();
  return j.results[0];
}

// ── 同梱データ(APIが使えないとき) ──
let staticPromise = null;
let usedStatic = false;
function loadStatic() {
  if (!staticPromise) staticPromise = fetch(new URL('../data/catalog.json', import.meta.url)).then((r) => r.json());
  usedStatic = true;
  return staticPromise;
}
async function viaApi(apiFn, staticFn) {
  if (STATIC_ONLY) return staticFn(await loadStatic());
  try { return await apiFn(); } catch (e) {
    console.warn('APIを利用できないため、同梱の商品データで表示します', e);
    return staticFn(await loadStatic());
  }
}
/** 同梱データで表示しているときは、その時点(例: 2026-10-06)を返す。APIで表示しているときは null */
export async function dataAsOf() { return usedStatic ? (await staticPromise).asOf : null; }

// 他社タイヤを絶対に出さないための二重チェック(APIの絞り込みに加えて表示側でも弾く)
const onlyTimsun = (hits) => hits.filter((h) => !h.maker || String(h.maker.id) === TIMSUN_MAKER_ID);

/** 車種ツリー用: TIMSUNタイヤ全件の適合データ(id / moto.body / moto.frame) */
export async function fetchFitmentIndex() {
  return viaApi(
    async () => onlyTimsun((await search({ filters: BASE_FILTER, hitsPerPage: 1000, attributesToRetrieve: ['id', 'maker.id', 'moto.body', 'moto.frame'] })).hits),
    (d) => onlyTimsun(d.items).map(({ id, maker, moto }) => ({ id, maker, moto })),
  );
}

/** 結果表示用: 指定IDの商品情報(画像・価格・在庫・前後) */
export async function fetchItems(ids) {
  if (!ids.length) return [];
  const set = new Set(ids);
  return viaApi(async () => {
    const idFilter = ids.map((id) => `objectID:"${id}"`).join(' OR ');
    const res = await search({
      filters: `${BASE_FILTER} AND (${idFilter})`,
      hitsPerPage: ids.length,
      attributesToRetrieve: ['id', 'name', 'img', 'price', 'status', 'icons', 'spec', 'maker', 'category.facet.lvl2'],
    });
    return onlyTimsun(res.hits);
  }, (d) => onlyTimsun(d.items.filter((h) => set.has(h.id))));
}

/** 製品一覧用: TIMSUNタイヤ全件の商品情報(型番→シリーズの振り分けは data.js で行う) */
let catalogPromise = null;
export function fetchCatalog() {
  if (!catalogPromise) {
    catalogPromise = viaApi(async () => {
      const res = await search({
        filters: BASE_FILTER,
        hitsPerPage: 1000,
        attributesToRetrieve: ['id', 'name', 'img', 'price', 'status', 'icons', 'spec', 'maker'],
      });
      return onlyTimsun(res.hits);
    }, (d) => onlyTimsun(d.items).map(({ moto, ...h }) => h)).catch((e) => { catalogPromise = null; throw e; });
  }
  return catalogPromise;
}

/** 品番などの文字列でTIMSUNタイヤを検索 */
export async function searchTimsun(query, limit = 6) {
  const q = query.toLowerCase();
  return viaApi(async () => {
    const res = await search({ query, filters: BASE_FILTER, hitsPerPage: limit, attributesToRetrieve: ['id', 'name', 'img', 'price', 'status', 'icons', 'spec', 'maker'] });
    return onlyTimsun(res.hits);
  }, (d) => onlyTimsun(d.items.filter((h) => h.name.toLowerCase().includes(q))).slice(0, limit));
}
