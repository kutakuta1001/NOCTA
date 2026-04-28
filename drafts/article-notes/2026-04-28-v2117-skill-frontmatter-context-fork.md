---
title: "Claude Code v2.1.117 — スキルfrontmatterに context:fork / agent フィールド追加"
url: "https://docs.anthropic.com/release-notes/claude-code"
date: "2026-04-28"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
v2.1.117 のリリースで、スキルの frontmatter に `context: fork` と `agent` フィールドが追加された。
フォーク化サブエージェント（`CLAUDE_CODE_FORK_SUBAGENT=1`）が外部ビルドでも有効化可能に。
エージェントの frontmatter で `mcpServers` フィールドを指定できるようになり、エージェントスキル設計の柔軟性が向上。

## 主なポイント
- `context: fork`: スキルをフォーク環境で実行するフラグ
- `agent` frontmatter フィールド: スキルをエージェントとして起動する設定
- `mcpServers` in agent frontmatter: エージェントスキルに専用 MCP を持たせることが可能
- macOS/Linux: Glob・Grep ツールが組み込み `bfs`/`ugrep` に置き換わり高速化
- `claude plugin install` で欠落依存関係を自動インストール

## NOCTAへの関連メモ
現在の NOCTA スキル（`~/.claude/commands/`）は frontmatter に name/description のみ。将来 Agent Teams スキルを設計する際に `context:fork` / `agent` / `mcpServers` フィールドを活用すると、エージェントスキルが独立した MCP 設定を持てるようになる。
