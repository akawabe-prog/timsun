// TIMSUN 適合データ → 車種ツリー(適合タイヤ検索ページと、プルダウン式の車種検索で共通)
// 車種一覧は「TIMSUNタイヤが持つ適合データ」から組み立てるため、TIMSUNが合う車種しか出ない。

export const MAKERS = [
  { id: '1', name: 'ホンダ', en: 'HONDA', logo: 'm1_honda' },
  { id: '2', name: 'ヤマハ', en: 'YAMAHA', logo: 'm2_yamaha' },
  { id: '3', name: 'スズキ', en: 'SUZUKI', logo: 'm3_suzuki' },
  { id: '4', name: 'カワサキ', en: 'KAWASAKI', logo: 'm4_kawasaki' },
  { id: '20', name: '海外メーカー', en: 'OVERSEAS', logo: null },
];
export const GROUP_LABEL = {
  1: '〜50cc', 2: '51〜125cc', 3: '126〜250cc', 4: '251〜400cc', 5: '401〜750cc', 6: '751cc〜',
  bmw: 'BMW', duc: 'DUCATI', hd: 'Harley-Davidson', ktm: 'KTM', tri: 'TRIUMPH',
};
export const GROUP_ORDER = ['1', '2', '3', '4', '5', '6', 'bmw', 'duc', 'hd', 'ktm', 'tri'];

// 車種名と型式キーの照合用(型式キーは「- → _」「空白 → -」「' と : は削除」「Γ → !Gamma;」に変換されている)
export const norm = (s) => String(s).replace(/!Gamma;|Γ/g, 'gamma').toLowerCase().replace(/[^a-z0-9]/g, '');
// 検索語の正規化(全角英数→半角、空白・記号を無視)
export const fold = (s) => String(s).normalize('NFKC').toLowerCase().replace(/[\s\-_・()（）']/g, '');

// ── 適合データ → 車種ツリー ──
// tree[maker][group][bodyEn] = { ja, en, frames: Map(型式 → Set(商品ID)), all: Set(商品ID) }
export function buildTree(hits) {
  const tree = {};
  for (const h of hits) {
    const body = h.moto?.body?.facet || {};
    const frame = h.moto?.frame?.facet || {};
    for (const [m, groups] of Object.entries(body)) {
      for (const [g, list] of Object.entries(groups || {})) {
        const bodies = (list || []).map((v) => { const [ja, en] = v.split('||'); return { ja, en }; });
        const slot = ((tree[m] ??= {})[g] ??= {});
        const ensure = ({ ja, en }) => (slot[en] ??= { ja, en, frames: new Map(), all: new Set() });
        bodies.forEach((b) => ensure(b).all.add(h.id));
        for (const [key, frames] of Object.entries(frame[m]?.[g] || {})) {
          let b = bodies.find((x) => norm(x.en) === norm(key));
          if (!b && /-\d+$/.test(key)) b = bodies.find((x) => norm(x.en) === norm(key.replace(/-\d+$/, '')));
          if (!b) b = { ja: key.replace(/!Gamma;/g, 'Γ').replace(/-/g, ' ').replace(/_/g, '-'), en: key };
          const node = ensure(b);
          node.all.add(h.id);
          for (const f of frames || []) {
            const label = f.split('||')[0];
            if (!node.frames.has(label)) node.frames.set(label, new Set());
            node.frames.get(label).add(h.id);
          }
        }
      }
    }
  }
  return tree;
}

