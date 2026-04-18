---
title: "Claude Haiku 3 廃止予定: 2026-04-19"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-04-18"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Haiku 3（`claude-3-haiku-20240307`）が 2026-04-19 に廃止予定。NOCTA は Haiku 4.5 を使用しているため直接影響はない。また、Claude Sonnet 4・Opus 4（`-20250514` 版）も 2026-06-15 に廃止予定。

## 主なポイント
- 廃止モデル: `claude-3-haiku-20240307`（Haiku 3）→ 廃止日: 2026-04-19
- 代替: `claude-haiku-4-5-20251001`（Haiku 4.5）
- Claude Sonnet 4・Opus 4（-20250514 版）は 2026-06-15 廃止予定
- NOCTA の R-09 は Haiku 4.5 を使用 → 影響なし

## NOCTAへの関連メモ
NOCTA は既に Haiku 4.5 を使用しているため直接影響なし。MCP 設定ファイルや古いスクリプトに `claude-3-haiku` が残っていないか念のため確認を推奨。6月の Sonnet 4 / Opus 4 廃止もNOCTAには影響なし（R-09 は 4.6/4.7 系使用）。
