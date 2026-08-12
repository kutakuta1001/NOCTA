---
title: "[changelog v2.1.224] crossSessionInbound と dialogExpiry 新設（bypassPermissions 宛は承認保留）"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-12"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.224 でクロスセッション `SendMessage` が追加され、同一ユーザーのマシン間でセッション同士がメッセージを送れるようになった（macOS / Linux・`ListAgents` で発見）。あわせて `crossSessionInbound` と `dialogExpiry` の2設定が新設され、**権限をバイパスして動作しているセッション宛のメッセージは自動配送されず承認保留になる**。他のセッション宛は自動配送される。

## 主なポイント
- クロスセッション `SendMessage` と `ListAgents` が追加（macOS / Linux）
- `crossSessionInbound`: bypassPermissions で動くセッション宛のメッセージは承認保留
- `dialogExpiry`: 保留メッセージの期限設定
- v2.1.225 では headless セッションと起動時に保留メッセージが通知も期限もなく放置される問題を修正
- v2.1.228 でインストール・アップグレード直後の初回セッションで受信箱が作られない問題を修正

## NOCTAへの関連メモ
NOCTA は `defaultMode: bypassPermissions` で運用しているため、この設定は直接該当する。今回の CLAUDE.md スリム化作業ではサブエージェント間のメッセージが多数往復したが、それはセッション内のサブエージェント通信であり、この設定が対象とするマシン間・セッション間通信とは別経路。重要なのは、クロスセッションメッセージが「他セッションの権限プロンプトを承認できない」「CLAUDE.md や設定の編集を依頼できない」という制約を持つ点で、これは権限のロンダリング（別セッション経由で禁止操作を通す）を構造的に防ぐ設計になっている。
