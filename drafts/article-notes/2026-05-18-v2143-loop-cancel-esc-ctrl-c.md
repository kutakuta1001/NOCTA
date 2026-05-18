---
title: "v2.1.143: /loop の pending wakeup を Esc/Ctrl+C でキャンセル可能"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-05-18"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約
Claude Code v2.1.143 で `/loop` コマンドで設定した pending wakeup を Esc または Ctrl+C でキャンセルできるようになった。これにより、定期実行中のループを即座に停止できる。同バージョンで worktree.bgIsolation: "none" 設定も追加され、背景セッションが作業ファイルを直接編集できるようになった。

## 主なポイント
- /loop の pending wakeup を Esc または Ctrl+C でキャンセル可能（v2.1.143）
- worktree.bgIsolation: "none" で背景セッションが作業コピーを直接編集可能に（同バージョン）
- 背景セッションのアイドル後のモデル・努力レベル設定が保持されるように（v2.1.143）

## NOCTAへの関連メモ
/weekly-check や /loop スキルを使う際の中断操作が明確になった。長時間ループを途中停止する際は Esc または Ctrl+C を使う。CLAUDE.md のセッション運用セクションに追記候補。
