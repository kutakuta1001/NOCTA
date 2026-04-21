---
title: "Channels機能: Telegram/Discord/webhookからClaude Codeにイベントをプッシュ"
url: "https://docs.anthropic.com/ja/docs/claude-code/overview"
date: "2026-04-21"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code の Channels 機能により、Telegram/Discord/webhook から
Claude Code セッションに外部イベントをプッシュできるようになった。
たとえばTelegramで「歌詞レビューして」と送ると Claude Code が応答するような
モバイル連携・リモートコントロールが実現する。

## 主なポイント
- 対応チャンネル: Telegram, Discord, webhook（HTTP POST）
- イベントをClaude Codeセッションにプッシュ（双方向）
- モバイル・外出先からのClaude Code操作が可能
- handoff.mdとの組み合わせでリモート引き継ぎが実現可能

## NOCTAへの関連メモ
Telegramから「/music-status」コマンドをトリガーしてスマホでプロジェクト状況を確認する用途が有望。
セキュリティ考慮（認証設定）が必要なため、試用前に公式ドキュメントのセキュリティ節を確認する。
