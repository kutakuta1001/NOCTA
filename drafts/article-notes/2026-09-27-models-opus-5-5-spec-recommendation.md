---
title: "Claude モデル一覧 — Opus 5.5 の仕様と公式推奨（ほとんどは Opus 5.5、難所は Fable 5.1）"
url: "https://platform.claude.com/docs/ja/models/overview"
date: "2026-09-27"
domain: "platform.claude.com"
tags: [best-practices, claude, models, source:manual]
---

## 要約（3〜5行）
公式モデル一覧が Claude Opus 5.5 を掲載した。1M コンテキスト・最大出力128k・信頼できる知識カットオフ2026年6月（Fable 5.1 と同じ）・
適応型思考は常時オン・廃止は2027年9月22日以降。公式推奨は「ほとんどのワークロードは Opus 5.5 から始め、
高度な推論や長期エージェント作業、または Opus 5.5 を高 effort で回しても評価が基準に届かない場合に Fable 5.1」。

## 主なポイント
- 価格 $4/$20 per MTok。Batch API は50%オフ、300k 出力ベータ（`output-300k-2026-03-24`）にも対応
- レイテンシは Fable 5.1（Slower）と Sonnet 5（Fast）の間の Moderate
- Opus 5 以前からの移行ガイド `/docs/ja/models/opus-5-5/migration-guide` が用意されている
- Fable 5.1 は「demanding reasoning and long-horizon agentic work」、Opus 5.5 は「long-running agentic coding and knowledge work」と位置づけ

## NOCTAへの関連メモ
R-09 の3段構成（起案 Sonnet 5 / 批評 Opus 5 / 超重要 Fable 5.1）の中段が Opus 5.5 に置き換わる。
公式の「Opus 5.5 高 effort で足りなければ Fable 5.1」という基準は、R-09 の「判断が割れる超重要案件は Fable 5.1」と整合する。
