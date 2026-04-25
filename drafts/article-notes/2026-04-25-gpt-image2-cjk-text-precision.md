---
title: "GPT Image 2 — CJKテキスト精度約99%・日本語タイトル正確描画"
url: "https://openai.com/blog/gpt-image-2"
date: "2026-04-25"
domain: "openai.com"
tags: [best-practices, openai, source:manual]
---

## 要約（3〜5行）
GPT Image 2のCJK（中国語・日本語・韓国語）テキスト精度は約99%。
日本語の歌詞フレーズや楽曲タイトルを画像内に正確に描画できる。
NOCTAのSNSグラフィック・楽曲アートワーク制作に直接活用可能。

## 主なポイント
- CJKテキスト精度: 約99%（DALL-E 3・Midjourneyより大幅向上）
- 日本語テキスト指定: `Include Japanese text "〇〇" at top-center in bold white lettering.` で正確に描画
- 歌詞フレーズ・楽曲タイトル・NOCTAロゴを画像内に埋め込み可能

## NOCTAへの関連メモ
実装済み: /visual-promptのStep 4プロンプト構造に「日本語テキスト指定（あれば）」として記載済み。SNSグラフィックに日本語タイトルを入れた画像をGPT Image 2で生成するフローが確立済み。楽曲リリース時のサムネイル・Instagram用正方形グラフィックへの応用可能。
