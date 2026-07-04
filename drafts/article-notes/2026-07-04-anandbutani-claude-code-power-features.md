---
title: "10 CLAUDE CODE FEATURES FOR POWER USERS"
url: "https://x.com/AnandButani/status/2072183530977714301"
date: "2026-07-04"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
パワーユーザー向けのClaude Code機能10選。1) Git worktreesで4〜8エージェントを各ブランチで並列実行し競合ゼロ（v2.1.49〜）、2) `.claude/agents/`にmdファイルを置くカスタムサブエージェント定義（ツール・モデル・権限指定）、3) `@`エージェントメンション、以下続く。

## 主なポイント
- Git worktreesでの並列エージェント実行（4〜8並列・競合ゼロ）
- カスタムサブエージェントの`.md`定義（ツール・モデル・権限）
- `@`エージェントメンション機能

## NOCTAへの関連メモ
NOCTAは楽曲ごとにgitブランチを分ける運用（song-switch/song-list）だが、これは「1曲=1ブランチ」の直列切替であり、Git worktreesの「同時並列実行」とは異なる発想。CEOは1人で複数タスクを同時に見る必要は薄いため直接適用は低優先度だが、将来Visual/Words/Codeの複数ストリームを本当に並列で進めたくなった際の参考パターンとして記録（インスピレーションメモ）。
