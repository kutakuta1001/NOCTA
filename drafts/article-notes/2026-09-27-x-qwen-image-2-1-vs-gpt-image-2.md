---
title: "@mu_sette のツイート — Qwen-Image-2.1 は GPT Image 2 より細かい指示が通る（比較図付き）"
url: "https://x.com/mu_sette/status/2101961066267934947"
date: "2026-09-27"
domain: "x.com"
tags: [best-practices, x, visual, gpt-image, source:xmcp]
---

## 要約（3〜5行）
Qwen-Image-2.1 は GPT Image 2 より細かく指示を出せるので、Qwen のプロンプト感度に合わせて組み立てれば面白いことができそう、という所感。
部屋でベースを持った写真を撮り、同じプロンプトを両モデルに投げた出力比較図を添付。いいね3。

## 主なポイント
- Qwen-Image-2.1: 細粒度の指示追従に強い
- GPT Image 2: 同じプロンプトでは指示の一部が丸められる傾向
- モデル別にプロンプトの粒度を変える必要がある

## NOCTAへの関連メモ
visual-prompter は GPT Image 2 向けの粒度で書いている。Qwen-Image を選択肢に入れる場合、同じ文書に「細粒度版」を併記する型が必要。
`nocta-tools.md` の画像生成の選択肢に Qwen-Image-2.1 を候補として1行追加する材料。
