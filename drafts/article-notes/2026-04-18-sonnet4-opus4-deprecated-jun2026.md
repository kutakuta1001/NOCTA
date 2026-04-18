---
title: "Claude Sonnet 4・Opus 4（-20250514版）廃止予定: 2026-06-15"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-04-18"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Sonnet 4（`claude-sonnet-4-20250514`）と Opus 4（`claude-opus-4-20250514`）が 2026-06-15 に廃止予定。後継は Sonnet 4.6（`claude-sonnet-4-6`）および Opus 4.7（`claude-opus-4-7`）。NOCTA はすでに 4.6/4.7 系を使用中のため直接影響なし。

## 主なポイント
- 廃止モデル: `claude-sonnet-4-20250514` / `claude-opus-4-20250514`（-20250514 サフィックス版）
- 廃止日: 2026-06-15
- 代替: `claude-sonnet-4-6` / `claude-opus-4-7`
- 既存の MCP 設定・スクリプトに `-20250514` が残っていないか確認推奨

## NOCTAへの関連メモ
NOCTA の R-09 は Sonnet 4.6 / Opus 4.7 を明示しており影響なし。念のため `.mcp.json` や過去スクリプトに `claude-sonnet-4-20250514` / `claude-opus-4-20250514` が残っていないか確認する。
