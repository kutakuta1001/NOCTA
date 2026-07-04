---
title: "Hooksは規律・CLAUDE.mdは助言（Prompt管建议、Hook管纪律）"
url: "https://x.com/sitinme/status/2071212010533273867"
date: "2026-07-04"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Code の Hooks は最も過小評価されている機能層だと指摘。公式ベストプラクティスは「毎回必ず発生すべきこと」はCLAUDE.mdに書いてモデルの自覚に頼るのではなく、hooksに委ねるべきだとしている。「CLAUDE.mdは提案（advisory）、hooksは確定的実行（deterministic）」という一文で要約。

## 主なポイント
- 「毎回必ず発生すること」はhooksに委ねる
- CLAUDE.md = 提案（モデルの判断に依存）、hooks = 確定的実行（保証される）

## NOCTAへの関連メモ
NOCTAのR-02（approved/には触れない）・R-03（SNS自動投稿しない）は現状CLAUDE.mdの記述による「助言的」ルールのみで運用されている。これらは「毎回必ず守られるべき」制約であり、PreToolUseフックでapproved/への書き込みやSNS投稿系操作を技術的にブロックする決定論的ガードレール化が有効な適用先になりうる（レポートの提案テーブルに反映）。
