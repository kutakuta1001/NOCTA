---
title: "[changelog v2.1.152] スキルの disallowed-tools フロントマター"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-05-28"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.152 で Skills の frontmatter に `disallowed-tools` フィールドが追加された。
スキル実行時に特定ツールを除外できるようになり、不意のツール呼び出しを防ぐハードウェア的なガードが設置できる。
NOCTAのR-03（SNS自動投稿禁止）をルール記述だけでなくコードレベルで補強できる。

## 主なポイント
- スキル frontmatter に `disallowed-tools: [createPosts, likePost, repostPost]` を追加するだけで、そのスキル内からSNS書き込みツールを除外できる
- 現行のR-03はルール記述に依存しているが、disallowed-tools を使うと「書きたくても書けない」フールプルーフ化が実現する
- `/phase4-release`・`/x-practices-search` など SNS 関連処理を含むスキルで特に有効

## NOCTAへの関連メモ
x-practices-search スキルの frontmatter に `disallowed-tools: [createPosts, likePost, repostPost, repostPost]` を追加することでR-03の補強が可能。CEOが判断して手動で追加する。
