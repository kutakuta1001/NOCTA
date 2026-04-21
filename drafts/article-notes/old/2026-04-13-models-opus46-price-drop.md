---
title: "Claude Opus 4.6 価格が $5/$25/MTok に低下（旧Opus比 約1/3）"
url: "https://docs.anthropic.com/ja/docs/about-claude/models"
date: "2026-04-13"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Opus 4.6 の価格が入力 $5/MTok・出力 $25/MTok に設定された。
旧 Opus 4.0 / 4.1 は入力 $15/MTok・出力 $75/MTok だったため、約1/3 のコストに低下。
現行の Claude Sonnet 4.5（$3/$15/MTok）と比較すると約1.7倍程度の差に収まっており、
品質重視の場面では Opus を積極活用しやすい価格水準になった。

## 主なポイント
- Opus 4.6: 入力 $5/MTok・出力 $25/MTok（旧 Opus 4.0/4.1 の1/3）
- Sonnet 4.5: 入力 $3/MTok・出力 $15/MTok（Opus 4.6 の約0.6倍）
- Haiku 4.5: 入力 $1/MTok・出力 $5/MTok（最安）
- Opus 4.5（レガシー）も同様に $5/$25 で利用可能

## NOCTAへの関連メモ
R-09「Opus は品質重要な場面に限定」の前提だったコスト差（旧比5倍）が大幅に縮小。svp-generator・複雑なコード生成での Opus 利用をより積極的に検討できる。R-09 の補足更新を推奨。
