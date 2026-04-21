---
title: "CHANGELOG v2.1.113 — PreToolUse/PostToolUse hooksのfile_pathが絶対パス形式に変更"
url: "https://github.com/anthropics/claude-code/releases"
date: "2026-04-21"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.113 で PreToolUse・PostToolUse フックに渡される `file_path` が
相対パスから絶対パスに変更された。
これにより既存のhookスクリプトが相対パスを前提に書かれていた場合、
v2.1.113以降では動作しなくなる可能性がある破壊的変更。

## 主なポイント
- 変更内容: `file_path` フィールドが相対パス → 絶対パス
- 影響: PreToolUse / PostToolUse フック
- 既存hookが相対パスで条件分岐していた場合は修正が必要
- v2.1.113以降を使っている場合は即時確認が必要

## NOCTAへの関連メモ
NOCTAの hooks 設定（~/.claude/settings.json）を確認し、
file_path を参照するhookがあれば絶対パス対応に修正する。
現在hooks設定が最小構成であれば影響は低いが、確認は必須。
