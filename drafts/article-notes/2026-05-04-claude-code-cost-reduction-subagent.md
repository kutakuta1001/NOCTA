---
title: "@ceo_biomira のツイート: CLAUDE.md+subagentでClaude Codeコスト削減"
url: "https://x.com/ceo_biomira/status/2048831453698629679"
date: "2026-05-04"
domain: "x.com"
tags: [best-practices, claude-code, source:xmcp]
---

## 要約（3〜5行）
CLAUDE.mdとsubagentを組み合わせてタスクを自動的に3種に振り分け、Claude Codeの課金をトークン約1/4に削減したワークフロー。
「読むだけ+要約→NotebookLM」「refactor/test→Codex CLI」「残りだけ→Claude本体」という分類がポイント。

## 主なポイント
- 読むだけ+要約タスク → NotebookLMへ委譲（Claudeトークン消費ゼロ）
- refactor/test系 → Codex CLI（token約1/4）
- 判断・設計・実装が必要なタスクだけClaude本体に残す
- CLAUDE.md+subagentで自動振り分け可能

## NOCTAへの関連メモ
NOCTA R-09（モデル使い分け・コスト最適化）を「Claude Code自体の使用量削減」に拡張するアイデア。NOCTAでの応用: handoff更新・短いファイル生成はHaikuサブエージェントへ委譲する方向をCLAUDE.mdにすでに記載しているが、「Codex CLIへのtestタスク委譲」はまだ未検討。
