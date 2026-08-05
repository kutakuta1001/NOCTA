---
title: "[changelog v2.1.221] claude-api スキルに prompt-audit サブコマンドを追加"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-05"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.221 で、バンドルされている `claude-api` スキルに `prompt-audit` サブコマンドが追加された。プロンプトやツール記述を走査し、旧世代モデル向けに書かれたパターン（現行モデルでは不要または有害な書き方）を検出する。

## 主なポイント
- 対象はプロンプト本文とツール（ツール定義）の description
- 「古いモデル向けに書かれたパターン」を機械的に洗い出せる
- claude-api スキル自体は v2.1.219 で既定モデルが Opus 5 に更新済み

## NOCTAへの関連メモ
NOCTA は60本超の自作スキルと11のエージェント定義を抱えており、その多くは Sonnet 4.6 / Opus 4.8 世代に書かれている。拡張思考（budget_tokens）前提の記述や temperature 指定など、Opus 5 / Sonnet 5 では非対応・不要になった書き方が残っている可能性が高い。CLAUDE.md スリム化と並行して、スキル群への prompt-audit 適用が有効。
