---
title: "Claude Code v2.1.118 — hooks に type:mcp_tool 追加"
url: "[docs.anthropic.com] リリースノート v2.1.118"
date: "2026-04-27"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.118 で hooks の type フィールドに `"mcp_tool"` が追加された。
settings.json の hooks セクションから MCP ツールを直接呼び出せるようになり、Pre-tool / Post-tool イベントに外部ツールを組み合わせた自動化が可能に。
従来の hooks はシェルスクリプト実行のみだったが、MCP ツール呼び出しも同列で扱えるようになった。

## 主なポイント
- `settings.json` の hooks 設定で `type: "mcp_tool"` を指定すると MCP ツールを直接呼び出せる
- Pre-tool / Post-tool イベントとの組み合わせで「ファイル編集後に自動バックアップ」「ツール使用前に通知」等が設計可能
- DenyリストのHooksと同一の設定ファイル内で管理できる

## NOCTAへの関連メモ
SVP生成完了後・blog-data.js更新後などのイベントでMCPツールを自動トリガーする自動化の設計が可能になった。現在のDenyリストhooksと組み合わせてNOCTAの自動化を強化できる。
