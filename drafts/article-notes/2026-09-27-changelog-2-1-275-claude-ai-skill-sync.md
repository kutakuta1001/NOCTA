---
title: "Claude Code CHANGELOG v2.1.275 — claude.ai アカウントのスキル・プラグインがターミナルに同期"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-27"
domain: "github.com"
tags: [best-practices, claude-code, changelog, skills, source:manual]
---

## 要約（3〜5行）
claude.ai アカウントで有効にしたスキルとプラグインが、同じアカウントでサインインしたターミナルセッションに同期されるようになった。
`syncClaudeAiSkills: false` / `syncClaudeAiPlugins: false` で停止できる。
本セッションのスキル一覧に並ぶ `anthropic-skills:docx` / `pptx` / `xlsx` / `pdf` などがこの同期由来。

## 主なポイント
- 同期スキルは `/skills` や `/` メニューで、他と衝突しなければ短い名前で表示される（v2.1.281）
- `Skill(anthropic-skills:*)` の allow / deny ルールは同期スキルだけに効く（v2.1.282）
- サインアウト後も残った同期コピーは `cleanupPeriodDays` 経過でごみ箱へ移動（v2.1.271）
- npm ソースのプラグインは `npm pack --ignore-scripts` で取得され install スクリプトが走らない

## NOCTAへの関連メモ
G-07 と CLAUDE.md スキル設計節は「常時ロードを膨らませない」を掲げ、`/mcp` のツール総数80以下を維持している。
同期スキルはスキル一覧を増やしコンテキストを消費する。NOCTA で docx / pptx / xlsx を使う場面は少ないため、
`syncClaudeAiSkills: false` を settings に置くか、必要なものだけ claude.ai 側で無効にする判断ができる。
