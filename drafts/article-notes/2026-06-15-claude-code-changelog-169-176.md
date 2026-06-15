---
title: "Claude Code CHANGELOG v2.1.169〜176 の要点"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-06-15"
domain: "github.com"
tags: [best-practices, claude-code, changelog, source:manual]
---

## 要約（3〜5行）
Claude Code の直近リリース（v2.1.169〜176）から NOCTA に関連しうる変更を抽出したメモ。デバッグ用 --safe-mode、サブエージェントの多段ネスト、managed なモデル制限、新hook などが追加された。

## 主なポイント
- v2.1.169: `--safe-mode`（CLAUDE.md/hooks/plugins/skills/MCP を全無効化して起動切り分け）・`post-session` hook・`/cd`（prompt cache を壊さずセッション移動）
- v2.1.172: サブエージェントが最大5階層までネスト可能・plugin marketplace に検索機能
- v2.1.175: `enforceAvailableModels`（managed設定で Default モデルを許可リスト制限）
- v2.1.176: セッションタイトルが会話言語で生成・Opus 4.8 非対応組織向け auto モードフォールバック修正

## NOCTAへの関連メモ
`--safe-mode` は CLAUDE.md/hooks が原因の起動不具合を切り分けるトラブルシュート手段として CLAUDE.md セッション運用表に追記候補。サブエージェント5階層ネストは Agent Teams の将来設計に関連。enforceAvailableModels はエンタープライズ寄りで個人運用には不要。
