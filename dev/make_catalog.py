"""公開用の商品データ(assets/data/catalog.json)を作る。

社内APIが使えない環境(GitHub Pages など)で製品ページ・適合検索を表示するためのデータ。
dev/fitment-snapshot.json(社内で取得したもの。公開リポジトリには含めない)から、
画面に表示する項目だけを抜き出す。価格・在庫は作成時点の値で固定される。
  python3 dev/make_catalog.py
"""
import datetime, json, pathlib

DEV = pathlib.Path(__file__).resolve().parent
SRC = DEV / "fitment-snapshot.json"
OUT = DEV.parent / "assets" / "data" / "catalog.json"

hits = json.loads(SRC.read_text(encoding="utf-8"))
items = []
for h in hits:
    if str(h.get("maker", {}).get("id")) != "490":   # TIMSUN以外は入れない
        continue
    items.append({
        "id": h["id"],
        "name": h["name"],
        "img": h.get("img", {}),
        "price": {"regular": {"pc": {"taxIn": h.get("price", {}).get("regular", {}).get("pc", {}).get("taxIn")}}},
        "status": {"txt": h.get("status", {}).get("txt", "")},
        "icons": [{"cd": i.get("cd"), "txt": i.get("txt")} for i in h.get("icons", [])],
        "spec": h.get("spec", {}),
        "maker": {"id": "490"},
        "moto": h.get("moto", {}),
    })

asof = datetime.date.fromtimestamp(SRC.stat().st_mtime).isoformat()
OUT.write_text(json.dumps({"asOf": asof, "items": items}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"{OUT.name}: {len(items)}件 / {OUT.stat().st_size // 1024}KB / 時点 {asof}")
