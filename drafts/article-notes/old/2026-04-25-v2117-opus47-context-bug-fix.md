---
title: "CHANGELOG v2.1.117 — Opus 4.7のコンテキスト計算バグ修正（200K→1M）"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.117で、Opus 4.7の `/context` 計算バグが修正された。
バグ前: コンテキストウィンドウが200Kとして計算されていたため、実際には余裕があるのに過剰なauto-compactionが発生していた。
修正後: 正しい1Mコンテキストウィンドウで計算されるようになり、無駄なcompactionが大幅に減少する。

## 主なポイント
- Opus 4.7のコンテキストは1M（修正前は200Kとして誤計算）
- v2.1.117以前にOpus 4.7で頻繁にauto-compactionが起きていた場合はバグが原因
- 修正後はOpus 4.7で長文SVP生成・仕様書生成が中断されにくくなる

## NOCTAへの関連メモ
svp-generator（Opus 4.7使用）で大型SVPファイルを生成する際にauto-compactionが途中で入っていた場合、v2.1.117以降では解消されているはず。R-09の「出力が64k超になる見込みのタスクはOpus 4.7を優先」という判断を継続できる。
