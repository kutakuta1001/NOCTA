---
title: "モデル概要 — Fable 5.1 の知識カットオフが Opus 5 を追い越した"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-09-06"
domain: "platform.claude.com"
tags: [best-practices, claude-code, models, source:manual]
---

## 要約（3〜5行）
Fable 5.1 の信頼できる知識カットオフは2026年6月で、Opus 5（2026年5月）より新しい。
学習データのカットオフも同じく2026年6月。
これまで「Fable はカットオフが古い」ことが Opus を選ぶ根拠になっていたが、5.1 で逆転した。
Sonnet 5 は2026年1月、Haiku 4.5 は2025年2月で据え置き。

## 主なポイント
- 信頼できる知識カットオフ: Fable 5.1 = 2026年6月 > Opus 5 = 2026年5月 > Sonnet 5 = 2026年1月 > Haiku 4.5 = 2025年2月
- Fable 5.1 は Adaptive thinking が常時オン。Opus 5 / Sonnet 5 は Adaptive、Haiku 4.5 は Extended
- 既定 effort は Fable 5.1 / Opus 5 / Sonnet 5 が high。Haiku 4.5 は effort 非対応
- コンテキストは Fable 5.1 / Opus 5 / Sonnet 5 が 1M、Haiku 4.5 が 200K

## NOCTAへの関連メモ
R-09 の「Fable 5 は知識カットオフが2026年1月で Opus 5（2026年5月）より古く、
最新の仕様情報を扱う判断では Opus 5 を選ぶ」という記述は Fable 5.1 では成立しない。
残る Opus 5 優位の根拠は価格（$5/$25 対 $10/$50）とトークン消費量のみになる。
`/model-review` で棲み分けの再設計が必要。
