---
title: "[docs.anthropic.com] Haiku 4.5 の knowledge cutoff は 2025年2月"
url: "https://docs.anthropic.com/ja/docs/about-claude/models"
date: "2026-05-28"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
公式モデル一覧で Claude Haiku 4.5 の信頼できるナレッジカットオフが 2025年2月（トレーニングデータカットオフは 2025年7月）であることが確認された。
NOCTA の R-09 にはこの情報が記載されておらず、Haiku をトレンド調査に使うと最大1年以上古い知識になる可能性がある。
phase1-trend での Haiku 活用範囲の見直しが推奨される。

## 主なポイント
- Haiku 4.5: 信頼できるナレッジカットオフ 2025年2月 / 学習データカットオフ 2025年7月
- Sonnet 4.6: 信頼できるナレッジカットオフ 2025年8月
- Opus 4.7: 信頼できるナレッジカットオフ 2026年1月
- 音楽トレンドは数ヶ月で大きく変化するため、Haiku での最新トレンド判断には限界がある

## NOCTAへの関連メモ
phase1-trend で Haiku は「ファイル生成・文書整理・定型処理」に限定し、トレンドの実際の内容判断は Sonnet 4.6 以上に任せるよう R-09 に注記を追加することを推奨。
