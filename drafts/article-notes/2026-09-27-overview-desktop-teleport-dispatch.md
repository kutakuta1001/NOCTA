---
title: "Claude Code 概要 — /desktop・claude --teleport・Dispatch でサーフェス間を移動"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-09-27"
domain: "code.claude.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
概要ページの「どこからでも作業する」節が整理され、セッションをサーフェス間で移動する手段が並んだ。
`/desktop` は現在のターミナルセッションをデスクトップアプリに引き継いで差分を視覚確認する（claude.ai サブスク・macOS と x64 Windows）。
`claude --teleport` は Web / モバイルで始めた長時間タスクをターミナルへ引き込む。Dispatch は電話からメッセージを送ってデスクトップセッションを作る。

## 主なポイント
- Remote Control でデスクから離れて電話や任意のブラウザから続行（既収集）
- Channels で Telegram / Discord / iMessage / webhook からセッションにイベントをプッシュ（既収集）
- Slack で `@Claude` にメンションしてバグレポートから PR を得る
- Claude Academy の無料コース Claude Code 101 / Claude Code in Action がリンクされた

## NOCTAへの関連メモ
CEO は Studio One を操作しながら Claude Code を使う。DAW 作業中は電話から Dispatch で「歌詞B案の音節数を再計算」のような
短い依頼を投げ、あとでデスクトップで確認する運用が考えられる。ただし NOCTA の承認ゲートは対話セッションで判断する前提のため、補助用途に限る。
