---
title: "Claude Codeリリースノート — hooks/MCPで${user_config.*}のシェル形式コマンドを拒否（v2.1.207）"
url: "https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md"
date: "2026-07-12"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Codeのv2.1.207で、hooks/monitors/MCPのheadersHelperにおいて、`${user_config.*}`をシェル形式コマンドとして展開する記述が拒否されるようになった。シェルインジェクション対策の強化。同バージョンでBedrock/Vertex/FoundryのデフォルトモデルもClaude Opus 4.8に変更されている。

## 主なポイント
- hooks/MCP設定内の`${user_config.*}`をシェルコマンドとして実行させる記述がブロックされる
- プラグインオプション値が`.claude/settings.json`から読み込めなくなった（同バージョン）
- Bedrock/Vertex/FoundryのデフォルトモデルがClaude Opus 4.8に変更（NOCTAはClaude API直接利用のため直接影響なし）

## NOCTAへの関連メモ
NOCTAはhooks（例: `commit-guard.sh`）とMCP（xmcp等）を活用しており、この種のセキュリティ強化は直接的な設定変更を必要としない防御的な改善。既存のhooks/MCP設定に`${user_config.*}`をシェルコマンド展開する記述がないか一応確認しておくと安全（現状の`commit-guard.sh`はシェルスクリプト本体であり、この制限の対象外と推測される）。
