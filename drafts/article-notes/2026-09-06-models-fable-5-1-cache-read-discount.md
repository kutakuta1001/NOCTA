---
title: "モデル概要 — Fable 5.1 のプロンプトキャッシュ読み取りは基本入力価格の2.5%"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-09-06"
domain: "platform.claude.com"
tags: [best-practices, claude-code, models, cost, source:manual]
---

## 要約（3〜5行）
プロンプトキャッシュの読み取りコストは通常「基本入力価格の10%」だが、
Claude Fable 5.1 と Claude Mythos 5.1 のみ2.5%に設定されている。
Fable 5.1 の入力は $10/MTok なので、キャッシュ読み取りは $0.25/MTok。
同条件の Opus 5（入力 $5/MTok の10% = $0.50/MTok）よりキャッシュ読み取りは安い。

## 主なポイント
- Batch API は全モデル50%割引
- キャッシュ読み取り: Fable 5.1 / Mythos 5.1 は2.5%、他モデルは10%
- キャッシュ書き込み・長コンテキスト・プラットフォーム別価格は Pricing ページ参照
- 長いセッションでキャッシュヒットが多いワークロードでは、表示価格の差（$10 対 $5）よりも実コストの差が縮む

## NOCTAへの関連メモ
R-09 は Fable 5 について「トークンも約30%多く消費する」とコスト面の不利を記載している。
Fable 5.1 のキャッシュ読み取り2.5%はその不利を部分的に打ち消す要素で、
長時間セッション（NOCTA の典型的な作業形態）では影響が大きい可能性がある。
ただしキャッシュ書き込みコストは未確認のため、`/model-review` で Pricing ページを見て確定させる必要がある。
