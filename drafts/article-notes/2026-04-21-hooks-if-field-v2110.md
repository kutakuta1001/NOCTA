---
title: "CHANGELOG v2.1.110 — Hooksに`if`フィールド追加: 条件付きhook発火"
url: "https://github.com/anthropics/claude-code/releases"
date: "2026-04-21"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.110 で hooks に `if` フィールドが追加された。
`Bash(git *)` のような条件式を記述することで、特定のツール呼び出し時だけhookを発火できる。
これにより「git操作時だけ確認hookを挟む」「Writeツール時だけバリデーションを実行」など
細粒度の自動化が可能になる。

## 主なポイント
- 新フィールド: `if` — ツール呼び出しを条件にhook発火を制御
- 構文例: `"if": "Bash(git *)"` → git コマンド実行時のみ発火
- 構文例: `"if": "Write(*.js)"` → JS ファイル書き込み時のみ発火
- ノイズ削減: 全ツール呼び出しに反応するhookのコスト・遅延を抑制

## NOCTAへの関連メモ
NOCTAの git 安全ルール（force push禁止等）をhookで強制したい場合、
`"if": "Bash(git *)"` でgit操作時のみ確認hookを発火できる。
web-practices-report-2026-04-21.md でも提案済みの重要機能。
