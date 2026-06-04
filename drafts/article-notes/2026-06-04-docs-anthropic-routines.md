---
title: "Claude Code 概要: Routines（/schedule）"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-06-04"
domain: "code.claude.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

Anthropicマネージドインフラで動作する定期タスク実行機能「Routines」が正式公開。`/schedule` コマンドで設定し、ローカルマシンがOFF状態でも継続実行できる。APIトリガーやGitHubイベントでの起動にも対応。

## 主なポイント

- CLI/デスクトップ/Web で `/schedule` を実行して作成
- Anthropic がホスティングするインフラ上で動作（マシン電源オフでも継続）
- APIコール・GitHub イベントをトリガーにできる
- デスクトップスケジュール済みタスク（ローカル実行）とは別機能

## NOCTAへの関連メモ

/weekly-check の定期実行（月曜）や /phase1-trend の週次トレンド収集を Routines に移行できる可能性がある。ただし Claude Pro サブスクリプションが必要かは要確認。NOCTAの CLAUDE.md「セッション運用」テーブルに「定期タスク | /schedule → Routines」として追記候補。
