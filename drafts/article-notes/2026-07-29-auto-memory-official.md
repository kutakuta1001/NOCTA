---
title: "[code.claude.com] auto-memory が公式機能としてドキュメント化"
url: "https://code.claude.com/docs/ja/memory"
date: "2026-07-29"
domain: "code.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
auto-memory（自動メモリ）が Claude Code の公式機能としてドキュメント化された。CLAUDE.md とは別に、ビルドコマンド・デバッグ知見などの学習内容をセッション間で自動保存する。

## 主なポイント
- CLAUDE.md = 人間が書く恒常ルール / auto-memory = Claude が自動で貯める作業知見、という公式の棲み分け
- 何も書かずにセッション間で知見が共有される
- メモリの内容は /memory で確認・編集できる

## NOCTAへの関連メモ
NOCTA は既にメモリ運用中（MEMORY.md + 個別メモリファイル）。公式の棲み分け定義が明文化されたので、「リポジトリに書くべきこと（CLAUDE.md/handoff）」と「メモリに書くべきこと」の境界の参考になる。
