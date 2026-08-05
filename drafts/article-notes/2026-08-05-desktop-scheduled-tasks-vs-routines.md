---
title: "[code.claude.com] 概要 — デスクトップスケジュール済みタスク（ローカル実行）と Routines（Anthropic インフラ）の使い分け"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-08-05"
domain: "code.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
定期実行の手段が3種類に整理されている。Routines は Anthropic 管理インフラで動くためマシンがオフでも継続し、API 呼び出しや GitHub イベントでもトリガーできる（`/schedule` で作成）。デスクトップスケジュール済みタスクは自分のマシン上で動き、ローカルファイルとツールに直接アクセスできる。`/loop` は CLI セッション内でプロンプトを繰り返す短時間ポーリング用。

## 主なポイント
- Routines: Anthropic インフラ・マシンオフでも継続・API / GitHub イベントでトリガー可
- デスクトップスケジュール済みタスク: ローカル実行・ローカルファイルとツールに直接アクセス可
- `/loop`: セッション内の繰り返し（クイックポーリング）
- 3者は排他ではなく用途で選ぶ

## NOCTAへの関連メモ
CLAUDE.md のセッション運用表は Routines（`/schedule`）と `/loop` のみを記載しており、デスクトップスケジュール済みタスクが抜けている。NOCTA の定期タスク候補には「ローカルファイルを見る必要があるもの」（website/*-data.js の構文チェック、outputs/ の棚卸し、未コミット変更の検出）と「外部情報を取るだけのもの」（/weekly-check のトレンド収集）が混在しており、前者はローカル実行、後者は Routines が適する。現在205件の未コミット変更が放置されている状況は、前者の定期チェックがあれば早期に気づけた。
