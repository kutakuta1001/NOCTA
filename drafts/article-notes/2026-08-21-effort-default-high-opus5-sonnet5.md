---
title: "Opus 5 / Sonnet 5 は Claude API と Claude Code で effort 既定が high"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-08-21"
domain: "platform.claude.com"
tags: [best-practices, claude-code, cost, source:manual]
---

## 要約

公式モデル一覧の注記によると、Claude Opus 4.8 では `effort` パラメータが
Claude API・Claude Code・claude.ai の全サーフェスで既定 `high` に設定されている。
Claude Opus 5 と Claude Sonnet 5 では、Claude API と Claude Code において既定 `high`。
別の水準を使うには `effort` を明示的に設定する必要がある。

## 主なポイント

- 「何も指定しなければ high」である。低コストで済む作業でも既定では高い推論努力が使われる
- 明示的に `/effort low` や `/effort medium` を選ばないとコスト最適化が働かない
- claude.ai サーフェスについては Opus 4.8 のみ記載があり、Opus 5 / Sonnet 5 は API と Claude Code のみ明記

## NOCTAへの関連メモ

R-09 は「単純タスクは `/effort low` または `medium`、標準は `high`、最重要は `xhigh`」と定めている。
方針としては合っているが、「明示しなければ high になる」という事実が書かれていないため、
low を選ぶ判断が働きにくい。R-09 への1行補記の候補。
