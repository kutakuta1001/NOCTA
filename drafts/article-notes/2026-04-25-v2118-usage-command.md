---
title: "CHANGELOG v2.1.118 — /cost・/stats が /usage に統合"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.118で、セッション中のコスト確認コマンド `/cost` と統計表示コマンド `/stats` が `/usage` に統合された。
`/usage` 1コマンドでセッション費用・トークン使用量をまとめて確認できる。

## 主なポイント
- `/cost`（コスト確認）と `/stats`（統計）が `/usage` に統合（v2.1.118〜）
- 旧コマンドは廃止または非推奨
- CLAUDE.md の「セッション運用」テーブルを `/usage` に更新する必要がある

## NOCTAへの関連メモ
CLAUDE.md（プロジェクト・上位両方）のセッション運用テーブルに `/usage` の記載がない。Webベストプラクティスレビュー（2026-04-25）でも同じ指摘があった。優先度高で更新すべき項目。コスト意識のあるセッション運用（COST POLICY）と組み合わせて使う。
