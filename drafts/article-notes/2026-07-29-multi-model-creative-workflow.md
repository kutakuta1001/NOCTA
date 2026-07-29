---
title: "@Oluwaphilemon1 のツイート: Claude Fable 5 × GPT-5.6 × Kling のマルチモデル制作ワークフロー"
url: "https://x.com/Oluwaphilemon1/status/2077418440323735800"
date: "2026-07-29"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Fable 5・GPT-5.6・Grok 4.5 を役割分担させる制作ワークフローの実験報告。Claude=アニメーション+開発 / Kling=キャラクターアニメーション / GPT Image 2.0=キャラクターデザイン+テクスチャ / GPT-5.6 Sol=全体コーディネーション、という分担。

## 主なポイント
- モデルごとの得意分野で役割を固定する（開発=Claude・映像=Kling・デザイン=GPT Image）
- 「コーディネーター役」を1モデルに集約して指示の一貫性を保つ
- NOCTA の Agent Teams と同じ発想を複数ベンダー横断で行う事例

## NOCTAへの関連メモ
NOCTA は Claude 内の役割分担（explorer/architect/executor）+ 外部ツールはプロンプト文書（R-04）で同等の構造を持つ。コーディネーションを Claude Code に固定する現行方式のほうが運用資産（CLAUDE.md）を活かせる。
