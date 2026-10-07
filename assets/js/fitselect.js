// TIMSUN プルダウン式の車種検索(参考: shad-japan.com の「車種から探す」)
// メーカー → 排気量(海外はブランド) → 車種 → 型式(任意) を順に選び、「適合を見る」で適合タイヤ検索ページへ。
// 前のプルダウンを選ぶまで、次のプルダウンは選べない。キーワード(車種名・型式)でも探せる。
// 使い方: <div class="fsel" data-fitselect> … </div> を置いて mountFitSelect(要素) を呼ぶ(部品の形は dev/pages の原稿を参照)。
import { fetchFitmentIndex } from './cj-api.js';
import { MAKERS, GROUP_LABEL, GROUP_ORDER, buildTree } from './fittree.js';

let treePromise = null;
const loadTree = () => (treePromise ??= fetchFitmentIndex().then(buildTree));
const opt = (v, t) => { const o = document.createElement('option'); o.value = v; o.textContent = t; return o; };
const reset = (sel, placeholder, disabled = true) => { sel.replaceChildren(opt('', placeholder)); sel.disabled = disabled; };

export async function mountFitSelect(root, { base = '/fitment' } = {}) {
  if (!root) return;
  const [mk, gr, bd, fr] = ['maker', 'group', 'body', 'frame'].map((k) => root.querySelector(`[data-fs="${k}"]`));
  const kw = root.querySelector('[data-fs="kw"]');
  const go = root.querySelector('[data-fs="go"]');
  const msg = root.querySelector('[data-fs="msg"]');
  reset(mk, '適合データを読み込んでいます');
  reset(gr, '排気量・ブランドを選択'); reset(bd, '車種を選択'); reset(fr, '型式を選択(任意)');
  let tree;
  try { tree = await loadTree(); } catch (e) { console.error(e); reset(mk, '読み込めませんでした'); return; }

  const count = (m) => Object.values(tree[m] || {}).reduce((n, g) => n + Object.keys(g).length, 0);
  reset(mk, 'メーカーを選択', false);
  MAKERS.filter((m) => tree[m.id]).forEach((m) => mk.append(opt(m.id, `${m.name}(${count(m.id)}車種)`)));

  mk.addEventListener('change', () => {
    reset(gr, mk.value === '20' ? 'ブランドを選択' : '排気量を選択', !mk.value); reset(bd, '車種を選択'); reset(fr, '型式を選択(任意)');
    if (!mk.value) return;
    GROUP_ORDER.filter((g) => tree[mk.value]?.[g]).forEach((g) => gr.append(opt(g, `${GROUP_LABEL[g] || g}(${Object.keys(tree[mk.value][g]).length})`)));
  });
  gr.addEventListener('change', () => {
    reset(bd, '車種を選択', !gr.value); reset(fr, '型式を選択(任意)');
    if (!gr.value) return;
    Object.values(tree[mk.value][gr.value]).sort((a, b) => a.ja.localeCompare(b.ja, 'ja')).forEach((b) => bd.append(opt(b.en, b.ja)));
  });
  bd.addEventListener('change', () => {
    const node = bd.value && tree[mk.value][gr.value][bd.value];
    if (!node) { reset(fr, '型式を選択(任意)'); return; }
    const frames = [...node.frames.keys()].sort();
    reset(fr, frames.length ? '型式を選択(任意)' : 'この車種は型式の指定なし', !frames.length);
    frames.forEach((f) => fr.append(opt(f, f)));
    if (frames.length) fr.append(opt('*', '型式がわからない'));
  });

  const submit = () => {
    if (bd.value) {
      const p = new URLSearchParams({ m: mk.value, c: gr.value, b: bd.value, f: fr.value || '*' });
      location.href = `${base}?${p}`;
    } else if (kw && kw.value.trim()) {
      location.href = `${base}?${new URLSearchParams({ q: kw.value.trim() })}`;
    } else {
      if (msg) msg.textContent = 'メーカー・排気量・車種を選ぶか、キーワードを入力してください。';
      (mk.value ? (gr.value ? bd : gr) : mk).focus();
    }
  };
  go.addEventListener('click', submit);
  kw?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
}
