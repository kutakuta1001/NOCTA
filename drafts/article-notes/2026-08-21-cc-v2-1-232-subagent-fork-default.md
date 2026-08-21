---
title: "Claude Code v2.1.232 — サブエージェントの fork が既定オン、生成は既定バックグラウンド"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-21"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

v2.1.232 でサブエージェントの fork が既定で有効になった。
`subagent_type: "fork"` を指定したサブエージェントは、親の会話全体とプロンプトキャッシュを継承する。
さらに、インタラクティブセッションでのチームメイト以外のエージェント生成が既定でバックグラウンド実行になった。

## 主なポイント

- fork は「文脈を渡し直す手間なしに」サブエージェントを起動できる。プロンプトキャッシュを継承するのでコスト面でも有利
- 通常のサブエージェントは独自コンテキストで起動するため、依頼内容を明示的に書く必要がある。fork はその逆
- バックグラウンド既定化により、サブエージェント起動後もメインセッションが応答性を保つ

## NOCTAへの関連メモ

NOCTA のエージェント（trend-analyst / lyric-poet 等）は独自コンテキストで起動する設計で、
楽曲仕様や世界観メモを毎回渡している。fork を使えばその引き渡しを省ける場面がある一方、
コンテキストを共有すると「新鮮な目でのレビュー」が損なわれるため、批評系（lyric-critic / concept-critic）には向かない。
