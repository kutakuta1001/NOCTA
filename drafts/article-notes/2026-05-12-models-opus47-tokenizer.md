---
title: "モデル一覧 — Opus 4.7は新トークナイザーで実質コンテキストが少ない"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-05-12"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Anthropic公式ドキュメントによると、Opus 4.7は新しいトークナイザーを使用しており、
1M tokensが約555k words（約250万Unicode文字）に相当する。
Sonnet 4.6の1M tokens≒750k words（約340万文字）と比べて実質的なコンテキスト容量が少ない点に注意が必要。

## 主なポイント
- Opus 4.7: 1M tokens ≈ 555k words（新トークナイザー）
- Sonnet 4.6: 1M tokens ≈ 750k words（旧トークナイザー）
- Haiku 4.5: 200k tokens ≈ 150k words
- 価格はOpus 4.7 $5/$25/MTok・Sonnet 4.6 $3/$15/MTok で変わらず
- Batch APIでOpus 4.7・Sonnet 4.6とも最大300k tokens出力可能（betaヘッダー使用時）

## NOCTAへの関連メモ
R-09でOpus 4.7をSVP生成・重要レビューに使う際、Sonnet 4.6より先にコンテキスト圧縮が発生しうる。大型SVP（500ノート超）生成時はSonnetが有利な場合がある。R-09に「Opus 4.7の実質コンテキスト≒555k words」の注記を追加検討。
