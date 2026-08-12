---
title: "claude-3-haiku-20240307 廃止（2026-04-19）"
url: "https://docs.anthropic.com/ja/docs/about-claude/models"
date: "2026-04-21"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Anthropic の claude-3-haiku-20240307 が 2026-04-19 に廃止された。
NOCTAのR-09では既にHaiku 4.5（claude-haiku-4-5-20251001）に移行済みのため、直接の影響はない。
ただし古いスキル・エージェント定義・settings.json 内にハードコードされたモデルIDが残っていないか確認が必要。

## 主なポイント
- `claude-3-haiku-20240307` は 2026-04-19 をもってサポート終了
- 後継は `claude-haiku-4-5-20251001`（Haiku 4.5）
- NOCTAのCLAUDE.md R-09 は既にHaiku 4.5指定済み

## NOCTAへの関連メモ
CLAUDE.mdのR-09は対応済み。~/.claude/agents/ 配下のエージェント定義ファイルに旧IDが残っていないかスキャンを推奨。
