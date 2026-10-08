"""商品マスター(CSV)から、サイトで使う商品データ assets/data/master.json を作る。

  python3 dev/make_master.py [マスターCSVのパス]   (省略時は dev/master/ItemList.csv)

マスターには仕入単価・仕入先・社内メモなど社内向けの項目が含まれるため、
CSVそのものは公開しない(dev/master/ は .gitignore で除外)。
ここで「公開してよい項目」だけを取り出して JSON にする。新しい項目を出すときは PUBLIC の考え方に沿って足すこと。

公開する項目: 品番・商品名・型番・シリーズ(グレード)・カテゴリ・装着位置・サイズ・仕様(構造・速度記号/荷重・
リム幅・トレッド幅・外径)・チューブタイプ・キャッチ・説明文・注意・商品画像・希望小売価格・公開通常価格・
代表適合車種・対応メーカー・セットの構成品番
公開しない項目: 仕入先・仕入単価・発注・在庫数量・倉庫・社内メモ・ABC分類・担当者・ASIN・JAN など
"""
import csv, io, json, pathlib, re, sys
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dev/master/ItemList.csv"
OUT = ROOT / "assets/data/master.json"
SEP = "毎日走るあなたへ、もっと安心を！"   # 説明文サブの「シリーズ共通の文」と「パターン固有の文」の区切り

raw = SRC.read_bytes()
for enc in ("utf-8-sig", "cp932"):
    try:
        text = raw.decode(enc)
        break
    except UnicodeDecodeError:
        continue
rows = list(csv.DictReader(io.StringIO(text)))

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
            rims = []
            for t in re.split(r"[,/、]", v):
                m = re.search(r"\d+(?:\.\d+)?", t)
                if m and m.group(0) not in rims:
                    rims.append(m.group(0))
            out["rims"] = rims
        elif k.startswith("トレッド幅") or k.startswith("外形") or k.startswith("外径"):
            key = "tw" if k.startswith("トレッド幅") else "od"
            m = re.match(r"([\d.]+)(?:\(([\d.]+)\s*[-~]\s*([\d.]+)\))?", v)
            if m:
                out[key] = m.group(1)
                if m.group(2):
                    out[key + "r"] = f"{m.group(2)}-{m.group(3)}"
    return out

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
        "size": r["商品サイズ"],
        "tube": "TL" if "TL" in r["備考"] or r["サブサイズ"] == "チューブレス" else ("TT" if r["備考"] or r["サブサイズ"] else ""),
        **sp,
        "catch": fix(r["キャッチ"]),
        "copy": pattern_text,
        "seriesCopy": series_text,
        "note": fix(r["注意"]),
        "imgs": imgs,
        "msrp": int(r["希望小売価格(税込)"]) if r["希望小売価格(税込)"] else None,
        "price": int(r["公開通常価格(税込)"]) if r["公開通常価格(税込)"] else None,
        "fits": [x for x in fix(r["代表適合車種"]).split("｜") if x],
        "makers": [x for x in r["対応メーカー"].split("_") if x],
        "set": is_set,
        "parts": [r[f"構成品番{i}"] for i in range(1, 10) if is_set and r.get(f"構成品番{i}")],
        "outlet": r["アウトレット"] == "1",
    }
    items.append({k: v for k, v in item.items() if v not in ("", None, [], False)})

OUT.write_text(json.dumps({"asOf": date.today().isoformat(), "source": SRC.name, "items": items},
                          ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"{OUT.relative_to(ROOT)} を作成しました({len(items)}商品)")
