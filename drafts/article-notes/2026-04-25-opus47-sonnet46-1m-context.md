---
title: "モデル一覧 — Opus 4.7 / Sonnet 4.6 は1Mコンテキスト、Haiku 4.5は200k"
url: "https://docs.anthropic.com/ja/docs/about-claude/models"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
Opus 4.7・Sonnet 4.6のコンテキストウィンドウは1Mトークン。Haiku 4.5は200kトークン。
Opus 4.7は新しいトークナイザーを採用しており、同じ内容でも使用トークン数がSonnetと異なる可能性がある。

## 主なポイント
- Opus 4.7 / Sonnet 4.6: 1Mトークンコンテキストウィンドウ
- Haiku 4.5: 200kトークンコンテキストウィンドウ（5分の1）
- Opus 4.7は新トークナイザー採用（同一テキストでのトークン数がSonnetと異なる場合あり）

## NOCTAへの関連メモ
R-09のモデル使い分けでHaiku 4.5を「単純な調査・handoff更新」に使う設計は維持できるが、200k上限を意識する必要がある。大きなファイル（CLAUDE.md + context.md + handoff.mdをすべて読む場合等）をHaikuで処理する場合は上限に注意。Sonnet/Opusはほぼ上限を気にせず使える。
