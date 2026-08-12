---
title: "@istupidpreneur のツイート — ブランド/マーケ業務の AI ツール構成"
url: "https://x.com/istupidpreneur/status/2085237142603677879"
date: "2026-08-12"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
ブランドとマーケティング業務に最適な AI ツール構成の私見。ポジショニングは厳密なシステムプロンプトを与えた ChatGPT、ビジュアルは 4o image gen + Midjourney、動画は Kling + Runway、リサーチは Perplexity + Grok deep research、コピーのレビューは ChatGPT でセカンドオピニオン、高速な構築は v0 系。いいね12・ブックマーク4。

## 主なポイント
- 各工程に別ツールを割り当てる構成（1ツールで全部やらない）
- 動画は Kling と Runway の併用
- ビジュアルは画像生成2種の併用
- コピーは別モデルでセカンドオピニオンを取る

## NOCTAへの関連メモ
NOCTA の R-04 は T2V の選択肢として Runway / Kling 3.0 Pro / Dreamina Seedance 2.0 を挙げており、この構成（Kling + Runway の併用）と方向が一致する。PV パイプラインは Runway WebUI 手動方式を採用済み。「コピーを別モデルでセカンドオピニオン」は NOCTA の起案→批評フロー（Sonnet 5 が草稿 → Opus 5 が批評）と同じ思想で、既に実装済み。新規性があるのは「工程ごとにツールを割り当て、1ツールに寄せない」という明示的な方針そのもので、これは R-04（外部生成ツールはプロンプト文書として出力）が既に前提としている構造。
