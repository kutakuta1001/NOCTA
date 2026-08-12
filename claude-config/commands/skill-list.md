---
description: NOCTAの自作スキル・エージェント一覧を表示するとき
argument-hint: "--type commands / --type agents（省略可）"
---

# /skill-list

`~/.claude/scripts/list-skills.py` を JSON モードで実行し、
結果をClaudeのレスポンステキストとしてMarkdownテーブルで表示する。
（Bash出力は折りたたまれるため、このスキルはClaudeが直接整形して出力する）

## 手順

1. 以下を実行してJSONを取得する:

```bash
python3 ~/.claude/scripts/list-skills.py --json
```

2. 取得したJSONをパースし、引数 `$ARGUMENTS` に応じてフィルタリングする:
   - 引数なし: コマンドとエージェント両方を表示
   - `--type commands`: コマンドのみ
   - `--type agents`: エージェントのみ

3. 以下のMarkdown形式でClaudeのレスポンステキストとして直接出力する
   （コードブロックや折りたたみなしで、そのままチャットに表示する）:

```
## スラッシュコマンド（N件）

| コマンド | 説明 | 引数 |
|---|---|---|
| `/name` | description | hint |
...

## エージェント（N件）

| エージェント | 説明 | model | tools |
|---|---|---|---|
| `name` | description | model | tools |
...

**合計: N件**（コマンド N / エージェント N）
```

4. descriptionが空の場合は `—` と表示する
5. スクリプト本体: `~/.claude/scripts/list-skills.py`
