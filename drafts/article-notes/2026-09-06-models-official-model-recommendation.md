---
title: "モデル概要 — 公式推奨は「まず Opus 5、高度な推論は Fable 5.1」"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-09-06"
domain: "platform.claude.com"
tags: [best-practices, claude-code, models, source:manual]
---

## 要約（3〜5行）
公式の選択指針は「ほとんどのワークロードは Claude Opus 5 から始める。
高度な推論や長期的なエージェント作業が必要な場合、または高い effort 設定での Opus 5 の評価結果が
まだ不十分な場合は Claude Fable 5.1 を使う」と明記されている。
Fable 5 / Opus 4.8 / Opus 4.7 / Opus 4.6 / Opus 4.5 / Sonnet 4.6 / Sonnet 4.5 は Legacy（利用は継続可能）。

## 主なポイント
- 現行ラインナップは Fable 5.1 / Opus 5 / Sonnet 5 / Haiku 4.5 の4モデル
- モデルの位置づけ: Fable 5.1「要求の厳しい推論と長期エージェント作業」、Opus 5「複雑なエージェンティックコーディングと企業業務」、Sonnet 5「速度と知性の最良の組み合わせ」、Haiku 4.5「フロンティア近傍の知性を持つ最速モデル」
- モデルIDはすべてピン留めされたスナップショット（4.6 世代以降の日付なしIDを含む）
- Extended thinking は Opus 4.6 / Sonnet 4.6 で非推奨、それ以降のモデルでは受け付けられない

## NOCTAへの関連メモ
NOCTA の R-09 は「起案=Sonnet 5 / 批評=Opus 5 / 超重要=Fable 5」の3段構成で、公式指針とおおむね整合している。
公式が「Opus 5 の評価が不十分な場合に Fable」と条件付けしているのは、
NOCTA の「判断が割れる超重要案件は Fable にエスカレーション」という運用とほぼ同じ考え方。
