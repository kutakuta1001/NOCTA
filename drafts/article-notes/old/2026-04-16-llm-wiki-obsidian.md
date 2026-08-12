---
title: "Claude + Obsidian LLM Wiki: Andrej Karpathyパターンの永続知識ベース"
url: "https://x.com/i/status/2042241063612502162"
date: "2026-04-16"
domain: "x.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Andrej Karpathyが提案するLLM Wikiパターン: RAGと違いLLMが永続的なWikiを「コンパイル」して維持し続けるアーキテクチャ。新ソース追加時にLLMがWikiを更新・相互参照・矛盾検出を行い、知識が蓄積する。Obsidian（IDEとして）+ Claude Code（プログラマーとして）+ Wikiフォルダ（コードベースとして）の3層構成。Claude CodeをObsidianのVaultにポイントするだけで動作。

## 主なポイント
- RAGとの違い: RAGは毎回ゼロから再発見。LLM Wikiは知識が「コンパイル済み」で蓄積・更新
- 3層構成: raw sources（不変）/ wiki（LLMが書き維持）/ schema（CLAUDE.md相当の設定）
- 操作: Ingest（ソース追加→wiki更新）/ Query（wiksiから回答→新ページとして保存）/ Lint（定期健全性チェック）
- index.md（コンテンツカタログ）+ log.md（時系列ログ）の2特殊ファイルで大規模化に対応
- qmd（github.com/tobi/qmd）: wiki検索エンジン（BM25+ベクター+LLMリランク・MCPサーバー対応）
- Obsidian Web Clipperで記事をMarkdown化、グラフビューで知識の形状を可視化

## NOCTAへの関連メモ
NOCTAのドキュメント管理（drafts/article-notes/）をこのLLM Wikiパターンに拡張できる可能性がある。楽曲制作ナレッジ・ベストプラクティスが蓄積するほど賢くなる「NOCTAナレッジウィキ」の構想に直結。Obsidianは既にarticle-notesのビューワーとして活用予定のため、相性が高い。
