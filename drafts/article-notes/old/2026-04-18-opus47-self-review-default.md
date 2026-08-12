---
title: "@bridgemindai: Opus 4.7 の自己出力検証（self-review）がデフォルト動作に・CursorBench 大幅改善"
url: "https://x.com/bridgemindai/status/2044138859353563198"
date: "2026-04-18"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Opus 4.7 では自己出力検証（self-review）がデフォルト動作になり、ハルシネーション改善が確認された。BridgeBench の Hallucination ベンチマーク改善・CursorBench が 58→70 に向上。Anthropicがモデルを増強したことで精度が大幅に向上した。

## 主なポイント
- self-review（自己出力検証）がデフォルト動作
- BridgeBench Hallucination ベンチマーク改善
- CursorBench: 58 → 70 に向上
- ハルシネーション低減 → 批評タスクの信頼性向上

## NOCTAへの関連メモ
R-09 の「Opus 4.7（批評者 / Critic）」採用の信頼性をさらに高める情報。self-review がデフォルトになったことで、lyric-critic・concept-critic エージェントがより精度の高いフィードバックを提供できる。コンセプトレビューや歌詞批評での誤った指摘が減ることが期待できる。
