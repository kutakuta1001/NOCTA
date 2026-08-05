---
title: "[platform.claude.com] モデル一覧 — Fable 5 は Opus 4.7 導入のトークナイザで同じテキストが約30%多いトークンになる"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-08-05"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Fable 5 のコンテキストウィンドウ注記に、Opus 4.7 で導入されたトークナイザを使用しており、Opus 4.7 より前のモデルと比べて同じテキストが約30%多いトークンを生成する旨が明記されている（増加率は内容次第）。1M トークンは約555k words / 約2.5M unicode 文字に相当する。

## 主なポイント
- Fable 5 は Opus 4.7 世代のトークナイザを使用
- Opus 4.7 以前の世代と比べ、同一テキストで約+30%のトークン数
- 表示価格 $10/$50 per MTok に加えて、トークン数自体が増える
- 1M トークン ≒ 555k words ≒ 2.5M unicode 文字

## NOCTAへの関連メモ
CLAUDE.md は Fable 5 を「深い推論が必要なタスク（超重要クリティーク・歌詞・PVコンセプト・重要設計）の第一候補」と規定している。単価は Opus 5 の2倍（$10/$50 対 $5/$25）だが、トークン数が約30%増えるため実効コスト差は2倍を超える。CLAUDE.md 群が973行・34,507文字ある現状では、この係数が毎セッションの固定費に効く。Fable 5 を使うなら CLAUDE.md スリム化の優先度がさらに上がる。
