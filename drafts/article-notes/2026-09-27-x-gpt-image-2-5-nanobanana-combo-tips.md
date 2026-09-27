---
title: "@tea_story_hoshi のツイート — gpt-image 2.5 と nanobanana2 lite を組み合わせる Tips"
url: "https://x.com/tea_story_hoshi/status/2101613923879576042"
date: "2026-09-27"
domain: "x.com"
tags: [best-practices, x, visual, gpt-image, source:xmcp]
---

## 要約（3〜5行）
gpt-image 2.5 は「ディテールが付きすぎる」、nanobanana2 lite は「速くて安いが劣化しすぎる」という両者の弱点を挙げ、
2つを組み合わせて簡単なプロンプトで使うと良い結果になるという Tips。作例2枚付き。いいね12。

## 主なポイント
- gpt-image 2.5: 高ディテールだが過剰になりがち
- nanobanana2 lite: 高速・低コストだが品質劣化
- 組み合わせ + 短いプロンプトが有効（具体的な組み合わせ順は画像側に記載）

## NOCTAへの関連メモ
visual-prompter と `/image-gen` は gpt-image-1 / Gemini を扱う。「ディテール過多を抑える指示」と「軽量モデルで下絵 → 高品質モデルで仕上げ」の
2案をプロンプト文書に添える材料。`~/.claude/references/nocta-tools.md` の画像生成ツール節にモデル特性として1行追記できる。
