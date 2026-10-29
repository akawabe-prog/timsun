"""公開用の商品データ(assets/data/fitment.json)を作る。

社内APIが使えない環境(GitHub Pages など)で、適合タイヤ検索・車種選択・製品ページの「適合車種」を表示するためのデータ。
dev/fitment-snapshot.json(社内で取得したもの。公開リポジトリには含めない)から、画面に要る項目だけを抜き出す。
  - 入れるのは 商品名・画像・サイズ・装着位置/チューブタイプ・適合車種 だけ。販売価格・在庫・アイコンは入れない(2026年10月29日の依頼)
  - 商品は、サイトに掲載している分(dev/master/master.json にある分)だけにする。廃番などは入れない
  python3 dev/make_catalog.py
"""
import json, pathlib

DEV = pathlib.Path(__file__).resolve().parent
SRC = DEV / "fitment-snapshot.json"
MASTER = DEV / "master" / "master.json"
OUT = DEV.parent / "assets" / "data" / "fitment.json"

hits = json.loads(SRC.read_text(encoding="utf-8"))
listed = {str(m["id"]) for m in json.loads(MASTER.read_text(encoding="utf-8"))["items"]}
items = []
for h in hits:
    if str(h.get("maker", {}).get("id")) != "490" or str(h["id"]) not in listed:   # TIMSUN以外・掲載していない商品は入れない
        continue
    spec = h.get("spec", {})
    items.append({
        "id": h["id"],
        "name": h["name"],
        "img": h.get("img", {}),
        "spec": {"3": spec.get("3", {}), "values": spec.get("values", [])},   # サイズ(3)と、装着位置・チューブタイプの判定に使う値
        "maker": {"id": "490"},
        "moto": h.get("moto", {}),
    })

OUT.write_text(json.dumps({"items": items}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"{OUT.name}: {len(items)}件 / {OUT.stat().st_size // 1024}KB")
