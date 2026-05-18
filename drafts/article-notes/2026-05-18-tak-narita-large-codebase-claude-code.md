---
title: "@tak_narita: 大規模コードベースでの Claude Code 運用指針（Anthropic 公式記事）"
url: "https://x.com/tak_narita/status/2055403739276829083"
date: "2026-05-18"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約
技術顧問の成田孝氏（いいね13件）が Anthropic 公式記事「How Claude Code works in large codebases」を推薦。CLAUDE.md・hooks・skills・LSP/MCP・サブエージェント等の構成が大規模コードベース運用で有効とまとめている。今週の日本語Xでも複数アカウントが同記事を引用しており、Anthropic 公式が大規模コードベース向けベストプラクティスを公式化したことが広く注目されている。

## 主なポイント
- Anthropic 公式が「大規模コードベース向け Claude Code ベストプラクティス」を公開
- ハーネス5層構成: CLAUDE.md → hooks → skills → plugins → MCP の順で積む
- ルートの CLAUDE.md は薄く保ち、サブディレクトリにローカル規約を置く

## NOCTAへの関連メモ
NOCTAのCLAUDE.md設計はすでにこの5層構成に対応済み。「ルートCLAUDE.mdを薄く」という方針は website/CLAUDE.md のみ対応済みで、drafts/outputs/ ディレクトリへの拡張が将来的な候補。
