---
title: "Sonnet 5 の信頼できる知識カットオフは2026年1月（Fable 5 と同じ）"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-08-21"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約

公式モデル一覧の比較表によると、信頼できる知識のカットオフは
Fable 5 が2026年1月、Opus 5 が2026年5月、Sonnet 5 が2026年1月、Haiku 4.5 が2025年2月。
訓練データのカットオフも Sonnet 5 は2026年1月で、Opus 5 の2026年5月より4ヶ月古い。

## 主なポイント

- カットオフが古いのは Fable 5 だけではない。既定の起案モデルである Sonnet 5 も同じ2026年1月
- 最新の仕様情報（Claude Code の新機能・モデル価格・API 変更）を扱う判断では Opus 5 が有利
- Haiku 4.5 は2025年2月と大幅に古く、調査タスクでも Web 検索の裏取りが前提になる

## NOCTAへの関連メモ

R-09 は「Fable 5 は知識カットオフが2026年1月で Opus 5（2026年5月）より古く、
最新の仕様情報を扱う判断では Opus 5 を選ぶ」と Fable 5 についてのみ記述している。
同じ制約が Sonnet 5 にも当てはまるため、起案段階で最新仕様を扱う場合の注意として補える。
