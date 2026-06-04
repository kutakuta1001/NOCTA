---
title: "Claude Code 概要: Agent SDK"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-06-04"
domain: "code.claude.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

Claude CodeのAgent SDKが正式公開。Claude Codeのツール・権限を活用したカスタムエージェントをコードで構築でき、オーケストレーション・ツールアクセス・権限を完全に制御できる。

## 主なポイント

- `~/.claude/agents/` の定義ファイルによるYAMLベースのエージェント設計とは別に、コードレベルでのカスタムエージェント構築が可能になった
- オーケストレーション・ツール選択・権限管理を完全にコントロールできる
- 既存の Claude Code のツール（Bash・Read・Write・WebFetch 等）を再利用できる

## NOCTAへの関連メモ

現状のNOCTAエージェント設計（YAML frontmatter + ~/.claude/agents/）で十分に動作しているため、即時適用は不要。将来的に music pipeline を自動化したい場合（例: trend-analyst → music-spec-writer の完全自動パイプライン）にAgent SDKが活用できる可能性がある。
