---
title: "CHANGELOG v2.1.119 — --agent permissionMode適用 + /config永続保存"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.119で、`--agent <name>` でエージェントを呼び出すとそのエージェントの frontmatter に定義された `permissionMode` が自動適用されるようになった。
また `/config` で変更した設定が `~/.claude/settings.json` に永続保存されるようになり、セッションをまたいで設定が維持される。

## 主なポイント
- `--agent <name>` 呼び出し時にエージェント定義の `permissionMode` が自動適用
- `~/.claude/agents/` の frontmatter に `permissionMode: auto` 等を明示可能
- `/config` の変更が `~/.claude/settings.json` に永続保存（再起動後も維持）

## NOCTAへの関連メモ
NOCTAの `~/.claude/agents/` 以下のエージェント定義ファイルに `permissionMode` を明記するとチーム実行時の権限管理が安全になる。特に svp-generator（Opus）や sns-batch-agent のような書き込み系エージェントは `permissionMode: default` か `dontAsk` を明記するとよい。
