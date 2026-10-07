// TIMSUN サイト共通データ
// - シリーズは本国(timsun.com.cn)の9シリーズに揃え、日本独自の「ビジネス」を加える。
//   日本で取り扱いのないレーシングは載せない。
// - 型番の説明は日本公式サイト(timsun-japan.com/product-all)の記載をもとにしている。
// - 商品(サイズ・価格・在庫)はCJ APIから取得し、ここでは型番とシリーズの対応だけを持つ。

export const SERIES = [
  { id: 'scooter', en: 'Scooter', ja: 'スクーター', img: '/assets/img/series/scooter.webp',
    lead: '晴れの日も雨の日も、毎日の足元を。小径タイヤ専用に設計したコンパウンドとパターン。' },
  { id: 'street-sport', en: 'Street Sport', ja: 'ストリートスポーツ', img: '/assets/img/series/street-sport.webp',
    lead: '街から峠まで、意のままに操る。グリップと旋回性を高めたスポーツパターン。' },
  { id: 'touring-sport', en: 'Touring Sport', ja: 'ツーリングスポーツ', img: '/assets/img/series/touring-sport.webp',
    lead: '耐摩耗性とグリップを両立。長い距離を安心して走るためのパターン。' },
  { id: 'adventure', en: 'Adventure', ja: 'アドベンチャー', img: '/assets/img/series/adventure.webp',
    lead: 'オンロードの快適さと、未舗装路への対応力。クロスオーバーとトレールのパターン。' },
  { id: 'motocross', en: 'Motocross', ja: 'モトクロス', img: '/assets/img/series/motocross.webp',
    lead: '悪路でのトラクションを追求したブロックパターン。MX・エンデューロ向け。' },
  { id: 'vintage', en: 'Vintage', ja: 'ビンテージ', img: '/assets/img/series/vintage.webp',
    lead: '旧車やクラシックスタイルに似合う、縦溝とトレールのパターン。' },
  { id: 'cruising', en: 'Cruising', ja: 'クルーザー', img: '/assets/img/series/cruising.webp',
    lead: 'クルーザー向けの大径サイズ。安定した乗り心地で、長い旅を快適に。' },
  { id: 'business', en: 'Business', ja: 'ビジネス', img: null, jpOnly: true,
    lead: 'カブやジャイロなど、仕事で毎日走るバイクのために。耐久性と直進安定性を重視。' },
  { id: 'snow', en: 'Snow', ja: 'スノー', img: '/assets/img/series/snow.webp',
    lead: '冬の路面に。ビジネス車や小径スクーター向けの深溝スノーパターン。' },
];

// 型番(パターンの基本番号) → シリーズとひとこと説明
export const PATTERNS = {
  // スクーター
  TS720: { s: 'scooter', d: 'スクーターなど小径タイヤ専用に設計したコンパウンドとパターン。' },
  TS690: { s: 'scooter', d: 'スクーターの前後それぞれの性能を高めるために設計。' },
  TS692: { s: 'scooter', d: 'サイドのファイヤーパターンが印象的な足元をつくる。' },
  TS660: { s: 'scooter', d: '高い品質を求めるスクーター向けのパターン。' },
  TS717: { s: 'scooter', d: '耐摩耗性を高めたリア用。' },
  TS685: { s: 'scooter', d: '深い横溝が特徴のパターン。' },
  TS652: { s: 'scooter', d: '存在感のあるトレッドデザイン。' },
  TS645: { s: 'scooter', d: 'モンキー・ゴリラ用の8インチ。' },
  TS636: { s: 'scooter', d: 'ズーマーなどのワイドサイズ向け。' },
  TS633: { s: 'scooter', d: 'ミドルクラスのスクーター向け。' },
  TS626: { s: 'scooter', d: '通勤で使うスクーターに。' },
  TS606: { s: 'scooter', d: '耐久性のあるワイドトレッド。' },
  TS600: { s: 'scooter', d: '毎日の走行に必要な性能をそろえたスタンダードモデル。' },
  // ストリートスポーツ
  TS689: { s: 'street-sport', d: '高速走行時の安定性と、高いグリップ力・旋回性を両立。' },
  TS703: { s: 'street-sport', d: '高いグリップ性能とロングライフを両立。' },
  TS681: { s: 'street-sport', d: 'ドライとウェットの性能を両立。' },
  TS680: { s: 'street-sport', d: 'スポーツ走行に適したコンパウンド。' },
  TS667: { s: 'street-sport', d: '足元を引き締めるトレッドパターン。' },
  TS613: { s: 'street-sport', d: '250〜400ccのミドルクラス向け。' },
  // ツーリングスポーツ
  TS659: { s: 'touring-sport', d: 'ロングツーリング向けの高い耐摩耗性と、雨天時のグリップ。直進性にも優れる。' },
  TS615: { s: 'touring-sport', d: '耐久性と安定性の高いパターン。' },
  TS608: { s: 'touring-sport', d: '独自のトレッドパターン。' },
  // アドベンチャー
  TS880: { s: 'adventure', d: 'ハイグリップとクロスオーバー性能を両立。' },
  TS860: { s: 'adventure', d: 'オフロードの雰囲気を残しながら、オンロード走行にも優れたトレール。' },
  TS870: { s: 'adventure', d: 'デュアルパーパス車向けの、オンロード指向のトレール。' },
  TS871: { s: 'adventure', d: 'ストリートハイグリップの性能を取り入れたトレールパターン。' },
  TS819: { s: 'adventure', d: 'アドベンチャーモデル向けのトレッドパターン。' },
  TS828: { s: 'adventure', d: 'アドベンチャーモデル向け。' },
  TS822: { s: 'adventure', d: 'トレール車に合うサイズ構成。' },
  TS823: { s: 'adventure', d: 'トレール車に合うサイズ構成。' },
  // モトクロス
  TS835: { s: 'motocross', d: 'MXレース用フロント。トラクションとグリップを強化。' },
  TS829: { s: 'motocross', d: 'ミドルサイズMX用。' },
  TS826: { s: 'motocross', d: 'ミドルサイズのオフロードバイク用。' },
  TS818: { s: 'motocross', d: '悪路でのトラクション性能を追求。' },
  TS809: { s: 'motocross', d: 'MXにも使えるオフロードタイヤ。' },
  TS808: { s: 'motocross', d: '存在感のあるブロックパターン。' },
  TS801: { s: 'motocross', d: 'ブロックパターンのオフロードタイヤ。' },
  // ビンテージ
  TS708: { s: 'vintage', d: 'ビンテージルックの縦溝パターン。' },
  TS697: { s: 'vintage', d: 'ドライとウェットの性能を両立。' },
  TS712: { s: 'vintage', d: 'ビンテージスタイルのマシンに合うトレールパターン。' },
  TS629: { s: 'vintage', d: '旧車に合う16インチサイズ。' },
  TS628: { s: 'vintage', d: '旧車のスポーツバイク向けリア。独特のトレッドパターン。' },
  // クルーザー
  TS980: { s: 'cruising', d: 'クルーザー向けの大径サイズ。' },
  // ビジネス(日本独自)
  TS602: { s: 'business', d: '高いグリップとロングライフを両立。' },
  TS607: { s: 'business', d: 'ビジネスバイクの毎日の走りを支える。' },
  TS616: { s: 'business', d: 'カブなどのビジネスバイク向け。' },
  TS622: { s: 'business', d: 'カブなどのビジネスバイク向け。' },
  TS647: { s: 'business', d: '直進安定性とグリップ力を両立。' },
  TS649: { s: 'business', d: '独自開発のセンターリブ形状。' },
  TS677: { s: 'business', d: '耐久性と安定性の高いパターン。' },
  TS707: { s: 'business', d: '操縦性とロングライフを両立。' },
  TS605: { s: 'business', d: '業務用ジャイロキャノピーのフロント用。' },
  TS646: { s: 'business', d: 'ジャイロキャノピーなど、働くバイクに。' },
  TS800: { s: 'business', d: 'カブ系のトレイルカスタム用。' },
  TS802: { s: 'business', d: 'カブのタフな走りに。' },
  // スノー
  TS833: { s: 'snow', d: 'ビジネス車向けの深溝スノータイヤ。' },
  TS825: { s: 'snow', d: '小径スクーター向けのスノーパターン。' },
};

/** 商品名から型番の基本番号(TS689 など)を取り出す */
export const baseOf = (name) => (String(name).match(/TS\d{3}/) || [])[0] || null;
/** 商品名から型番の表記(TS689FA など)を取り出す */
export const variantOf = (name) => (String(name).match(/TS\d{3}[A-Z]*/) || [])[0] || null;
/** 商品のタイヤサイズ表記(120/70-12 など) */
export const sizeOf = (h) => Object.values(h.spec?.['3']?.facet || {}).flat()[0]?.split('||')[0] || '';
/** サイズ表記を 幅/扁平率/リム径 に分解(バイアスの 2.50-17 は扁平率なし) */
export const parseSize = (s) => {
  const m = String(s).match(/^(\d+(?:\.\d+)?)(?:\/(\d+))?-(\d+)/);
  return m ? { w: m[1], a: m[2] || '', r: m[3] } : null;
};
/** ストリートハイグリップ(上位グレード)かどうか */
export const isSHG = (name) => /ストリートハイグリップ/.test(name);

// 数字で見るTIMSUN(出典は各ページに明記)
export const FACTS = {
  founded: 2006,           // 本国 公司简介
  sizes: '2,000',          // 本国 公司简介
  countries: '60',         // 本国 公司简介
  shops: null,             // 取扱店数は shops.json の件数から算出
};

// 日本公式サイトのニュース(各記事は既存サイトへリンク)
export const NEWS = [
  { d: '2026.03.16', c: 'event', t: '「第53回東京モーターサイクルショー2026」に出展決定。恒例のじゃんけん大会も開催', u: 'https://www.timsun-japan.com/news/2323.html' },
  { d: '2025.08.27', c: 'product', t: 'ストリートハイグリップ TS720シリーズを発売', u: 'https://www.timsun-japan.com/news/2230.html' },
  { d: '2025.03.25', c: 'event', t: '第52回東京モーターサイクルショーに出展', u: 'https://prtimes.jp/main/html/rd/p/000000058.000070755.html' },
  { d: '2025.01.21', c: 'media', t: '「カブonly vol.18」にTIMSUNが掲載されました', u: 'https://www.timsun-japan.com/media/2113.html' },
  { d: '2025.01.21', c: 'event', t: '「AJ大阪主催 バイクの神様ミーティング2024」にブース出展', u: 'https://www.timsun-japan.com/news/2108.html' },
  { d: '2025.01.16', c: 'media', t: '「Moto Megane(モトメガネ)」で紹介されました', u: 'https://www.timsun-japan.com/news/2105.html' },
  { d: '2024.03.27', c: 'event', t: '第51回 東京モーターサイクルショー2024に出展', u: 'https://www.timsun-japan.com/news/2073.html' },
  { d: '2023.11.24', c: 'event', t: '第4回 XOVER POINTに出展', u: 'https://www.timsun-japan.com/news/2044.html' },
  { d: '2023.03.16', c: 'event', t: '第50回東京モーターサイクルショー/第39回大阪モーターサイクルショーに出展', u: 'https://www.timsun-japan.com/news/1912.html' },
  { d: '2022.03.09', c: 'event', t: 'JNCCの公式スポンサーに就任', u: 'https://www.timsun-japan.com/news/1798.html' },
  { d: '2020.11.07', c: 'media', t: '「モトチャンプ」11月号に掲載されました', u: 'https://www.timsun-japan.com/news/1695.html' },
  { d: '2019.10.21', c: 'media', t: 'ストリートハイグリップシリーズの性能比較特集が掲載されました', u: 'https://www.customjapan.net/shop/pages/timsun_lp_1910.aspx' },
  { d: '2018.07.12', c: 'event', t: '国内バイク販売店7社とティムソン工場視察ツアーを実施', u: 'https://www.timsun-japan.com/news/1474.html' },
];
export const NEWS_CAT = { event: 'イベント', product: '製品', media: 'メディア' };

// 日本公式サイトのFAQ(文言はトーンを整えて掲載)
export const FAQ = [
  { q: 'どこの国のメーカーですか?', a: '中国・山東省威海に本社を置く、2006年創業の二輪タイヤ専業メーカーです。日本では株式会社カスタムジャパンが総代理店として販売・サポートを行っています。' },
  { q: 'ストリートハイグリップとは何ですか?', a: 'グリップ力と耐摩耗性のバランス、ウェットグリップを追求した上位シリーズです。素材には低燃費タイヤと同様のものを使っています。' },
  { q: 'タイヤサイズはどこに表示されていますか?', a: 'タイヤのサイドウォールに表示されています。' },
  { q: '製造時期はどこを見ればわかりますか?', a: 'サイドウォールに4桁の刻印があります。例えば「0619」は2019年の第6週に製造されたことを示します。' },
  { q: '交換後の空気圧はいくつに設定すればよいですか?', a: '車両の指定空気圧を基準に設定してください。純正と異なるサイズに変更する場合は、販売店にご相談ください。' },
  { q: 'どのくらい摩耗したら交換が必要ですか?', a: 'スリップサインは使用限度を示すものです。スリップサインが出る前の交換をおすすめします。' },
  { q: '溝が残っていれば何年も使えますか?', a: 'タイヤは摩耗だけでなく経年でも劣化します。一般的な目安は3〜4年といわれますが、使用状況や環境によって異なるため、定期的に状態を確認してください。' },
  { q: 'タイヤはどう保管すればよいですか?', a: '直射日光と湿気を避け、雨のかからない風通しのよい日陰で保管してください。' },
];

// 日本公式サイト「ティムソンについて」掲載の販売店アンケートより(バイクショップ勤務の方の回答)
export const VOICES = [
  'トータル的に大変しっかりしたタイヤだと思います。',
  'スクーター用に仕入れています。自分のスクーターにも使用していますが、まったく問題ありません。',
  'コストパフォーマンスに優れ、ユーザー様に満足いただいています。',
];
