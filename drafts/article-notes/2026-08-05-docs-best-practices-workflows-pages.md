---
title: "[code.claude.com] 概要 — 公式「ベストプラクティス」ページと「動的ワークフロー」ページの存在"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-08-05"
domain: "code.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code 概要ページの「次のステップ」から、`/docs/ja/best-practices`（Anthropic 内部チームで実証されたパターン集）と `/docs/ja/workflows`（動的ワークフローでサブエージェントを大規模にオーケストレーションする方法）へのリンクが張られている。いずれも `/claude-docs-review` の巡回対象に入っていなかった。ドキュメント索引は `code.claude.com/docs/llms.txt` から取得できる。

## 主なポイント
- `/docs/ja/best-practices` は CLAUDE.md の書き方・検証・コンテキスト管理・失敗パターンを網羅
- `/docs/ja/workflows` は動的ワークフローの使いどころ・制約・他機能との使い分けを整理
- `code.claude.com/docs/llms.txt` に全ページの索引がある
- ドメインは docs.anthropic.com から platform.claude.com / code.claude.com へ移転済み

## NOCTAへの関連メモ
2ページを `/claude-docs-review` の巡回対象に追加済み（同日スキル修正）。この2ページから得た知見だけで、CLAUDE.md 削除基準・Stop hook 検証ゲート・`/effort ultracode`・ワークフローの使い分けという運用に直結する発見が6件出たため、巡回対象の不足が実害として確認できた。今後は `llms.txt` を起点に巡回対象の抜けを定期点検するのが有効。
