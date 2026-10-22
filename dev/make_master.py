"""商品マスター(CSV)から、サイトで使う商品データ dev/master/master.json を作る(非公開。dev/build.py が各ページに必要な分だけ埋め込む)。

  python3 dev/make_master.py [マスターCSVのパス]   (省略時は dev/master/ItemList.csv)

マスターには仕入単価・仕入先・社内メモなど社内向けの項目が含まれるため、
CSVそのものは公開しない(dev/master/ は .gitignore で除外)。
ここで「公開してよい項目」だけを取り出して JSON にする。新しい項目を出すときは PUBLIC の考え方に沿って足すこと。

公開する項目(サイトの表示に使うものだけ。SHOW): 品番・商品名・型番・グレード・装着位置・サイズ・メインサイズ・速度記号/荷重・
チューブタイプ・リム幅・トレッド幅・外径・キャッチ・説明文・商品画像・希望小売価格・代表適合車種・シリーズ(ジャンルから決めたもの)
掲載しない商品: 廃番(CJ廃番・メーカー廃番・手動廃番)、Web非表示、タイヤ以外・チューブ、訳あり、前後セット
公開しない項目: 仕入先・仕入単価・発注・在庫数量・倉庫・社内メモ・ABC分類・担当者・ASIN・JAN、
オンラインストアの公開価格・カテゴリ・ジャンル・対応メーカー・構造・注意 など(表示に使わないもの)
"""
import csv, io, json, pathlib, re, sys
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dev/master/ItemList.csv"
OUT = ROOT / "dev/master/master.json"   # 公開しない。まとめてダウンロードできるファイルを残さないため
SEP = "毎日走るあなたへ、もっと安心を！"   # 説明文サブの「シリーズ共通の文」と「パターン固有の文」の区切り

raw = SRC.read_bytes()
for enc in ("utf-8-sig", "cp932"):
    try:
        text = raw.decode(enc)
        break
    except UnicodeDecodeError:
        continue
rows = list(csv.DictReader(io.StringIO(text)))
# 希望小売価格が空欄でも「オープン」と表示する品番(dev/open-price.json)
OPEN_IDS = set(json.loads((ROOT / "dev/open-price.json").read_text(encoding="utf-8"))["ids"])

def fix(s):
    # 改行が「\\n」という文字で入っているので戻す。cp932 で失われた文字も戻す
    s = (s or "").replace("\\n", "\n").replace("CO?", "CO₂")
    s = re.sub(r"(?<=[\dcc])\?(?=[’'\d])", "〜", s)   # 「250cc?400cc」「’90?’00年代」の波ダッシュ
    return s.strip()

def spec_of(s):
    """仕様欄(「標準リム幅：3.00」などの行)を項目に分ける"""
    out = {}
    lines = [l.strip() for l in fix(s).split("\n") if l.strip()]
    if lines and "タイヤ" in lines[0] and "：" not in lines[0]:
        out["build"] = lines[0]                       # バイアスタイヤ / ラジアルタイヤ
    for l in lines:
        if "：" not in l:
            continue
        k, v = [x.strip() for x in l.split("：", 1)]
        if k.startswith("速度記号"):
            out["load"] = v
        elif k == "ジャンル":
            out["genre"] = v
        elif k == "標準リム幅":
            out["std"] = (re.search(r"\d+(?:\.\d+)?", v) or [None])[0]
        elif k == "許容リム幅":
            # 区切りの無い書き方(「1.201.351.401.501.60」)もあるので、小数2けたの数字として拾う
            rims = []
            for m in re.findall(r"\d+\.\d{2}", v):
                if m not in rims:
                    rims.append(m)
            out["rims"] = rims
        elif k.startswith("トレッド幅") or k.startswith("外形") or k.startswith("外径"):
            key = "tw" if k.startswith("トレッド幅") else "od"
            m = re.match(r"([\d.]+)(?:\(([\d.]+)\s*[-~]\s*([\d.]+)\))?", v)
            if m:
                out[key] = m.group(1)
                if m.group(2):
                    out[key + "r"] = f"{m.group(2)}-{m.group(3)}"
    return out

# サイトの表示に使う項目(master.json に書き出すのはこれだけ)
SHOW = ["id", "name", "type", "grade", "pos", "size", "mainSize", "load", "tube", "std", "rims", "tw", "twr", "od", "odr",
        "catch", "copy", "seriesCopy", "imgs", "msrp", "fits", "series"]

# ジャンル(またはカテゴリ)→ シリーズ。products.js の SERIES の id
GENRE_SERIES = [(r"ビジネス", "business"), (r"スクーター", "scooter"), (r"オフロードレース", "motocross"),
                (r"オフロード|アドベンチャー", "adventure"), (r"スノー|ウインター", "snow"), (r"オンロード", "street-sport")]

def series_of(genre):
    for pat, sid in GENRE_SERIES:
        if genre and re.search(pat, genre):
            return sid
    return None

def main_size(s):
    """メインサイズ(「2.25-17 4PR WT F_2.25-17 4PR WT R」)を表示用に整える。
    装着位置の F/R は表で分かるので外し、同じサイズの重複はまとめる(前後で違えば「 / 」でつなぐ)"""
    out = []
    for part in (s or "").split("_"):
        t = re.sub(r"\s+[FR]$", "", part.strip())
        if t and t not in out:
            out.append(t)
    return " / ".join(out)

def copy_of(sub):
    """説明文サブを、シリーズ共通の文とパターン固有の文に分ける"""
    s = fix(sub)
    if SEP in s:
        head, tail = s.rsplit(SEP, 1)
        return head.strip(), tail.strip()
    return "", s

items = []
for r in rows:
    # Webに出している商品のうち、タイヤだけ(チューブ・販促物・訳ありは除く)
    if r["アウトレット"] == "1":
        continue
    # 前後セットは掲載しない(2026年10月22日の依頼)
    if r["セット"] == "1" or r["商品名前"] == "【セット品】" or r["商品名"].startswith("【セット品】"):
        continue
    # 廃番(CJ廃番・メーカー廃番・手動廃番のどれか)は掲載しない(2026年10月22日の依頼)
    if "1" in (r["CJ廃番"], r["メーカー廃番"], r["手動廃番"]):
        continue
    if r["Web非表示"] != "0" or r["メインカテゴリ名"] != "タイヤ" or r["カテゴリ名"] == "チューブ":
        continue
    series_text, pattern_text = copy_of(r["商品説明サブ"])
    sp = spec_of(r["仕様"])
    imgs = [r[f"商品画像{i}"] for i in range(1, 11) if r.get(f"商品画像{i}")]
    is_set = r["セット"] == "1"
    item = {
        "id": r["品番"],
        "name": fix(r["商品名"]),
        "type": fix(r["メーカータイプ"]),                 # 型番の表記(TS720F GECKO)
        "grade": r["メインシリーズ"],                     # ストリートハイグリップ / スタンダード
        "cat": r["カテゴリ名"],
        "pos": r["サブタイプ"] or r["用途"].replace("用", ""),
        "size": r["商品サイズ"] or main_size(r["メインサイズ"]).split(" ")[0],   # 商品サイズが空欄の商品はメインサイズから(110/70-12)
        "mainSize": main_size(r["メインサイズ"]),   # サイト上のサイズ表記はこれを使う
        "tube": "TL" if "TL" in r["備考"] or r["サブサイズ"] == "チューブレス" else ("TT" if r["備考"] or r["サブサイズ"] else ""),
        **sp,
        "catch": fix(r["キャッチ"]),
        "copy": pattern_text,
        "seriesCopy": series_text,
        "note": fix(r["注意"]),
        "imgs": imgs,
        # 0 は「オープン」。空欄でも OPEN_IDS の品番は 0(オープン)として扱う
        "msrp": int(r["希望小売価格(税込)"]) if r["希望小売価格(税込)"] else (0 if r["品番"] in OPEN_IDS else None),
        "price": int(r["公開通常価格(税込)"]) if r["公開通常価格(税込)"] else None,
        "fits": [x for x in fix(r["代表適合車種"]).split("｜") if x],
        "makers": [x for x in r["対応メーカー"].split("_") if x],
        "set": is_set,
        "parts": [r[f"構成品番{i}"] for i in range(1, 10) if is_set and r.get(f"構成品番{i}")],
        "outlet": r["アウトレット"] == "1",
    }
    # シリーズの振り分け(data.js に未登録の型番用)は、ジャンル・カテゴリからここで決めておく
    item["series"] = series_of(item.get("genre") or item.get("cat"))
    # サイトに表示する項目だけを書き出す(オンラインストア価格・カテゴリ・対応メーカーなどは出さない)。
    # 空の項目も書き出さない(希望小売価格の 0 は「オープン価格」の意味なので残す)
    items.append({k: v for k, v in item.items() if k in SHOW and not (v is None or v is False or v == "" or v == [])})

OUT.write_text(json.dumps({"asOf": date.today().isoformat(), "source": SRC.name, "items": items},
                          ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"{OUT.relative_to(ROOT)} を作成しました({len(items)}商品)")
