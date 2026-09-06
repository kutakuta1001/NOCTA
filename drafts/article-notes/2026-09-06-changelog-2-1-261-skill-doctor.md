---
title: "Claude Code CHANGELOG v2.1.261 — /skill-doctor で未使用スキルとコンテキストコストを可視化"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-06"
domain: "github.com"
tags: [best-practices, claude-code, changelog, skills, source:manual]
---

## 要約（3〜5行）
`/skill-doctor` が追加された。読み込まれているスキルのうち使われていないものと、
それぞれがコンテキストで消費している量を表示し、剪定の判断材料を出す。
スキルを増やし続けた環境で「どれが実際に効いているか」を測る手段がこれまでなかった。

## 主なポイント
- 表示対象は「読み込まれたスキル」であり、未使用のものとコンテキストコストが分かる
- 同バージョンで `bashOutputMaxChars` / `taskOutputMaxChars` が追加され、インライン受信量を最大128K文字まで引き上げられる
- `--append-subagent-system-prompt-file` でサブエージェントのシステムプロンプトをファイルから読める
- `/context` のトークンカウントはトークン計測 API が使えないときローカル推定にフォールバックするようになった

## NOCTAへの関連メモ
NOCTA は60件超のスキルを `~/.claude/commands/` に持ち、G-07 で「常時ロードを膨らませない」を掲げている。
これまで剪定の判断は主観に頼っていたが、`/skill-doctor` で数値化できる。
「6ヶ月ごとにゼロベースで見直す」（次回目安 2027-02）の入力として使うのが自然。
