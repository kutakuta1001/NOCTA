---
title: "/ultrareview コマンド追加: クラウド上でマルチエージェントコードレビュー"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-04-18"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.113 で `/ultrareview` コマンドが追加された。クラウド上で複数エージェントが並列に包括的なコードレビューを実行するコマンドで、PR 番号を引数に渡すことができる。既存の通常レビューより深い分析が可能。

## 主なポイント
- `/ultrareview [PR#]` で PR 全体をマルチエージェントがクラウドで分析
- ローカルリソースを消費しない（クラウド実行）
- v2.1.113 で追加（2026-04-13 リリース）
- Claude Code Max サブスクライバー向け機能

## NOCTAへの関連メモ
NOCTA の website/ コードを HP 更新前や重要コード変更後に `/ultrareview` でチェックするフローに組み込める。SLASH COMMANDS の HP管理セクションへの追記を検討。
