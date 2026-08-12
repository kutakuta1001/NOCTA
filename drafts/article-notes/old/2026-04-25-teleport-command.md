---
title: "Claude Code概要 — /teleportでWebセッションをCLIに引き込む"
url: "https://docs.anthropic.com/ja/docs/claude-code/overview"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
`/teleport` コマンドで、Web（claude.ai）やiOSアプリで開始したクラウドセッションをCLIターミナルに引き込んで継続できる。
外出先でスマートフォンからアイデアをClaude Codeに指示し、帰宅後にターミナルで同じセッションを引き継いでファイル操作・コード生成に移行するワークフローが可能。

## 主なポイント
- Web/iOS → CLI へのセッション転送が `/teleport` 1コマンドで可能
- 逆方向（CLI → Desktop App）は `/desktop` コマンド
- セッション状態・会話履歴がそのまま引き継がれる

## NOCTAへの関連メモ
移動中にスマートフォンで楽曲コンセプトをClaude Codeと相談し、スタジオに戻ったら同じセッションをCLIで引き継いでMIDI・SVP生成まで直接進めるワークフローが可能になる。セッション運用テーブルへの追記候補。
