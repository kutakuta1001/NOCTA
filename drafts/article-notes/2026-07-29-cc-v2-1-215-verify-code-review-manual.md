---
title: "[changelog v2.1.215] /verify・/code-review が自動実行されなくなり明示呼び出しに"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-07-29"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.215 で `/verify` と `/code-review` スキルが自動実行されなくなり、明示的な呼び出しが必要になった。あわせて長時間実行ツールにハートビート進捗表示が追加された。

## 主なポイント
- /verify・/code-review は Claude が自律判断で起動しなくなった（明示呼び出しのみ）
- 品質チェックをワークフローに組み込む場合は、スキル・手順書に明示的な実行ステップを書く必要がある
- 長時間ツールのハートビート表示で「固まったように見える」問題が改善

## NOCTAへの関連メモ
NOCTA のレビューは Codex（/review-diff）・persona-review 等の明示呼び出しが主軸のため影響は小さい。コミット前レビューを確実にしたい場合は手順（スキル本文）に /code-review 実行を明記する。
