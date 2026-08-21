---
title: "@diguapet のツイート — Opus 5 用システムプロンプトを append で付ける"
url: "https://x.com/diguapet/status/2089577418134876530"
date: "2026-08-21"
domain: "x.com"
tags: [best-practices, x, claude-code, source:xmcp]
---

## 要約

Opus 5 は賢いが使うのが疲れる（答えが6つの見出しの下に埋もれる、トークンを大量に消費する、
Anthropic の co-author 署名を有料のコミットに入れてくる）という不満から、
モデルをファインチューニングせずに `sr_opus_5_system_prompt.md` 1ファイルを
`--append-system-prompt-file` で Claude Code や Pi に付ける、という repo の紹介。

## 主なポイント

- `--append-system-prompt-file` はシステムプロンプトを追加するフラグ。既存の指示を置き換えるのではなく追記する
- 不満の中身は「冗長さ」と「トークン消費」。v2.1.237 の Concise 出力スタイルが公式側の同じ問題への回答にあたる
- co-author 署名の除去に言及している点は、NOCTA の git 運用と衝突する

## NOCTAへの関連メモ

冗長さへの対処としては、外部の system prompt を持ち込むより
公式の Concise 出力スタイル（v2.1.237）を使う方が保守コストが低い。
co-author 署名の除去は NOCTA のグローバル指示（コミットに Co-Authored-By を付ける）に反するため、
この部分は採用せず CEO 判断に委ねる。要注意項目として分離した。
