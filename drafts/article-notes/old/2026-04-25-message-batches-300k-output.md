---
title: "モデル一覧 — Message Batches APIでOpus 4.7/Sonnet 4.6が300k出力対応"
url: "https://docs.anthropic.com/ja/docs/about-claude/models"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
Message Batches APIを使うと、Opus 4.7 / Sonnet 4.6 で最大300kトークンの出力が可能になった。
有効化には `output-300k-2026-03-24` betaヘッダーが必要。通常のAPIリクエストでは64k（Sonnet）/ 128k（Opus）が上限。

## 主なポイント
- Message Batches API + betaヘッダー `output-300k-2026-03-24` で最大300k出力
- 通常上限: Sonnet 4.6 = 64k tokens、Opus 4.7 = 128k tokens
- Batches APIは非同期・低コスト（50%割引）だが結果取得まで時間がかかる

## NOCTAへの関連メモ
インスピレーション: 大型SVP生成（100パラグラフ超）やSNSカレンダー一括生成（1ヶ月分）をBatches APIで実行すると50%コスト削減 + 300k出力の恩恵を受けられる可能性。現状のAgent Teamsワークフローに組み込むほどではないが、将来の大規模コンテンツ生成オプションとして覚えておく価値あり。
