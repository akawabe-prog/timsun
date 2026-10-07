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

# 最上部のお知らせバー(1行)。差し替えはここだけ
ANNOUNCE = ("モンキー125(JB02 / JB03 / JB05)対応、TS880・TS720に新サイズを追加しました", "/fitment?q=%E3%83%A2%E3%83%B3%E3%82%AD%E3%83%BC125")

NAV = [
    ("/fitment", "タイヤを探す"),
    ("/products", "製品"),
    ("/technology", "テクノロジー"),
    ("/brand", "ブランド"),
    ("/shops", "取扱店"),
    ("/support", "サポート"),
]

HEAD = """<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{site}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<!-- og:url / og:image / canonical は公開ドメイン確定後に絶対URLで追加する -->
<meta name="theme-color" content="#0f110e">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=IBM+Plex+Mono:wght@500&family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css">
{css}</head>
<body>
"""

HEADER = """<a class="sr" href="#main">本文へ移動</a>
<header class="hd">
  <a class="topbar" href="{ann_url}"><span>{ann_text}</span></a>
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

FLOAT = """<div class="float-cta" aria-label="すぐに探す">
  <a class="fc-main" href="/fitment"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>適合検索</a>
  <a class="fc-sub" href="/shops"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/></svg>取扱店</a>
</div>
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
        f'      <a href="{u}"{here if u == cur else ""}>{label}</a>' for u, label in NAV)
    # ページ内アンカーメニュー: <!--anchors: #id ラベル | #id ラベル--> を <!--ANCHOR--> の位置に置く
    anchors = [x.strip().split(" ", 1) for x in (meta(src, "anchors") or [""])[0].split("|") if x.strip()]
    if anchors:
        links = "".join(f'<li><a href="{h}">{l}</a></li>' for h, l in anchors)
        anav = f'<nav class="anav" aria-label="このページの内容">\n  <ul class="anav-in">{links}</ul>\n</nav>\n'
        body = body.replace("<!--ANCHOR-->", anav)
    body = body.replace("<!--ANCHOR-->", "")
    html = (HEAD.format(title=title, desc=desc, site=SITE, css=css)
            + HEADER.format(nav=nav, ann_text=ANNOUNCE[0], ann_url=ANNOUNCE[1])
            + f'<main id="main">\n{body}\n</main>\n'
            + FLOAT + FOOTER + js + "</body>\n</html>\n")
    out = ROOT / path.name
    out.write_text(html, encoding="utf-8")
    return out.name

if __name__ == "__main__":
    names = [build(p) for p in sorted(PAGES.glob("*.html"))]
    print("生成:", ", ".join(names))
