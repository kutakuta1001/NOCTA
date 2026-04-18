---
title: "Bash deny ルール強化: env/sudo/watch などの exec ラッパーもブロック可能"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-04-18"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.113 で Bash deny ルールが強化された。`env`・`sudo`・`watch`・`xargs` などの exec ラッパー経由でも、Deny リストで指定したコマンドがブロックされるようになった。従来は `env git push --force` や `sudo rm -rf` などラッパー経由での迂回が可能だった脆弱性が解消された。

## 主なポイント
- `env`, `sudo`, `watch`, `xargs`, `sh -c` などのラッパー経由コマンドも deny ルールでブロック
- 既存の Deny リスト設定が自動的により強固になる（追加設定不要）
- `-exec` / `-delete` フラグを使った `find` コマンドも対象
- v2.1.113 で修正

## NOCTAへの関連メモ
CLAUDE.md セキュリティ設定の Deny リスト（`git push --force` / `rm -rf` 等）の効果が exec ラッパー経由でも保証されるようになった。既存の設定のままで自動的に効果が向上するため、追加の対応は不要。
