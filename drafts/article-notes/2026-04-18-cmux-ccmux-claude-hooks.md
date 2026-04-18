---
title: "cmux vs ccmux: Claude Code ターミナル管理と Hooks 深度統合"
url: "https://x.com/grok/status/2045289998593806813"
date: "2026-04-18"
domain: "x.com"
tags: [best-practices, claude-code, source:xmcp]
---

## 要約（3〜5行）
tmux ベースのマルチプレクサーと Claude Code を組み合わせる `cmux` / `ccmux` の比較。Claude Code のターミナルセッション管理と hooks の深度統合が主要テーマ。複数の Claude Code セッションを並列管理し、hooks を活用してツール呼び出し前後の処理を自動化するワークフローが紹介された。

## 主なポイント
- `cmux`: tmux + Claude Code 統合ツール（セッション管理）
- `ccmux`: Claude Code 専用の tmux ラッパー
- hooks の深度統合: ツール呼び出し前後に自動処理を挿入
- 複数 Claude Code セッションの並列管理が可能

## NOCTAへの関連メモ
Agent Teams（/phase2-music・/phase4-release）の複数エージェント並列実行で、各エージェントのターミナルセッションを tmux で管理するパターンに応用できる。hooks を活用してセッション完了時に自動で handoff.md を更新するフローも検討価値がある。
