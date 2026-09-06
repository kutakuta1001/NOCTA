---
title: "モデル概要 — 現行4モデルの廃止コミット日"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-09-06"
domain: "platform.claude.com"
tags: [best-practices, claude-code, models, source:manual]
---

## 要約（3〜5行）
Anthropic が運営するプラットフォーム（Claude API・Claude Platform on AWS・Microsoft Foundry）における
廃止コミットは、Fable 5.1 が2027-09-01以降、Opus 5 が2027-07-24以降、
Sonnet 5 が2027-06-30以降、Haiku 4.5 が2026-10-15以降。
Haiku 4.5 だけが1年以内に廃止されうる位置にある。

## 主なポイント
- Haiku 4.5 の廃止コミットは2026-10-15以降で、現時点（2026-09-06）から約1ヶ月半後が下限
- Amazon Bedrock と Google Cloud は独自のライフサイクル日程を設定する
- Fable 5.1 が最も長い（2027-09-01以降）
- 「以降」であり確定日ではないが、Haiku 4.5 は後継の登場を見込んでおくべき段階

## NOCTAへの関連メモ
R-09 は「調査・短いファイル生成・handoff 更新」を Haiku 4.5 に割り当てており、
AGENTS 節では analytics-agent が Haiku 指定になっている。
廃止コミットの下限が近いため、後継モデル（Haiku 5 相当）の登場時に速やかに差し替える必要がある。
`/weekly-check` の Step B で新モデル検出を継続する理由がここにある。
