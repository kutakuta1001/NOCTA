---
title: "Claude Code v2.1.233 — Todo/タスク管理ツールが新モデルで提供終了"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-21"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

v2.1.233 で Todo/タスク管理ツール（TaskCreate / TaskGet / TaskUpdate / TaskList・TodoWrite）が
Opus 4.8・Sonnet 5・Fable 5・Mythos 5 およびそれ以降のモデルで提供されなくなった。
環境変数 `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` を設定すれば従来どおり使える。
新しいモデルは進捗管理をツールに頼らず自前で行える、という前提の変更と読める。

## 主なポイント

- 対象は「Opus 4.8, Sonnet 5, Fable 5, Mythos 5, and newer models」。NOCTA が既定で使う Sonnet 5 と Opus 5 は該当する
- Haiku 4.5 は対象外なので、Haiku を使うサブエージェント（analytics-agent）では引き続き使える
- 復活には環境変数が必要。`~/.claude/settings.json` の `env` に書けばセッションをまたいで有効になる

## NOCTAへの関連メモ

タスクリストを前提に書かれたスキル（複数ステップを Todo で管理する記述があるもの）が空振りする可能性がある。
実際にこのセッションでも「task tools を使うと良い」というリマインダーが出続けており、挙動の実地確認が必要。
