#!/usr/bin/env python3
"""~/facts/INDEX.md を各調査ディレクトリの facts.md フロントマターから再生成する。

使い方:
    python3 ~/.claude/scripts/facts-index.py            # 再生成
    python3 ~/.claude/scripts/facts-index.py --check    # 差分があれば終了コード1（書き換えない）

INDEX.md は手で編集しない（F-LEDGER-02）。鮮度は取得日から90日超で「要再確認」（F-FRESH-01）。
標準ライブラリのみを使う。
"""
import sys
from datetime import date, datetime
from pathlib import Path

LEDGER = Path.home() / "facts"
STALE_DAYS = 90
OUTPUT_TYPES = [
    ("facts.md", "ファクト集"),
    ("compare.md", "比較"),
    ("bench.md", "相場"),
    ("regulation.md", "制度"),
]


def read_frontmatter(path):
    """--- で囲まれた先頭ブロックを平坦な dict にする。値は文字列のまま返す。"""
    fm = {}
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return fm
    if not lines or lines[0].strip() != "---":
        return fm
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" not in line or line.startswith((" ", "\t", "#")):
            continue
        key, _, value = line.partition(":")
        fm[key.strip()] = value.strip().strip('"').strip("'")
    return fm


def parse_date(text):
    try:
        return datetime.strptime(text[:10], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def freshness(collected, today):
    d = parse_date(collected)
    if d is None:
        return "取得日不明", True
    age = (today - d).days
    if age > STALE_DAYS:
        return f"要再確認（{age}日経過）", True
    return f"{age}日前", False


def scan(today):
    rows = []
    for d in sorted(LEDGER.iterdir(), reverse=True):
        if not d.is_dir() or d.name.startswith("."):
            continue
        facts = d / "facts.md"
        if not facts.exists():
            rows.append(
                {
                    "dir": d.name,
                    "topic": "（facts.md なし）",
                    "collected": "",
                    "fresh": "不完全",
                    "stale": True,
                    "types": [],
                    "caller": "",
                    "incomplete": True,
                }
            )
            continue
        fm = read_frontmatter(facts)
        collected = fm.get("collected", "")
        fresh, stale = freshness(collected, today)
        types = [label for name, label in OUTPUT_TYPES if (d / name).exists()]
        caller = fm.get("requested_from", "")
        rows.append(
            {
                "dir": d.name,
                "topic": fm.get("topic") or d.name,
                "collected": collected or "不明",
                "fresh": fresh,
                "stale": stale,
                "types": types,
                "caller": Path(caller).name if caller else "",
                "incomplete": False,
            }
        )
    return rows


def render(rows, today):
    out = [
        "# ファクト台帳",
        "",
        f"最終更新: {today.isoformat()} ／ 調査 {len(rows)}件",
        "",
        "このファイルは `~/.claude/scripts/facts-index.py` が生成する。手で編集しない。",
        f"取得日から{STALE_DAYS}日超は「要再確認」と表示する。",
        "",
    ]

    stale = [r for r in rows if r["stale"]]
    if stale:
        out += ["## 要再確認", ""]
        for r in stale:
            note = r["fresh"]
            out.append(f"- `{r['dir']}` — {r['topic']}（{note}）")
        out.append("")

    out += [
        "## 調査一覧",
        "",
        "| 調査 | 論点 | 取得日 | 鮮度 | 成果物 | 依頼元 |",
        "|---|---|---|---|---|---|",
    ]
    if not rows:
        out.append("| （まだ調査がありません） |  |  |  |  |  |")
    for r in rows:
        types = "・".join(r["types"]) if r["types"] else "—"
        out.append(
            f"| `{r['dir']}` | {r['topic']} | {r['collected']} | {r['fresh']} "
            f"| {types} | {r['caller'] or '—'} |"
        )
    out += [
        "",
        "## 使い方",
        "",
        "- 新規調査: 任意のプロジェクトで `/facts <論点>`",
        "- 正本はこのディレクトリ。呼び出し元にあるのはコピー",
        "- 規約: `~/.claude/references/fact-discipline.md`",
        "",
    ]
    return "\n".join(out)


def main():
    check = "--check" in sys.argv
    if not LEDGER.exists():
        if check:
            print(f"台帳がありません: {LEDGER}")
            return 1
        LEDGER.mkdir(parents=True)
        print(f"台帳を作成しました: {LEDGER}")

    today = date.today()
    rows = scan(today)
    body = render(rows, today)
    index = LEDGER / "INDEX.md"

    if check:
        current = index.read_text(encoding="utf-8") if index.exists() else ""
        if current != body:
            print("INDEX.md が最新ではありません。再生成してください。")
            return 1
        print("INDEX.md は最新です。")
        return 0

    index.write_text(body, encoding="utf-8")
    stale_n = sum(1 for r in rows if r["stale"])
    print(f"INDEX.md を再生成しました: {index}")
    print(f"  調査 {len(rows)}件 ／ 要再確認 {stale_n}件")
    return 0


if __name__ == "__main__":
    sys.exit(main())
