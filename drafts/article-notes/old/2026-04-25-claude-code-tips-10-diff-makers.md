---
title: "@ClaudeCode_love — Claude Codeで差がつくTips10選"
url: "https://x.com/ClaudeCode_love/status/2046531725157957964"
date: "2026-04-25"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Codeで「意外と知られていないけど本当に差がつく」10のTips。
/clear・/compact・CLAUDE.md・Skills・Subagent・Hooksなど、基本的なワークフロー設計の要素を網羅。
NOCTAでは大部分が既に実装済みだが、「Hooksでformat自動化」は明示的に設計されていない。

## 主なポイント
- ①/clearで不要な文脈を切る ②/compactで要約 ③CLAUDE.mdにルール固定 ④手順書はSkillsに逃がす ⑤調査はSubagentに分業 ⑥Hooksでformat自動化
- format自動化: PreToolUse/PostToolUseでmarkdownフォーマット・lintを自動実行
- Skills（slash commands）は「再現性の確保」が主目的

## NOCTAへの関連メモ
①〜⑤はすべて実装済み（R-09・セッション運用・スキル体系・Agent Teams）。⑥のHooksによるformat自動化はNOCTAではhandoff.md更新フォーマット確認に応用できる可能性あり。現在のDenyリスト設定に加えて、PreToolUseでファイル書き込み前フォーマット確認hookを追加する価値があるかもしれない。
