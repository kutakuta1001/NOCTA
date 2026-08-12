---
title: "claude-opus-4-7 価格確定: $5/$25/MTok (Opus 4.6と同価格)"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-04-18"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Opus 4.7（`claude-opus-4-7`）の公式価格が確定した。入力 $5/MTok・出力 $25/MTok で、Opus 4.6 と完全同価格。コンテキストウィンドウは 1M tokens（新トークナイザー使用で約 555k words）、最大出力 128k tokens。知識カットオフは 2026年1月と Sonnet 4.6（2025年8月）より新しい。

## 主なポイント
- 価格: $5 input / $25 output per MTok（Opus 4.6 と完全同価格）
- コンテキスト: 1M tokens（新トークナイザー、約 555k words）
- 最大出力: 128k tokens（Sonnet 4.6 の 64k の2倍）
- 適応的思考（Adaptive Thinking）あり・拡張思考（Extended Thinking）**なし**
- 知識カットオフ: 2026年1月（Sonnet 4.6 の 2025年8月より約5ヶ月新しい）

## NOCTAへの関連メモ
R-09 の「価格は要確認（旧 Opus 4.6: $5/$25/MTok）」を「$5/$25/MTok」に更新可能。拡張思考がないため深いステップバイステップ推論は Sonnet 4.6 を使う R-09 の Drafter/Critic フローの設計は適切。
