---
title: "CHANGELOG v2.1.139 — Agent View追加（バックグラウンドエージェント監視）"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-05-12"
domain: "docs.anthropic.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
v2.1.139でAgent Viewが追加され、実行中の全セッション（バックグラウンドエージェント含む）を
1画面で一覧表示できるようになった。
デスクトップアプリ・WebUIで利用可能で、複数エージェントの並列実行を視覚的に監視できる。

## 主なポイント
- バックグラウンドエージェント全セッションを一覧表示・監視する `/agent-view` 相当機能
- 並列セッション管理がCLI・デスクトップ・Webすべてで統一
- X上では「Agent View just dropped today」と注目されていた（@SynabunAI, 2026-05-11）
- Subagent駆動の大規模タスク実行後の確認フローに使えると予測

## NOCTAへの関連メモ
Agent Teams（/phase2-music・/phase4-release）実行時に複数エージェントを一画面で監視できるため、CLAUDE.mdのSLASH COMMANDSセクションまたはセッション運用セクションへの追記候補。
