---
title: "Overview（code.claude.com）"
url: "https://code.claude.com/docs/en/overview"
date: "2026-10-24"
domain: "code.claude.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
routines が Cloud scheduled tasks に改名。クラウド実行（PC が切れても動く・API / GitHub イベントでも起動）、ローカル実行の Desktop scheduled tasks、セッション内の `/loop` の3本立てに整理された。

## 主なポイント
- Cloud scheduled tasks は `/schedule` から作れる（旧 routines）
- Desktop scheduled tasks はローカルのファイル・ツールに直接触れる
- Channels で Telegram / Discord / iMessage / Webhook のイベントをセッションへ送れる

## NOCTAへの関連メモ
週次・月次の点検（/weekly-check・/version-audit）を定期実行に載せる選択肢。ただし R-03（SNS 自動投稿禁止）と push 禁止の範囲を守る必要がある。
