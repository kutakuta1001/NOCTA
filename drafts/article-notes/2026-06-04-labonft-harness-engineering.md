---
title: "@LaboNft: エージェント性能差はモデルではなくハーネス設計による"
url: "https://x.com/LaboNft/status/2061503301133410701"
date: "2026-06-04"
domain: "x.com"
tags: [best-practices, claude-code, source:xmcp]
---

## 要約

英語圏では「AIエージェントの性能差は新モデルのせいではなく、ハーネス（実行環境）やルーティング設計が成果を左右する」という論点が広がっている。Claude Code の Hooks・MCPサーバー・スキル設計が代表例として挙げられている。

## 主なポイント

- 新しいモデルに乗り換えるより、hooks・MCP・スキルの設計を最適化する方が性能向上に直結する
- ハーネス = 実行環境設計（hooks の実行タイミング・MCP のツール選択・スキルの文脈付け）
- 「モデルが悪い」と感じたら、まずハーネス設計を見直す

## NOCTAへの関連メモ

NOCTA の CLAUDE.md は hooks・スキル・MCP 管理の設計が充実しており、この知見を体現している。新モデルへの移行よりも /weekly-check・/best-practices-review による継続的なハーネス最適化を優先するという現在の方針を正当化する。
