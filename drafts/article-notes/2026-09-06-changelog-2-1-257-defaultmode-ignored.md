---
title: "Claude Code CHANGELOG v2.1.257 — プロジェクト設定の defaultMode: bypassPermissions が無視される"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-06"
domain: "github.com"
tags: [best-practices, claude-code, changelog, security, source:manual]
---

## 要約（3〜5行）
`.claude/settings.json` および `.claude/settings.local.json` に書いた `defaultMode: "bypassPermissions"` が
無視されるようになった（既に無視されていた `"auto"` と同じ扱い）。
有効にするには user settings（`~/.claude/settings.json`）か managed settings に置くか、`--permission-mode` で渡す。
リポジトリにチェックインされた設定ファイルで権限モードを緩められる経路を塞ぐ変更と読める。

## 主なポイント
- 対象は `.claude/settings.json` と `.claude/settings.local.json`（プロジェクト側の2ファイル）
- user settings と managed settings は引き続き有効
- `--permission-mode` フラグでの指定も有効
- 同系統の変更として v2.1.257 で auto mode に「作業ディレクトリ外の初回ファイル読み取り前の一度だけの確認」が入った

## NOCTAへの関連メモ
NOCTA は `~/.claude/settings.json`（user settings）23行目に `defaultMode: "bypassPermissions"` を置いているため
影響を受けない（2026-09-06 に実機確認済み）。プロジェクト側の2ファイルには `defaultMode` の記述がない。
メモリ「dontAsk モードはファイル操作をブロックする」に関連する前提の1つが変わったため、記録を残す価値がある。
