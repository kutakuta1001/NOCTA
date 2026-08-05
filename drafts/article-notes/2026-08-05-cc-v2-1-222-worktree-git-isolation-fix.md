---
title: "[changelog v2.1.222] worktree 分離セッションとサブエージェントが main チェックアウトに破壊的 git を実行できた問題を修正"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-05"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.222 で、worktree で分離したセッションとそのサブエージェントが、分離元の main チェックアウトに対して破壊的な git コマンドを実行できてしまう問題を修正した。分離はファイル編集と Bash の両方に対して、すべてのセッション種別で適用されるようになった。同バージョンでは PreToolUse の auto-allow hook がバックグラウンドエージェントのタスク（要約・コンパクション・リネーム）でツール制限を回避していた問題も修正されている。

## 主なポイント
- worktree 分離が「ファイル編集」だけでなく Bash にも適用されるようになった
- サブエージェント経由での main チェックアウト破壊も塞がれた
- PreToolUse auto-allow hook がバックグラウンドタスクで制限を回避していた問題も同時修正
- 分離の保証は全セッション種別に統一された

## NOCTAへの関連メモ
NOCTA は superpowers:using-git-worktrees を運用に組み込んでおり、`project_NOCTA` を worktree で分離して作業するケースがある。分離しているつもりで main の作業ツリーを壊せる状態だったため、v2.1.222 へのアップデートで実効的な安全性が上がる。現在 project_NOCTA には未コミットの変更が205件（削除89・未追跡115）残っているので、破壊的操作の影響範囲が大きい状態でもある。
