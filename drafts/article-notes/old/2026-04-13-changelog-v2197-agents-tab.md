---
title: "v2.1.97: /agents タブ追加（実行中サブエージェント一覧・Library 管理）"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-04-13"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.97 で `/agents` タブが追加された。
Running タブで現在実行中のサブエージェントの一覧・状態を確認でき、
Library タブで利用可能なエージェントの管理ができる。
Agent Teams（複数エージェント並列実行）の可視化・管理に活用できる。

## 主なポイント
- Running タブ: 実行中サブエージェントの一覧・ステータス確認
- Library タブ: 利用可能なエージェントの管理
- 対象バージョン: v2.1.97 以降

## NOCTAへの関連メモ
NOCTA の phase2-music・phase4-release で起動する Agent Teams の状態を /agents タブでリアルタイム確認できるようになった。並列実行中のどのエージェントが動いているか可視化されるため、デバッグや進捗確認が容易になる。
