---
title: "Claude Code CHANGELOG v2.1.251 — CLAUDE_CODE_SUBAGENT_MODEL が既定値に降格"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-06"
domain: "github.com"
tags: [best-practices, claude-code, changelog, models, source:manual]
---

## 要約（3〜5行）
`CLAUDE_CODE_SUBAGENT_MODEL` の意味が「すべてを上書きする」から「既定値を決める」に変わった。
エージェント定義の `model:` と per-spawn の明示指定が環境変数より優先されるようになった。
すべてを強制したい場合は v2.1.257 で追加された `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` を使う。
2026-08-21 に収集した「セッションのモデルとスクリプト内のモデル指定の両方を上書きする」という記述は失効した。

## 主なポイント
- 優先順位: per-spawn 指定 > エージェント定義の `model:` > `CLAUDE_CODE_SUBAGENT_MODEL` > セッションのモデル
- 全上書きが必要なら `CLAUDE_CODE_SUBAGENT_MODEL_FORCE`（v2.1.257）
- 動的ワークフローのドキュメントには旧挙動（環境変数が両方を上書き）の記述が残っており、CHANGELOG と食い違う
- 2026-08-21 処理済みエントリの訂正にあたる

## NOCTAへの関連メモ
AGENTS 節でエージェント別にモデルを割り当てている（批評系は Opus 5・explorer 系は Haiku）。
この割り当てはエージェント定義の `model:` に書かれているため、環境変数より優先される側になった。
意図した割り当てが効きやすくなった変更で、NOCTA にとっては望ましい方向。
