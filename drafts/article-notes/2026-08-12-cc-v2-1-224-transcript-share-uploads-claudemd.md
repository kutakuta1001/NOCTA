---
title: "[changelog v2.1.224] トランスクリプト共有が system prompt（CLAUDE.md 含む）も送信するように変更"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-12"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.224 で、フィードバック調査のトランスクリプト共有の内容が拡張された。同意した場合、直近リクエストのモデル設定も一緒にアップロードされる。具体的には system prompt（**CLAUDE.md の指示を含む**）・ツール定義・モデルパラメータ。シークレットは従来どおり編集（redact）され、共有サイズが大きすぎる場合はこれらのフィールドが最初に落とされる。

## 主なポイント
- 対象は system prompt（CLAUDE.md の指示を含む）・ツール定義・モデルパラメータ
- 送信は同意時のみ。シークレットは redact される
- サイズ超過時はこれらのフィールドが優先的に削られる
- v2.1.224 では長いセッションでトランスクリプト共有が静かに失敗する問題も修正された

## NOCTAへの関連メモ
CEO が不具合報告でトランスクリプトを共有すると、NOCTA の CLAUDE.md の内容が Anthropic に送信される。現在の正本（251行）には制作ルール・承認ゲート・git 運用が含まれるが、APIキー等のシークレットは含まれない（キーは `~/.claude/settings.json` の env にあり、system prompt には入らない）。実害は小さいが、`~/.claude/settings.json` が平文キーを持つという既知の状態と合わせて、「何が外部に出るか」の把握として記録に値する。
