---
title: "v2.1.142: root-level SKILL.md がプラグインスキルとして自動検出"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-05-18"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約
Claude Code v2.1.142 で、プロジェクトルートに `SKILL.md` を置くとプラグインスキルとして自動検出されるようになった。これにより、プロジェクトスコープのスキルをグローバルな `~/.claude/commands/` とは独立して管理できる。同バージョンで /plugin コマンドがプラグイン提供の LSP サーバーも表示するようになった。

## 主なポイント
- root-level `SKILL.md` → プラグインスキルとして自動認識（v2.1.142）
- プロジェクトローカルスキルとグローバルスキル（~/.claude/commands/）の分離が可能に
- claude agents フラグ拡張: --add-dir / --settings / --mcp-config / --plugin-dir が設定可能（同バージョン）

## NOCTAへの関連メモ
現在NOCTAのスキルはすべて ~/.claude/commands/ に配置。楽曲プロジェクト固有スキル（/phase2-svp 等）をプロジェクトローカルに移す設計が可能になった。今後の2曲目以降で検討価値あり。
