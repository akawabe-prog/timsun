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
  { id: 'business', en: 'Business', ja: 'ビジネス', img: '/assets/img/series/business.webp', jpOnly: true,
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
// イベント(c: 'event')は en(英語のイベント名)と、写真があれば img を持つ。写真がないものは文字のサムネイルで表示する
export const NEWS = [
  { d: '2026.03.16', c: 'event', t: '「第53回東京モーターサイクルショー2026」に出展決定。恒例のじゃんけん大会も開催', en: 'TOKYO MOTORCYCLE SHOW 2026', u: 'https://www.timsun-japan.com/news/2323.html' },
  { d: '2025.08.27', c: 'product', t: 'ストリートハイグリップ TS720シリーズを発売', u: 'https://www.timsun-japan.com/news/2230.html' },
  { d: '2025.03.25', c: 'event', t: '第52回東京モーターサイクルショーに出展', en: 'TOKYO MOTORCYCLE SHOW 2025', img: '/assets/img/events/tms2025.webp', u: 'https://prtimes.jp/main/html/rd/p/000000058.000070755.html' },
  { d: '2025.01.21', c: 'media', t: '「カブonly vol.18」にTIMSUNが掲載されました', u: 'https://www.timsun-japan.com/media/2113.html' },
  { d: '2025.01.21', c: 'event', t: '「AJ大阪主催 バイクの神様ミーティング2024」にブース出展', en: 'BIKE NO KAMISAMA MEETING 2024', u: 'https://www.timsun-japan.com/news/2108.html' },
  { d: '2025.01.16', c: 'media', t: '「Moto Megane(モトメガネ)」で紹介されました', u: 'https://www.timsun-japan.com/news/2105.html' },
  { d: '2024.03.27', c: 'event', t: '第51回 東京モーターサイクルショー2024に出展', en: 'TOKYO MOTORCYCLE SHOW 2024', img: '/assets/img/events/tms2024.webp', u: 'https://www.timsun-japan.com/news/2073.html' },
  { d: '2023.11.24', c: 'event', t: '第4回 XOVER POINTに出展', en: 'XOVER POINT 2023', u: 'https://www.timsun-japan.com/news/2044.html' },
  { d: '2023.03.16', c: 'event', t: '第50回東京モーターサイクルショー/第39回大阪モーターサイクルショーに出展', en: 'TOKYO / OSAKA MOTORCYCLE SHOW 2023', u: 'https://www.timsun-japan.com/news/1912.html' },
  { d: '2022.03.09', c: 'event', t: 'JNCCの公式スポンサーに就任', en: 'JNCC OFFICIAL SPONSOR', u: 'https://www.timsun-japan.com/news/1798.html' },
  { d: '2020.11.07', c: 'media', t: '「モトチャンプ」11月号に掲載されました', u: 'https://www.timsun-japan.com/news/1695.html' },
  { d: '2019.10.21', c: 'media', t: 'ストリートハイグリップシリーズの性能比較特集が掲載されました', u: 'https://www.customjapan.net/shop/pages/timsun_lp_1910.aspx' },
  { d: '2018.07.12', c: 'event', t: '国内バイク販売店7社とティムソン工場視察ツアーを実施', en: 'FACTORY TOUR 2018', img: '/assets/img/brand/hq-2.webp', u: 'https://www.timsun-japan.com/news/1474.html' },
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

// ── トップ「注目のタイヤ」: 表示する型番と順番(バッジは商品データから付ける。売れ筋の根拠がないため「人気」は付けない) ──
export const FEATURED = ['TS720', 'TS689', 'TS880', 'TS659', 'TS660', 'TS690', 'TS871', 'TS600', 'TS602'];
export const NEW_PATTERNS = ['TS720'];   // 新着(2025年8月発売)

// ── トップ「使い方から選ぶ」 ──
export const USECASES = [
  { id: 'commute', title: '通勤・通学', text: '毎日のスクーターに。晴れの日も雨の日も。', series: 'scooter' },
  { id: 'work', title: '仕事のバイク', text: 'カブ・ジャイロ・ビジネス車の足元に。', series: 'business' },
  { id: 'touring', title: 'ツーリング', text: '長い距離を、安心して走るために。', series: 'touring-sport' },
  { id: 'offroad', title: 'オフロード', text: 'トレールからモトクロスまで。', series: 'adventure' },
];

// ── メディア掲載(実在の記事。外部リンク) ──
export const MEDIA = [
  { d: '2025.01', name: 'カブonly vol.18', t: '日本総代理店カスタムジャパンのTIMSUNが掲載', u: 'https://www.timsun-japan.com/media/2113.html' },
  { d: '2025.01', name: 'Moto Megane(モトメガネ)', t: 'TIMSUNが紹介されました', u: 'https://www.timsun-japan.com/news/2105.html' },
  { d: '2024.04', name: 'Motor-Fan', t: '東京モーターサイクルショー2024のTIMSUNブース', u: 'https://motor-fan.jp/?p=106020' },
  { d: '2020.11', name: 'モトチャンプ 11月号', t: '「ティムソンタイヤ」が掲載', u: 'https://www.timsun-japan.com/news/1695.html' },
  { d: '2019.10', name: 'ストリートハイグリップ性能比較特集', t: 'ストリートハイグリップシリーズの比較記事', u: 'https://www.customjapan.net/shop/pages/timsun_lp_1910.aspx' },
  { d: '2017.12', name: 'ヤングマシン', t: 'TS689WING・TS613の試乗インプレッション', u: 'https://young-machine.com/2017/12/03/5136/' },
];

// ── タイヤの読みもの(FAQ・サポートページに載っている事実の範囲で書く) ──
export const ARTICLES = [
  {
    slug: 'size', tag: '基礎知識', title: 'タイヤサイズの読み方', lead: '「120/70-12 51P TL」は何を表している?サイドウォールの表示の読み方。',
    body: [
      ['p', 'タイヤのサイズは、タイヤの側面(サイドウォール)に表示されています。ラジアル・バイアスの多くは「120/70-12 51P TL」のような形で表します。'],
      ['dl', [['120', 'タイヤの幅(mm)'], ['70', '扁平率(%)。タイヤの高さが幅の何%かを表します'], ['12', 'リム径(インチ)。ホイールの直径です'], ['51', 'ロードインデックス。タイヤ1本が支えられる重さの指数です'], ['P', '速度記号。決められた条件で走れる速度の上限を表します'], ['TL', 'チューブレス。TT(WT)はチューブを使うタイプです']]],
      ['p', 'バイアスタイヤの一部は「2.50-17」のように、幅(インチ)とリム径だけで表します。'],
      ['p', 'サイズがわかれば、適合タイヤ検索の「サイズから探す」で、合うTIMSUNタイヤを探せます。'],
    ],
    link: ['/fitment?tab=size', 'サイズから探す'],
  },
  {
    slug: 'date', tag: '基礎知識', title: '製造時期の見方', lead: 'サイドウォールの4桁の数字で、いつ作られたタイヤかがわかります。',
    body: [
      ['p', 'タイヤのサイドウォールには、製造時期を表す4桁の刻印があります。前の2桁が週、後ろの2桁が年です。'],
      ['p', 'たとえば「0619」は、2019年の第6週に製造されたことを表します。'],
    ],
  },
  {
    slug: 'replace', tag: '基礎知識', title: '交換時期の目安', lead: 'スリップサインと経年劣化。溝が残っていても注意したいこと。',
    body: [
      ['p', 'タイヤの溝には、使用限度を示す「スリップサイン」があります。スリップサインは使用できる限界の目印なので、出てくる前に交換することをおすすめします。'],
      ['p', 'タイヤは摩耗だけでなく、時間の経過でもゴムが劣化します。一般的な目安は3〜4年といわれますが、使い方や環境によって異なるため、メーカーとして正確な年数は定めていません。'],
      ['p', '迷ったときは、お近くの取扱店で状態を見てもらうのが確実です。'],
    ],
    link: ['/shops', '取扱店を探す'],
  },
  {
    slug: 'pressure', tag: '基礎知識', title: '空気圧の考え方', lead: 'タイヤを交換したら、空気圧はいくつにすればよい?',
    body: [
      ['p', '空気圧は、車両ごとに決められた指定空気圧を基準にしてください。指定空気圧は、車両の取扱説明書などで確認できます。'],
      ['p', '純正と異なるサイズのタイヤに変更する場合は、取扱店にご相談ください。'],
    ],
    link: ['/shops', '取扱店を探す'],
  },
  {
    slug: 'storage', tag: '基礎知識', title: 'タイヤの保管方法', lead: '外したタイヤや予備のタイヤは、どこに置けばよい?',
    body: [
      ['p', 'タイヤの保管は、冷暗所がいちばんです。'],
      ['p', '湿気や直射日光はゴムを変質させる原因になります。雨や水のかからない、風通しのよい日陰に保管してください。'],
    ],
  },
  {
    slug: 'shg', tag: '製品', title: 'ストリートハイグリップとは', lead: 'TIMSUNの上位グレード「ストリートハイグリップ」の考え方。',
    body: [
      ['p', 'ストリートハイグリップは、グリップ力と耐摩耗性のバランス、そしてウェットグリップを追求したTIMSUNの上位グレードです。'],
      ['p', '素材には、低燃費タイヤと同様のものを使っています。グリップ力・耐摩耗性・ウェットグリップにこだわった高品質モデルです。'],
      ['p', 'スクーター用のTS720 GECKOやTS690、スポーツ用のTS689、アドベンチャー用のTS880など、走るシーンごとにパターンをそろえています。'],
    ],
    link: ['/products', '製品を見る'],
  },
];

// ── ムービー(TOPの Movies)。動画は冒頭12秒の無音プレビュー(/assets/video/movies/)。
// 押すと元の動画(Instagram のリール、またはブランドページの紹介動画)を音声つき・全編で開く。v: 縦長で撮られたもの
const IG = (id) => `https://www.instagram.com/reel/${id}/`;
export const MOVIES = [
  { id: 'mr-timsun', t: 'ミスターティムソンの紹介', tag: 'Mr.TIMSUN', u: '/brand#gecko' },
  { id: 'Dd5Wu92FKN9', t: 'CIMAMotor 2026 TIMSUNブース', tag: 'EVENT', v: true },
  { id: 'DaFj3UrFZoh', t: '過酷な道があるから、挑戦は終わらない', tag: 'TECHNOLOGY' },
  { id: 'Da7vZSIDSDm', t: '世界60ヶ国以上で愛される、グローバルクオリティ', tag: 'BRAND' },
  { id: 'Dd3XXxmihW7', t: 'スタント競技大会 TIMSUN CUP', tag: 'EVENT' },
  { id: 'DZZ5TMjFIG6', t: 'Mr.TIMSUNの一日', tag: 'Mr.TIMSUN' },
  { id: 'Ddc_zVzCQGZ', t: 'TIMSUN CUPの審査員たち', tag: 'EVENT', v: true },
  { id: 'DZziSw5iAp1', t: 'タイヤの向きが前後で逆な理由', tag: 'TIPS' },
  { id: 'DZNBUOODbPN', t: '実は、特別なレース用タイヤじゃありません', tag: 'TECHNOLOGY' },
  { id: 'Dd8PxwpDlPT', t: 'CIMAMotor 2026 アフタームービー', tag: 'EVENT' },
  { id: 'DWoBlNngX_J', t: '東京モーターサイクルショー2026 御礼', tag: 'EVENT' },
].map((m) => ({ ...m, u: m.u || IG(m.id) }));
