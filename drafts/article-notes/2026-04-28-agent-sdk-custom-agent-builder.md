---
title: "Claude Code Agent SDK — カスタムエージェントをフルコントロールで構築"
url: "https://platform.claude.com/docs/en/agent-sdk/overview"
date: "2026-04-28"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Agent SDK を使うと Claude Code のツールと機能を活用した完全カスタムなエージェントを構築できる。
オーケストレーション・ツールアクセス・権限をフルコントロール可能。
既存の Agent Teams とは異なり、独自ワークフローのためのカスタムエージェントを設計できる。

## 主なポイント
- Claude Code のツール（Bash/Read/Edit/Glob/Grep等）をカスタムエージェントで利用可能
- オーケストレーション・ツールアクセス・権限を完全制御
- 既存スキル（`~/.claude/commands/`）を超えた複雑なワークフローに対応
- `--agent` フラグと `mcpServers` frontmatter でエージェント定義（v2.1.117～）

## NOCTAへの関連メモ
現在 NOCTA の Agent Teams は `/phase2-music` と `/phase4-release` の2回のみ推奨。Agent SDK を使うと trend-analyst や svp-generator など各エージェントをより精密に定義できる。現状の Claude Code スキルで十分な場合が多いが、将来の複雑化に備えた選択肢として把握しておく価値がある。
