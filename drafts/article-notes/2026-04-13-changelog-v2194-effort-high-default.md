---
title: "v2.1.94: 有料ユーザーのデフォルト努力レベルが high に変更"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-04-13"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.94 より、API キー・Bedrock・Vertex・Team・Enterprise ユーザーの
デフォルト努力レベル（effort level）が "high" に変更された。
以前は medium または auto だったため、自動的により多くのトークンを消費する設定になった。
`/effort medium` または `/effort low` コマンドで明示的に下げることができる。

## 主なポイント
- 変更: デフォルト effort が "high"（より多くのトークン消費）
- 対象: API キー・Bedrock・Vertex・Team・Enterprise ユーザー
- コスト管理: `/effort medium` や `/effort low` でトークン消費を削減可能
- 対象バージョン: v2.1.94 以降

## NOCTAへの関連メモ
NOCTA は Claude Code を API キーまたは有料プランで利用しているため影響あり。コスト削減したい単純なタスク（handoff.md 更新・短いファイル生成）では `/effort low` や `/effort medium` の活用を検討できる。COST POLICY の補足として追記価値あり。
