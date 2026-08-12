---
title: "CHANGELOG v2.1.117 — /resumeに大規模セッション要約オプション追加（最大67%高速）"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.117で、`/resume` コマンドに大規模セッションの要約オプションが追加された。
長期プロジェクト（100+メッセージ）の再開時に最大67%高速化される。長い会話履歴を圧縮要約してから再開するオプションで、コンテキストウィンドウも節約できる。

## 主なポイント
- `/resume` に大規模セッション対応の要約オプションが追加
- 長期セッション再開で最大67%高速化
- コンテキスト圧縮により /compact 相当の効果を再開時に自動適用

## NOCTAへの関連メモ
NuWordのような複数フェーズにまたがる長期プロジェクトのセッション再開に有効。現在CLAUDE.mdのセッション運用テーブルには `claude --resume`（選択）と記載があるが、要約オプションの存在を補記するとよい。`/weekly-check` の再開ルーティンにも活用できる。
