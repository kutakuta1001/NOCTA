---
title: "Claude Code 初期設定でやるべき順序"
url: "https://x.com/sho_ai_real/status/2045831363518169241"
date: "2026-04-26"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Codeの初期セットアップを効率よく行うための推奨順序をまとめたツイート。CLAUDE.md → settings.json → hooks → MCP → subagentsの順でセットアップすることで効率が上がるという実体験に基づく知見。

## 主なポイント
- 【必ずやる】優先順位: CLAUDE.md作成 → settings.jsonのpermissions定義 → hooksの実装
- 【余力があれば】: MCPサーバー追加 → subagents整理
- この順序の意図: CLAUDE.mdが全体方針を決め、permissionsがリスクを防ぎ、hooksが自動化を担う—基礎から積む
- MCPとsubagentsは後からでも追加可能な拡張要素であり、基盤が整ってから

## NOCTAへの関連メモ
NOCTAはすでにCLAUDE.md → settings.json（Denyリスト） → hooks → xmcp MCPの順で運用中で、推奨順序と一致している。新しいMacへのClaude Code導入時（現在進行中）に参考になる。
