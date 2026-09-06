---
title: "Claude Code CHANGELOG v2.1.257 — Claude Fable 5.1 追加"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-06"
domain: "github.com"
tags: [best-practices, claude-code, changelog, models, source:manual]
---

## 要約（3〜5行）
CHANGELOG v2.1.257 で Claude Fable 5.1（`claude-fable-5-1`）が追加され、既定の Fable モデルに昇格した。
1M コンテキスト・$10/$50 per MTok で、プロンプトキャッシュ読み取りは $0.25/MTok（基本入力価格の2.5%）。
従来の Fable 5 は Legacy へ移動したが利用は継続できる。
ゲートウェイ経由のセッションでは `fable` / `best` は当面 Fable 5 に解決され続けるため、5.1 を使うには `/model` で明示的に選ぶ必要がある。

## 主なポイント
- モデルID `claude-fable-5-1`。既定の Fable モデルに交代
- 価格は Fable 5 と同じ $10/$50 だが、キャッシュ読み取りが2.5%（他モデルは10%）で実質コストが下がる
- Fable 5 は Legacy 扱い。Fable 5.1 の廃止は 2027-09-01 以降とコミットされている
- v2.1.260 で「`model: fable` エージェントが `[1m]` タグを無視して 200K で動く」不具合が修正された

## NOCTAへの関連メモ
R-09 は「深い推論が必要な超重要案件は Fable 5」と定めており、モデル名の更新が必要。
`/model-review` で Fable 5 から Fable 5.1 への差し替えとコスト前提の再計算を行う。
