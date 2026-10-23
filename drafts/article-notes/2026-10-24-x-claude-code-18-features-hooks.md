---
title: "@choopyplug1 のツイート"
url: "https://x.com/choopyplug1/status/2112261147730854276"
date: "2026-10-24"
domain: "x.com"
tags: [best-practices, x, source:xmcp]
---

## 要約（3〜5行）
Claude Code の18機能: 編集ごとにテストを走らせる hook、`rm -rf` や本番操作を止める hook、読み取り専用のレビュー用サブエージェントなど、多くの開発者が設定していないワークフローを紹介するスレッド。

## 主なポイント
- 編集後にテストを自動実行する PostToolUse hook
- 破壊的コマンドを事前に止める PreToolUse hook
- 読み取り専用のレビュアーサブエージェント

## NOCTAへの関連メモ
NOCTA は deny と approved-guard で破壊的操作を既に止めている。編集後の自動検証（website の構文チェック）は未導入。
