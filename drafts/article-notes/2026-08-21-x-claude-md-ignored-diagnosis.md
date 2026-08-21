---
title: "@ClaudeCode_UT のツイート — CLAUDE.md の指示が無視される時の切り分け"
url: "https://x.com/ClaudeCode_UT/status/2089623351665078636"
date: "2026-08-21"
domain: "x.com"
tags: [best-practices, x, claude-code, source:xmcp]
---

## 要約

CLAUDE.md の指示が無視される場合、原因は「ファイルが壊れている」ことではなく、
大半は「読み込まれていない」か「別の場所が上書きしている」のどちらかだという指摘。
Claude Code 公式にコマンド単位の切り分け手順が載っており、`/context` がその起点になる。

## 主なポイント

- 症状（指示が効かない）から原因（未読込 / 上書き）へ切り分ける発想。ファイル内容の書き換えに走る前に確認する
- `/context` で実際に何が読み込まれているかを確認できる
- CLAUDE.md は階層構造（`~/.claude/CLAUDE.md` → プロジェクトルート → 子ディレクトリ）で上書きされうる

## NOCTAへの関連メモ

NOCTA は CLAUDE.md が4階層ある（グローバル `~/.claude/CLAUDE.md`・ルート `/NOCTA/CLAUDE.md`・
正本 `project_NOCTA/CLAUDE.md`・HP 用 `website/CLAUDE.md`）。上書き衝突が起きやすい構成なので、
ルールが効かないと感じたときは `/context` で読み込み状況を確認する手順が有効。
