---
title: "Claude Code 概要 — claude agents（エージェントビュー）で複数バックグラウンドセッションを1画面監視"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-09-27"
domain: "code.claude.com"
tags: [best-practices, claude-code, subagents, source:manual]
---

## 要約（3〜5行）
並列実行の選択肢として `claude agents`（エージェントビュー・研究プレビュー）が概要とベストプラクティスに載った。
バックグラウンドで動き続けるセッションをディスパッチし、1つの画面から監視する。
worktree・クロスセッションメッセージング・デスクトップアプリ・Web・Agent Teams（実験的・既定オフ）と横並びで整理された。

## 主なポイント
- エージェントビューは研究プレビュー。`claude agents` で起動
- Agent Teams は「実験的で既定無効」と明記。共有タスク・メッセージング・チームリーダー付き
- 複数セッションは Writer / Reviewer パターンにも使える。新しいコンテキストは自分が書いたコードに偏らない
- テストを書くセッションと通すコードを書くセッションを分ける使い方も提示

## NOCTAへの関連メモ
COST POLICY は「複数領域の並列作業は Agent Teams（大型フェーズのみ）」としている。Agent Teams が実験的・既定オフである以上、
`/phase2-music` と `/phase4-release` の並列実行手段としてエージェントビューやサブエージェント fork が現実的な代替になる。
