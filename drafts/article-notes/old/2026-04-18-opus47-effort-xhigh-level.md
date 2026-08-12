---
title: "Opus 4.7 向け新努力レベル xhigh: /effort コマンドで選択可能（v2.1.111）"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-04-18"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.111 で Opus 4.7 向けの新しい努力レベル `xhigh` が追加された。`/effort xhigh` で指定でき、Opus 4.7 の最大性能を引き出すための設定。既存の `high`（デフォルト）より高いコンテキスト・思考リソースを割り当てる。

## 主なポイント
- 新レベル `xhigh` を `/effort xhigh` で指定可能
- Opus 4.7 専用設計（他モデルでの効果は限定的な可能性）
- 既存: low / medium / high（デフォルト）/ xhigh（新規）
- v2.1.111 で追加

## NOCTAへの関連メモ
R-09 の Opus 4.7（批評者 / Critic）使用時に `/effort xhigh` を付けることで、歌詞批評・コンセプトレビューの品質をさらに高められる。コストは増加するため、承認ゲート直前の最重要レビュー時のみ使用を推奨。R-09 への追記を検討。
