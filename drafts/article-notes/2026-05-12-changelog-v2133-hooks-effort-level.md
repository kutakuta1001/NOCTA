---
title: "CHANGELOG v2.1.133 — hooksにeffort.levelを渡せるようになった"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-05-12"
domain: "docs.anthropic.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.133で、hooksがeffort.levelとCLAUDE_EFFORT環境変数を受け取れるようになった。
これにより、CEOやユーザーが指定したeffortレベル（low/medium/high/xhigh）をhookスクリプトが参照し、
条件に応じて動作を切り替えることが可能になった。

## 主なポイント
- hooks の PostToolUse / Stop 等で `CLAUDE_EFFORT` 環境変数が利用可能になった
- effortレベル（low / medium / high / xhigh）に応じた分岐処理がhookで実現できる
- R-09のモデル使い分けルールと組み合わせて、effort自動制御の自動化に応用できる
- 同バージョンで worktree.baseRef 設定も追加（fresh/head 選択可）

## NOCTAへの関連メモ
R-09で `/effort xhigh` を重要レビュー時に指定しているが、hooksからCLAUDE_EFFORTを参照することでフェーズごとの自動effort切替が将来的に設計できる。CLAUDE.mdのR-09に注記追加を検討。
