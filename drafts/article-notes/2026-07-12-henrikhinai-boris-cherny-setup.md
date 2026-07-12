---
title: "@henrikhinai のツイート — Boris CobrayのClaude Code最小構成（1 hook・2 subagent・2 MCP・10並列）"
url: "https://x.com/henrikhinai/status/2074438724515926436"
date: "2026-07-12"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Code開発者本人（Boris Cherny）が、実際には機能をほぼ素の状態（stock）で運用しているという分析記事の紹介ツイート。構成は1 hook・2 subagent・2 MCPサーバーのみで、10以上のセッションを並列実行しているという内容。

## 主なポイント
- 大量のカスタマイズより、少数の要素の組み合わせと並列実行数を重視する運用スタイル
- 1 hook・2 subagents・2 MCP servers というミニマル構成
- 10以上の並列セッションで生産性を確保

## NOCTAへの関連メモ
NOCTAはMCP総数80以下・hooks/skills段階的開示を既に方針化しているが、本記事は「機能を増やすこと」自体は目的ではなく「並列実行数」がレバレッジになるという視点を補強する。song-switch/song-listによる並列ブランチ運用の方向性と一致しており、追加のMCP導入より並列運用の最適化を優先する根拠として参考になる。
