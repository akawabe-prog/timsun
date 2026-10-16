"""車種の人気度(市場での多さ)のスコアから、サイトで使う assets/data/popular.json を作る。

  python3 dev/make_popular.py [人気度データのパス]   (省略時は research_notes/車種の人気度/popularity.json)

人気度データは、新車販売台数(二輪車新聞の推計)、中古車の掲載台数(グーバイク)をクラス別の保有台数で補正した流通指数、
累計台数などから車種ごとに0〜100点を付けたもの(根拠と出典は research_notes/車種の人気度/notes.md。調査メモは公開しない)。
サイトには「車種名 → 点数」だけを書き出し、各タイヤの代表車種を点数の高い順に並べるのに使う。
"""
import json, pathlib, sys
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "research_notes/車種の人気度/popularity.json"
OUT = ROOT / "assets/data/popular.json"

data = json.loads(SRC.read_text(encoding="utf-8"))
scores = {name: v["score"] for name, v in data["models"].items() if isinstance(v.get("score"), (int, float))}
OUT.write_text(json.dumps({"asOf": data.get("asOf") or date.today().isoformat(), "scores": scores},
                          ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"{OUT.relative_to(ROOT)} を作成しました({len(scores)}車種)")
