---
title: "Haiku 4.5 は適応型思考なし・コンテキスト200k・最大出力64k"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-08-21"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約

公式モデル一覧の比較表によると、Haiku 4.5 は現行モデルの中で唯一
拡張思考（`thinking.type: "enabled"`）に対応し、適応型思考には対応しない。
Fable 5 / Opus 5 / Sonnet 5 はその逆で、拡張思考に非対応・適応型思考に対応する（Fable 5 は常時オン）。
コンテキストは Haiku 4.5 が200kトークン、他の3モデルは100万トークン。最大出力は64k対 128k。

## 主なポイント

- Haiku 4.5 は「速いが思考の使い方が他と異なる」モデル。適応型思考が働かないため、複雑な判断には向かない
- コンテキストが200kと5分の1なので、大きなファイルを読ませる調査タスクでは早く上限に当たる
- 価格は $1/$5（入力/出力 MTok）で最安。単純作業に振る前提は妥当

## NOCTAへの関連メモ

R-09 は Haiku 4.5 を「調査・短いファイル生成・handoff 更新」に割り当てている。
コンテキスト200kという制約から、CHANGELOG（5,693行・535KB）のような大きなファイルを扱う収集タスクを
Haiku のサブエージェントに任せると上限に当たる恐れがある。切り出した後の要約に使う方が安全。
