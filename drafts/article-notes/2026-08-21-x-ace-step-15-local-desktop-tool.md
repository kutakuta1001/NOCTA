---
title: "@D3VAUX のツイート — ACE-Step 1.5 のローカル音楽生成デスクトップツール"
url: "https://x.com/D3VAUX/status/2090461847954567262"
date: "2026-08-21"
domain: "x.com"
tags: [best-practices, x, ai-music, source:xmcp]
---

## 要約

ACE-Step 1.5 を使い、低スペック GPU 上で完全にローカル動作する AI 音楽生成デスクトップツールを作った、
という報告。完全オープンソースで、デスクトップパッケージも GitHub に公開されている。

## 主なポイント

- ローカル動作なので生成コストがかからず、生成物の権利関係も外部サービスに依存しない
- 「低スペック GPU で動く」ことを明示している。Mac 環境で動くかは要確認（CUDA 前提の可能性）
- ACE-Step は `~/.claude/references/nocta-tools.md` で Suno 代替候補として既に記録されている

## NOCTAへの関連メモ

R-13 は「Suno の音源は素材として使う」と定め、LALAL.AI で分離して drums / bass のパーツにする運用。
ローカル生成に置き換われば、生成回数の制約とサブスク費用がなくなる。
ただし Suno の音質・完成度との差が大きければ素材としての価値は下がる。CEO の耳による評価が必要な領域。
