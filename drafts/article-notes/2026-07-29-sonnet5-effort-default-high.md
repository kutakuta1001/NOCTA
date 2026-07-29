---
title: "[platform.claude.com] Sonnet 5 の effort デフォルトが API / Claude Code で high に"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-07-29"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Sonnet 5 の effort パラメータのデフォルトが Claude API / Claude Code で high になった（Opus 4.8 は全サーフェスで high、Opus 5 も API / Claude Code で high）。別レベルを使うには明示指定が必要。

## 主なポイント
- Sonnet 5 / Opus 5: API・Claude Code でデフォルト high
- Opus 4.8: claude.ai 含む全サーフェスでデフォルト high
- コスト最適化には /effort low・medium の明示指定が引き続き有効

## NOCTAへの関連メモ
R-09・COST POLICY の「デフォルトは high（有料ユーザー）」記載と整合。単純タスクでの /effort low 運用（実装済み）の価値がむしろ上がった。
