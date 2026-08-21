---
title: "Claude Code v2.1.236 — ANTHROPIC_DEFAULT_MODEL 環境変数の追加"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-21"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

v2.1.236 で `ANTHROPIC_DEFAULT_MODEL` 環境変数が追加された。
新しいセッションが開始するモデルを指定できる。
既存の `ANTHROPIC_MODEL` との違いは、`/model` での選択が優先され、その選択が再起動をまたいで保持される点。

## 主なポイント

- `ANTHROPIC_MODEL` はモデルを固定するため `/model` の選択を上書きしてしまう。`ANTHROPIC_DEFAULT_MODEL` は「初期値」だけを決める
- セッション開始時のモデルを Sonnet 5 に固定しつつ、必要な場面で Opus 5 に切り替えて維持する運用ができる
- 設定場所は `~/.claude/settings.json` の `env` セクション

## NOCTAへの関連メモ

R-09 は「起案は Sonnet 5、批評は Opus 5」と定めているが、セッション開始時のモデルは手動選択に依存している。
`ANTHROPIC_DEFAULT_MODEL=claude-sonnet-5` を設定すれば、既定を起案モデルに寄せつつ、
Opus 5 への切替通知ルール（superpowers スキル使用前・歌詞レビュー等）を明示的な操作として残せる。
