---
title: "Claude Code 概要 — Channels で外部からセッションにイベントを送る"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-09-06"
domain: "code.claude.com"
tags: [best-practices, claude-code, automation, source:manual]
---

## 要約（3〜5行）
Channels は Telegram / Discord / iMessage / 独自 webhook からセッションにイベントをプッシュする仕組み。
「どこからでも作業する」系の機能群（Remote Control・Dispatch・Web・Teleport・Slack）の一部として整理されている。
Remote Control が「セッションを別デバイスから操作する」ものに対し、
Channels は「外部イベントをセッションに流し込む」方向の連携。

## 主なポイント
- 対応先: Telegram / Discord / iMessage / 独自 webhook
- 用途は「セッションにイベントをプッシュする」（`/docs/ja/channels`）
- 関連: Dispatch にメッセージを送ると電話からタスクを投げてデスクトップセッションを作れる
- Routines（`/schedule`）は Anthropic 管理インフラで動くため PC がオフでも継続する

## NOCTAへの関連メモ
R-03 は SNS への自動投稿を禁じているが、Channels は「外部→Claude」の受信方向であり投稿とは逆。
たとえば楽曲制作中に思いついた歌詞の断片を iMessage から `drafts/` に流し込む使い方が考えられる。
ただし外部からセッションにイベントを流せるということは入力経路が増えるということで、
インジェクションの入口が広がる。導入するなら送信元の制限が前提。現状は未導入。
