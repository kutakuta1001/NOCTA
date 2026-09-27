---
title: "Claude モデル一覧 — キャッシュ読取は Opus 5.5 が5%、Fable 5.1 / Mythos 5.1 が2.5%、他は10%"
url: "https://platform.claude.com/docs/ja/models/overview"
date: "2026-09-27"
domain: "platform.claude.com"
tags: [best-practices, claude, models, cost, source:manual]
---

## 要約（3〜5行）
プロンプトキャッシュ読取の割引率が3段階になった。基本入力価格に対して Fable 5.1 と Mythos 5.1 は2.5%、Opus 5.5 は5%、
その他のモデルは10%。金額では Fable 5.1 $0.25/MTok、Opus 5.5 $0.20/MTok、Sonnet 5 $0.20/MTok。
2026-09-06 に収集した「他モデルは10%」の記述は Opus 5.5 の登場で訂正が必要になった。

## 主なポイント
- Opus 5.5 と Sonnet 5 のキャッシュ読取単価は同じ $0.20/MTok。長いセッションでは Opus 5.5 の実コストが表示価格差より縮む
- キャッシュ書込・長コンテキスト・プラットフォーム別価格は Pricing ページ参照
- Batch API は全モデル50%オフ
- Claude Code は1時間の prompt-cache TTL を使うため、セッションを跨いでもキャッシュが効く

## NOCTAへの関連メモ
R-09 の「Opus 5 を既定に置く根拠は価格が半額でトークン消費が約30%少ない」という記述は、Opus 5.5 では
「価格 $4/$20 で Fable 5.1 の4割、キャッシュ読取は Sonnet 5 と同額」に置き換わる。model-lineup.md の価格節を更新する材料。
