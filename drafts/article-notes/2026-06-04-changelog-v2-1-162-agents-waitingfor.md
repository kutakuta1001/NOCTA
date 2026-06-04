---
title: "v2.1.162: claude agents --json に waitingFor フィールド追加"
url: ""
date: "2026-06-04"
domain: "docs.anthropic.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

`claude agents --json` の出力に `waitingFor` フィールドが追加され、セッションがブロックされている原因を確認できるようになった。Agent Teamsの並行処理監視に役立つ。

## 主なポイント

- `claude agents --json` でエージェント状態を JSON で取得可能
- `waitingFor` フィールドでブロック原因（ユーザー入力待ち・ツール応答待ちなど）が可視化される
- Agent View（デスクトップ/Web）でもブロック状態を視覚的に確認可能

## NOCTAへの関連メモ

Agent Teams（/phase2-music・/phase4-release）実行中に進行が止まった場合、`waitingFor` でどのエージェントが何を待っているか確認できる。デバッグ効率が向上する。
