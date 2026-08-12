---
title: "CHANGELOG v2.1.118 — HooksからMCPツール直接呼び出し（type: mcp_tool）"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.118で、Hooksの定義に `type: "mcp_tool"` 形式が追加され、HookからMCPツールを直接呼び出せるようになった。
これにより、特定のイベント（ファイル保存・コミット前など）をトリガーにMCPサーバーのツールを自動実行するパイプラインが構築可能になった。

## 主なポイント
- Hooksに `type: "mcp_tool"` 形式を追加してMCPツールを直接呼び出せる
- 従来のBashシェルコマンド形式と並列して使用可能
- xmcpなどのMCPサーバーとhookを直接連携できる

## NOCTAへの関連メモ
将来的にxmcpをHookと連携させて「フェーズ1開始時に自動でトレンドツイートを収集」するパイプラインが構築できる可能性がある。現状は `/x-practices-search` を手動実行しているが、PostToolUse hookでxmcpのsearchPostsRecentを呼び出す設計が可能になった。
