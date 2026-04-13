---
title: "Opus 4.6 の最大出力トークンが 128K（Sonnet 4.5 の2倍）"
url: "https://docs.anthropic.com/ja/docs/about-claude/models"
date: "2026-04-13"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Opus 4.6 の最大出力トークン数は 128K で、Sonnet 4.5（64K）や Haiku 4.5（64K）の2倍。
大きなコードファイル・長尺な SVP ファイル・複数セクションにまたがる仕様書を一度に生成する場合に有利。
旧 Opus 4.0 は 32K・Opus 4.1 は 32K だったため、Opus 4.6 は出力上限も大幅向上した。

## 主なポイント
- Opus 4.6: 最大出力 128K トークン
- Sonnet 4.5: 最大出力 64K トークン
- Haiku 4.5: 最大出力 64K トークン
- 旧 Opus 4.0 / 4.1: 32K（現行の1/4）

## NOCTAへの関連メモ
svp-generator（Opus 使用）で大型 SVP ファイルを生成する際に、出力途中で切れるリスクが大幅に低下。R-09 の svp-generator: Opus 指定の根拠がさらに強化された。
