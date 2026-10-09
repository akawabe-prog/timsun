"""ページ生成: dev/pages/*.html の本文に共通のhead・ヘッダー・フッターを付けてルートに書き出す。

ヘッダー・フッター・メニューを1か所で管理するためのスクリプト。
公開するのは生成後のルートの *.html だけで、dev/ はアップロードしない。
  python3 dev/build.py

ページ原稿の先頭に、次のコメントでページ情報を書く:
  <!--title: ページタイトル-->
  <!--desc: meta description-->
  <!--nav: /products-->          (メニューで現在地にするURL。なければ省略)
  <!--css: /assets/css/xxx.css--> (ページ専用CSS。複数可)
  <!--js: /assets/js/xxx.js-->    (ページ専用JS。複数可)
  <!--anchors: #id ラベル | #id ラベル-->  (ページ内アンカーメニュー。本文の <!--ANCHOR--> の位置に入る)
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ROOT / "dev" / "pages"
SITE = "TIMSUN(ティムソン)日本公式サイト"
# 共有(OGP)・canonical に使う公開ドメイン。GitHub Pages 用の書き出しでは build_pages.py がテスト公開のURLに置き換える
ORIGIN = "https://www.timsun-japan.com"
OG_IMAGE = "/assets/img/ogp.jpg"   # 1200×630

NAV = [
    ("/fitment", "タイヤを探す"),
    ("/products", "製品"),
    ("/technology", "テクノロジー"),
    ("/brand", "ブランド"),
    ("/shops", "取扱店"),
    ("/support", "サポート"),
]

# グローバルメニューのパネル(マウスを乗せるとサムネイル付きで開く。参考: sp-connect.customjapan.net)
# tiles: (URL, 名前, 種類, 素材)  種類 img=写真 / logo=ロゴ / icon=アイコン / dark=文字だけの黒タイル
# banners: (URL, 画像, 小見出し, 見出し)
CJ_LOGO = "https://cdn.customjapan.net/logo/maker/"
ICONS = {
    "faq": '<path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><circle cx="12" cy="17.5" r=".6" fill="currentColor"/><circle cx="12" cy="12" r="9"/>',
    "book": '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    "pdf": '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    "size": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>',
}
MEGA = {
    "/fitment": {"label": "Find Your Tyre", "all": ("/fitment", "適合タイヤ検索へ"),
        "tiles": [("/fitment?m=1", "ホンダ", "logo", CJ_LOGO + "m1_honda.webp"), ("/fitment?m=2", "ヤマハ", "logo", CJ_LOGO + "m2_yamaha.webp"),
                  ("/fitment?m=3", "スズキ", "logo", CJ_LOGO + "m3_suzuki.webp"), ("/fitment?m=4", "カワサキ", "logo", CJ_LOGO + "m4_kawasaki.webp"),
                  ("/fitment?m=20", "海外メーカー", "dark", "OVERSEAS"), ("/fitment?tab=size", "サイズから", "icon", "size")],
        "banners": [("/fitment", "/assets/img/banner/ride.webp", "BY MODEL", "車種・型式から探す"),
                    ("/fitment?tab=size", "/assets/img/banner/tread.webp", "BY SIZE", "サイズから探す")]},
    "/products": {"label": "Product Series", "all": ("/products", "すべての製品"),
        "tiles": [("/products#scooter", "スクーター", "img", "/assets/img/series/scooter.webp"), ("/products#street-sport", "ストリートスポーツ", "img", "/assets/img/series/street-sport.webp"),
                  ("/products#touring-sport", "ツーリングスポーツ", "img", "/assets/img/series/touring-sport.webp"), ("/products#adventure", "アドベンチャー", "img", "/assets/img/series/adventure.webp"),
                  ("/products#motocross", "モトクロス", "img", "/assets/img/series/motocross.webp"), ("/products#vintage", "ビンテージ", "img", "/assets/img/series/vintage.webp"),
                  ("/products#cruising", "クルーザー", "img", "/assets/img/series/cruising.webp"), ("/products#business", "ビジネス", "img", "/assets/img/series/business.webp"),
                  ("/products#snow", "スノー", "img", "/assets/img/series/snow.webp")],
        "banners": [("/products?p=TS720", "/assets/video/hero-poster.webp", "NEW — STREET HIGH GRIP", "TS720 GECKO"),
                    ("https://cdn.customjapan.net/catalog/490_timsun_catalog_2025.pdf", "/assets/img/banner/factory.webp", "CATALOG", "総合カタログ2025(PDF)")]},
    "/technology": {"label": "Technology & Quality", "all": ("/technology", "テクノロジー&品質へ"),
        "tiles": [("/technology#rd", "開発体制", "img", "/assets/video/factory-poster.webp"), ("/technology#quality", "品質マネジメント", "img", "/assets/img/banner/factory.webp"),
                  ("/technology#certification", "製品認証", "img", "/assets/img/banner/tread.webp"), ("/technology#manufacturing", "製造", "img", "/assets/video/hero-poster.webp"),
                  ("/technology#gecko-philosophy", "ヤモリの設計思想", "mascot", "/assets/img/mr-timsun.webp")],
        "banners": []},
    "/brand": {"label": "Brand", "all": ("/brand", "ブランドへ"),
        "tiles": [("/brand#promise", "ティムソンの約束", "img", "/assets/video/hero-poster.webp"), ("/brand#global", "世界のTIMSUN", "img", "/assets/img/banner/ride.webp"),
                  ("/brand#gecko", "ミスターティムソン", "mascot", "/assets/img/mr-timsun.webp"), ("/brand#japan", "日本総代理店", "img", "/assets/video/factory-poster.webp"),
                  ("/news", "ニュース&イベント", "img", "/assets/img/banner/tread.webp")],
        "banners": []},
    "/support": {"label": "Support", "all": ("/support", "サポートへ"),
        "tiles": [("/support#faq", "よくあるご質問", "icon", "faq"), ("/magazine", "タイヤの読みもの", "icon", "book"),
                  ("/support#basics", "タイヤの基礎知識", "icon", "size"), ("/support#catalog", "カタログ", "icon", "pdf"), ("/support#contact", "お問い合わせ", "icon", "mail")],
        "banners": []},
}

def tile(u, name, kind, src):
    ext = ' target="_blank" rel="noopener"' if u.startswith("http") else ""
    if kind in ("img", "mascot", "logo"):
        ph = f'<img src="{src}" alt="" loading="lazy" decoding="async">'
    elif kind == "icon":
        ph = f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[src]}</svg>'
    else:
        ph = f'<span>{src}</span>'
    return f'<a class="mt mt-{kind}" href="{u}"{ext}><span class="mt-ph">{ph}</span><span class="mt-name">{name}</span></a>'

def mega(u):
    m = MEGA.get(u)
    if not m:
        return ""
    tiles = "".join(tile(*t) for t in m["tiles"])
    banners = "".join(
        f'<a class="mb" href="{bu}"{" target=\"_blank\" rel=\"noopener\"" if bu.startswith("http") else ""}>'
        f'<img src="{img}" alt="" loading="lazy" decoding="async"><span class="mb-eb">{eb}</span><span class="mb-t">{t}</span></a>'
        for bu, img, eb, t in m["banners"])
    return (f'<div class="mega"><div class="mega-in"><p class="mega-label">{m["label"]}</p>'
            f'<div class="mega-tiles n{len(m["tiles"])}">{tiles}</div>'
            + (f'<div class="mega-banners">{banners}</div>' if banners else "")
            + f'<p class="mega-all"><a href="{m["all"][0]}">{m["all"][1]}</a></p></div></div>')

HEAD = """<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="{ogtype}">
<meta property="og:site_name" content="{site}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="TIMSUN 日本公式サイト">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{image}">
<meta name="theme-color" content="#0f110e">
<link rel="icon" href="/assets/img/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" type="image/png" href="/assets/img/icon-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/assets/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=IBM+Plex+Mono:wght@500&family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css">
{css}</head>
<body>
"""

HEADER = """<a class="sr" href="#main">本文へ移動</a>
<header class="hd">
  <div class="hd-in">
    <a class="logo" href="/" aria-label="TIMSUN トップへ"><img src="https://cdn.customjapan.net/logo/maker/m490_timsun.webp" alt="TIMSUN Excel Beyond" width="500" height="150"></a>
    <nav class="gnav" id="gnav" aria-label="メイン">
{nav}
    </nav>
    <a class="btn btn-sm no-arrow hd-cta" href="/fitment">適合検索</a>
    <button class="menu" type="button" aria-expanded="false" aria-controls="gnav" aria-label="メニュー"><span></span></button>
  </div>
</header>
"""

FOOTER = """<footer class="ft">
  <div class="wrap ft-top">
    <div class="ft-brand">
      <img src="https://cdn.customjapan.net/logo/maker/m490_timsun.webp" alt="TIMSUN" width="500" height="150" loading="lazy">
      <p>TIMSUN(ティムソン)日本総代理店<br>株式会社カスタムジャパン</p>
    </div>
    <div class="ft-cols">
      <div><h4>Products</h4><a href="/fitment">適合タイヤ検索</a><a href="/products">製品一覧</a><a href="/technology">テクノロジー&amp;品質</a></div>
      <div><h4>Brand</h4><a href="/brand">ブランド</a><a href="/brand#gecko">ミスターティムソン</a><a href="/news">ニュース&amp;イベント</a><a href="/magazine">タイヤの読みもの</a></div>
      <div><h4>Support</h4><a href="/shops">取扱店</a><a href="/support">FAQ・お問い合わせ</a><a href="/dealers">販売店の方へ</a><a href="https://www.instagram.com/timsun_japan_gram/" target="_blank" rel="noopener">Instagram</a></div>
    </div>
  </div>
  <div class="wrap ft-bottom">
    <span>© TIMSUN Japan / Custom Japan Co., Ltd.</span>
    <span><a href="https://timsun.cn/" target="_blank" rel="noopener">TIMSUN Global(本国サイト)</a></span>
  </div>
</footer>
"""

def meta(src, key):
    return re.findall(rf"<!--{key}:\s*(.*?)\s*-->", src)

def build(path):
    src = path.read_text(encoding="utf-8")
    title = (meta(src, "title") or [SITE])[0]
    desc = (meta(src, "desc") or [""])[0]
    cur = (meta(src, "nav") or [""])[0]
    css = "".join(f'<link rel="stylesheet" href="{c}">\n' for c in meta(src, "css"))
    js = "".join(f'<script type="module" src="{j}"></script>\n' for j in ["/assets/js/site.js", *meta(src, "js")])
    body = re.sub(r"<!--(title|desc|nav|css|js|anchors):.*?-->\n?", "", src).strip()
    here = ' aria-current="page"'
    nav = "\n".join(
        f'      <div class="gitem{" has-mega" if u in MEGA else ""}"><a class="gtop" href="{u}"{here if u == cur else ""}>{label}</a>{mega(u)}</div>'
        for u, label in NAV)
    # ページ内アンカーメニュー: <!--anchors: #id ラベル | #id ラベル--> を <!--ANCHOR--> の位置に置く
    anchors = [x.strip().split(" ", 1) for x in (meta(src, "anchors") or [""])[0].split("|") if x.strip()]
    if anchors:
        links = "".join(f'<li><a href="{h}">{l}</a></li>' for h, l in anchors)
        anav = f'<nav class="anav" aria-label="このページの内容">\n  <ul class="anav-in">{links}</ul>\n</nav>\n'
        body = body.replace("<!--ANCHOR-->", anav)
    body = body.replace("<!--ANCHOR-->", "")
    url = ORIGIN + ("/" if path.stem == "index" else f"/{path.stem}")
    html = (HEAD.format(title=title, desc=desc, site=SITE, css=css, url=url, image=ORIGIN + OG_IMAGE,
                        ogtype="website" if path.stem == "index" else "article")
            + HEADER.format(nav=nav)
            + f'<main id="main">\n{body}\n</main>\n'
            + FOOTER + js + "</body>\n</html>\n")
    out = ROOT / path.name
    out.write_text(html, encoding="utf-8")
    return out.name

if __name__ == "__main__":
    names = [build(p) for p in sorted(PAGES.glob("*.html"))]
    print("生成:", ", ".join(names))
