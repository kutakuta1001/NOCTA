---
title: "Claude Code概要 — /desktopでCLIセッションをデスクトップアプリへ転送"
url: "https://docs.anthropic.com/ja/docs/claude-code/overview"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
`/desktop` コマンドで、CLIターミナルで進行中のセッションをデスクトップアプリに転送して継続できる。
`/teleport`（Web/iOS→CLI）の逆方向の操作。視覚的差分確認ができるデスクトップ環境に切り替えたいときに使う。

## 主なポイント
- `/desktop`: CLI → デスクトップアプリへのセッション転送
- `/teleport`: Web/iOS → CLI（前回追記済み）
- デスクトップアプリで視覚的な差分確認（website/ HTMLの変更確認など）が可能

## NOCTAへの関連メモ
website/の変更（blog-data.js・visual-data.js更新後）をブラウザプレビューで確認しながらClaude Codeと対話するワークフローで活用できる。CLIで変更→/desktopでアプリに転送→Canvasで視覚確認、という流れが想定される。セッション運用テーブルへの追記候補（/teleportとセットで）。
