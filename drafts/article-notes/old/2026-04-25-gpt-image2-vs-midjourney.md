---
title: "GPT Image 2 vs Midjourney — NOCTAはGPT Image 2に移行"
url: "https://openai.com/blog/gpt-image-2"
date: "2026-04-25"
domain: "openai.com"
tags: [best-practices, openai, source:manual]
---

## 要約（3〜5行）
GPT Image 2とMidjourney v8の比較。テキスト精度・API・多言語はGPT Image 2優位、純アート性・構図美はMidjourney v8優位。
NOCTAのユースケース（日本語テキスト入り・SNSグラフィック・楽曲アートワーク）ではGPT Image 2が適切。

## 主なポイント
- GPT Image 2優位: テキスト精度（CJK 99%）・多言語・API将来対応・ChatGPT Plus固定費
- Midjourney v8優位: 純粋な構図美・芸術的なファインアート質感・--style raw等の制御
- NOCTAの選択: コスト最小化（Plus固定費$20）＋日本語テキスト正確描画のためGPT Image 2

## NOCTAへの関連メモ
実装済み: 2026-04-25の前セッションで全ワークフローをGPT Image 2に移行済み。/visual-prompt・DESIGN.md・NOCTA/CLAUDE.mdのスラッシュコマンド表を更新済み。将来的に純アート性を重視したい場合はMidjourney v8を選択肢として残しておく。
