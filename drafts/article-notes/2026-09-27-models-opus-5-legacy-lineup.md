---
title: "Claude モデル一覧 — Opus 5 が Legacy へ、現行は Fable 5.1 / Opus 5.5 / Sonnet 5 / Haiku 4.5"
url: "https://platform.claude.com/docs/ja/models/overview"
date: "2026-09-27"
domain: "platform.claude.com"
tags: [best-practices, claude, models, source:manual]
---

## 要約（3〜5行）
比較表の現行ラインナップが Fable 5.1 / Opus 5.5 / Sonnet 5 / Haiku 4.5 の4本になり、Opus 5 は Legacy（利用継続可）に移った。
Legacy には Fable 5 / Opus 5 / Opus 4.8 / 4.7 / 4.6 / 4.5 / Sonnet 4.6 / 4.5 が並ぶ。
Opus 5 の廃止コミット（2027-07-24 以降）は変わらないが、公式ドキュメントの推奨からは外れた。

## 主なポイント
- Opus 5 は API から引き続き呼べる。急いで切り替える必要はないが、新機能の文書は Opus 5.5 前提で書かれていく
- Haiku 4.5 は現行扱いのまま。廃止下限 2026-10-15 は約3週間後で、後継の告知はまだない
- Sonnet 5 は変更なし（$2/$10・1M・カットオフ2026年1月）
- Claude Code のエージェント定義で `model: opus` と書くと、既定 Opus が 5.5 になったバージョンでは Opus 5.5 を指す

## NOCTAへの関連メモ
`~/.claude/references/model-lineup.md`（最終更新 2026-09-12）と R-09・AGENTS 節の「Opus 5」表記が古くなる。
`claude-config/agents/` の `model: opus` 指定は自動で 5.5 を指す可能性があるため、切替通知ルール（R-09）の対象を確認する必要がある。
