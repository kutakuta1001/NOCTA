---
title: "Claude モデル一覧 — Opus 5.5 の既定 effort は medium（Fable 5.1 / Sonnet 5 は high）"
url: "https://platform.claude.com/docs/ja/models/overview"
date: "2026-09-27"
domain: "platform.claude.com"
tags: [best-practices, claude, models, cost, source:manual]
---

## 要約（3〜5行）
比較表の Default effort 行で、Opus 5.5 だけが `medium`。Fable 5.1 と Sonnet 5 は `high`、Haiku 4.5 は effort 非対応。
API の既定値であり、Claude Code 側もモデル別 effort 保存に変わったため（v2.1.280）、Opus 5.5 を選んだ直後は medium で動く。
思考は Adaptive（常時オン）で、effort が思考量の目安になる。

## 主なポイント
- 批評・レビュー用途で Opus 5 と同じ推論深さを期待するなら `/effort high` を明示する
- スキル / コマンド / サブエージェントの frontmatter `effort:` は v2.1.267 で確実に効くようになった
- Extended thinking（`budget_tokens` 指定）は Opus 4.6 / Sonnet 4.6 で非推奨、以降のモデルでは受け付けない
- 1M トークンは現行トークナイザで約55.5万語（Opus 4.7 以前は約75万語）。同じ文章でもトークン数が約1.35倍になる

## NOCTAへの関連メモ
G-01 の「標準は high」を Opus 5.5 で守るには、批評系エージェント（lyric-critic / concept-critic / svp-generator）の定義に
`effort: high` を書くのが最も確実。`/effort` の手動切替は忘れやすい。
