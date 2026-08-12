#!/usr/bin/env python3
"""
NOCTA スキル一覧スクリプト
~/.claude/commands/ と ~/.claude/agents/ と ~/.claude/skills/ を走査し、
スキル名・説明・引数ヒントを出力する。

使い方:
  python3 ~/.claude/scripts/list-skills.py          # テーブル表示
  python3 ~/.claude/scripts/list-skills.py --json   # JSON出力（他スクリプトから呼び出し用）
  python3 ~/.claude/scripts/list-skills.py --type commands   # コマンドのみ
  python3 ~/.claude/scripts/list-skills.py --type agents     # エージェントのみ
  python3 ~/.claude/scripts/list-skills.py --type skills     # エージェントスキルのみ
"""

import json
import re
import sys
from pathlib import Path


COMMANDS_DIR = Path.home() / ".claude" / "commands"
AGENTS_DIR   = Path.home() / ".claude" / "agents"
SKILLS_DIR   = Path.home() / ".claude" / "skills"


def parse_frontmatter(text: str) -> dict:
    """YAMLフロントマターを簡易パース（外部ライブラリ不要）"""
    m = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return {}
    result = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            key, _, val = line.partition(":")
            result[key.strip()] = val.strip().strip('"').strip("'")
    return result


def collect_commands() -> list[dict]:
    """~/.claude/commands/*.md を収集"""
    if not COMMANDS_DIR.exists():
        return []
    items = []
    for f in sorted(COMMANDS_DIR.glob("*.md")):
        text = f.read_text(encoding="utf-8")
        fm   = parse_frontmatter(text)
        items.append({
            "type":        "command",
            "name":        f"/{f.stem}",
            "description": fm.get("description", ""),
            "hint":        fm.get("argument-hint", ""),
            "file":        str(f),
        })
    return items


def collect_agents() -> list[dict]:
    """~/.claude/agents/*.md を収集"""
    if not AGENTS_DIR.exists():
        return []
    items = []
    for f in sorted(AGENTS_DIR.glob("*.md")):
        text = f.read_text(encoding="utf-8")
        fm   = parse_frontmatter(text)
        items.append({
            "type":        "agent",
            "name":        fm.get("name", f.stem),
            "description": fm.get("description", ""),
            "model":       fm.get("model", ""),
            "tools":       fm.get("tools", ""),
            "file":        str(f),
        })
    return items


def collect_skills() -> list[dict]:
    """~/.claude/skills/*/SKILL.md を収集"""
    if not SKILLS_DIR.exists():
        return []
    items = []
    for f in sorted(SKILLS_DIR.glob("*/SKILL.md")):
        text = f.read_text(encoding="utf-8")
        fm   = parse_frontmatter(text)
        items.append({
            "type":        "skill",
            "name":        fm.get("name", f.parent.name),
            "description": fm.get("description", ""),
            "file":        str(f),
        })
    return items


def print_table(commands: list[dict], agents: list[dict], skills: list[dict]) -> None:
    W = 32  # 名前列の幅

    if commands:
        print(f"\n{'─'*70}")
        print(f"  スラッシュコマンド  ({len(commands)} 件)")
        print(f"{'─'*70}")
        for c in commands:
            hint = f"  [{c['hint']}]" if c["hint"] else ""
            desc = c["description"] or "（説明なし）"
            print(f"  {c['name']:<{W}} {desc}{hint}")

    if agents:
        print(f"\n{'─'*70}")
        print(f"  エージェント  ({len(agents)} 件)")
        print(f"{'─'*70}")
        for a in agents:
            model = f"  ({a['model']})" if a["model"] else ""
            tools = f"  [{a['tools']}]" if a["tools"] else ""
            desc  = a["description"] or "（説明なし）"
            print(f"  {a['name']:<{W}} {desc}{model}{tools}")

    if skills:
        print(f"\n{'─'*70}")
        print(f"  エージェントスキル  ({len(skills)} 件)")
        print(f"{'─'*70}")
        for s in skills:
            desc = s["description"] or "（説明なし）"
            print(f"  {s['name']:<{W}} {desc}")

    total = len(commands) + len(agents) + len(skills)
    print(f"\n  合計: {total} 件  "
          f"(コマンド {len(commands)} / エージェント {len(agents)}"
          f" / スキル {len(skills)})\n")


def main():
    args = sys.argv[1:]
    as_json  = "--json"  in args
    only = None
    if "--type" in args:
        only = args[args.index("--type") + 1]

    commands = collect_commands() if only in (None, "commands") else []
    agents   = collect_agents()   if only in (None, "agents")   else []
    skills   = collect_skills()   if only in (None, "skills")   else []

    if as_json:
        print(json.dumps({"commands": commands, "agents": agents,
                          "skills": skills},
                         ensure_ascii=False, indent=2))
    else:
        print_table(commands, agents, skills)


if __name__ == "__main__":
    main()
