"""GitHub Pages 用の公開フォルダ(_site/)を作る。

サイトはCJ開発ガイドどおりドメイン直下からのパス(/assets/... や /products)で書いている。
GitHub Pages はリポジトリ名の下(例: /timsun/)で公開されるため、公開時だけパスの先頭に付け足す。
  python3 dev/build_pages.py --base /timsun
GitHub Actions(.github/workflows/pages.yml)が push のたびに実行する。
"""
import argparse, pathlib, re, shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"
PAGES = ["assets", "fitment", "products", "technology", "brand", "shops", "support", "news", "dealers", "magazine"]

ap = argparse.ArgumentParser()
ap.add_argument("--base", default="/timsun")
ap.add_argument("--origin", default="https://akawabe-prog.github.io")   # 共有(OGP)・canonical の絶対URLの置き換え先
args = ap.parse_args()
base = args.base.rstrip("/")
PROD = "https://www.timsun-japan.com"   # build.py の ORIGIN

# 引用符・括弧の直後にある /assets や /products などだけを書き換える(外部URLの途中には触れない)
PATH_RE = re.compile(r'(["\'`(=])/(' + "|".join(PAGES) + r')(?=[/"\'`?#)\s])')

def rewrite(text):
    text = PATH_RE.sub(lambda m: f"{m.group(1)}{base}/{m.group(2)}", text)
    text = text.replace('href="/"', f'href="{base}/"')
    # OGP・canonical の本番ドメインを、テスト公開のURLに置き換える
    return text.replace(f'"{PROD}/', f'"{args.origin}{base}/').replace(f'"{PROD}"', f'"{args.origin}{base}/"')

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
for html in ROOT.glob("*.html"):
    (OUT / html.name).write_text(rewrite(html.read_text(encoding="utf-8")), encoding="utf-8")
shutil.copytree(ROOT / "assets", OUT / "assets")
for f in (OUT / "assets").rglob("*"):
    if f.suffix in (".js", ".css", ".webmanifest"):
        f.write_text(rewrite(f.read_text(encoding="utf-8")), encoding="utf-8")
(OUT / ".nojekyll").write_text("")
print(f"_site/ を作成しました(base: {base})")
