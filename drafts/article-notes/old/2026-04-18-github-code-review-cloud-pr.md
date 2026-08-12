---
title: "GitHub Code Review 機能: 全PRでクラウドベース自動コードレビュー"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-04-18"
domain: "code.claude.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code の GitHub Code Review 機能により、全 PR に対してクラウドベースの自動コードレビューが実行できるようになった。GitHub App として連携し、PR 作成・更新時に自動でレビューコメントを投稿する。/ultrareview（手動起動・マルチエージェント）と組み合わせることで、自動チェックと深いレビューの二段構えが可能。

## 主なポイント
- 全 PR に対してクラウドベース自動コードレビュー
- GitHub App 連携（PR 作成・更新時に自動実行）
- /ultrareview（手動・マルチエージェント）とは異なり、CI的に毎回自動起動
- Claude Code Max サブスクライバー向け

## NOCTAへの関連メモ
NOCTA の website/ 更新 PR に対して GitHub Code Review を有効化すると、HP 変更のコード品質チェックが自動化できる。/ultrareview との使い分け: 定常チェックは GitHub Code Review、重要な機能追加時は /ultrareview。
