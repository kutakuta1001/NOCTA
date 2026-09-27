---
title: "Claude Code ベストプラクティス — /batch で変更を5〜30サブエージェントに分割して worktree で並列実行"
url: "https://code.claude.com/docs/ja/best-practices"
date: "2026-09-27"
domain: "code.claude.com"
tags: [best-practices, claude-code, workflow, cost, source:manual]
---

## 要約（3〜5行）
「ファイル全体にファンアウトする」節に `/batch <instruction>` が載った。Claude が変更を5〜30個のサブエージェントに分割し、
各サブエージェントが自分の worktree で作業する。自前スクリプトから駆動する `claude -p` ループの代替。
`--allowedTools` で無人実行時の権限を絞る手順も並記されている。

## 主なポイント
- `/batch` は WorktreeCreate hook が worktree を用意する環境でも動く（git リポジトリ外でも可・v2.1.281）
- ループ方式は「タスクリスト生成 → スクリプトでループ → 2〜3ファイルで試してから全件」の3段
- 既存パイプラインには `claude -p ... --output-format json | your_command` で組み込める
- 動的ワークフローとの違いは「計画を誰が持つか」。/batch は分割だけを Claude に任せる軽量版

## NOCTAへの関連メモ
COST POLICY の「対象が多く同じ処理を繰り返す機械的作業は動的ワークフロー」に対し、/batch はより軽い選択肢。
`visual-data.js` への作品一括追加や article-notes の一括整形のような「同じ編集を多数ファイルに」は /batch が向く。ただし worktree 前提のため
git リポジトリ（project_NOCTA/）内でのみ使える。
