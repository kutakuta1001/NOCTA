---
title: "Claude Code Channels機能 — Telegram/Discord/webhookからセッションにイベントプッシュ"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-04-28"
domain: "code.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code の Channels 機能により、Telegram / Discord / カスタム webhook からセッションにイベントをプッシュできるようになった。
セッションはサーフェスをまたいで継続可能で、モバイルで開始→ターミナルへ転送なども可能。
Slack（`@Claude` メンション）でバグレポートから PR 自動作成も対応。

## 主なポイント
- Channels: Telegram / Discord / webhook → セッションにイベントプッシュ
- Slack 統合: `@Claude` メンション → バグレポートから PR 自動生成
- Remote Control: ローカルセッションを別デバイス・電話から継続
- Dispatch: モバイルからデスクトップセッションへタスクをプッシュ（CLAUDE.md 記載済み）
- GitHub Actions / GitLab CI/CD でのコードレビュー・PR 自動化

## NOCTAへの関連メモ
Slack はチームがいないため直接不要。ただし Telegram または Discord からの webhook で「夜間タスク完了通知」をスマホに飛ばす用途が考えられる。Dispatch は CLAUDE.md に記載済み。Channels の詳細は `/ja/channels` で確認可能。
