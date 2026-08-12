---
title: "CHANGELOG v2.1.116 — MCP起動高速化: resources/templates/list を@メンション時まで遅延ロード"
url: "https://github.com/anthropics/claude-code/releases"
date: "2026-04-21"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.116 で MCP サーバーの起動高速化が実装された。
`resources/templates/list` の実行を @メンション時まで遅延させることで、
起動時のオーバーヘッドを削減。MCPサーバーが多いほど恩恵が大きい。

## 主なポイント
- `resources/templates/list` は必要になるまで実行されない（遅延ロード）
- セッション開始が高速化（特にMCPサーバー複数運用環境）
- Claude Code v2.1.116 以降に自動適用（設定変更不要）
- xmcp（port 8000）を含む複数MCP運用環境で効果あり

## NOCTAへの関連メモ
NOCTAではxmcp + web_search + filesystem の複数MCPを運用中。
v2.1.116以降にアップデートすれば自動で起動高速化の恩恵を受けられる。
現在のClaude Codeバージョン確認: `claude --version` で確認可。
