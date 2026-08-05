---
title: "[changelog v2.1.222] /usage が MCP サーバーへの使用量を過大計上していた問題を修正"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-05"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.222 で `/usage` の集計が修正された。従来はある MCP サーバーを一度呼び出すと、それ以降のすべてのターンがそのサーバーの使用量として計上されていた。修正後は、実際にそのサーバーのツール結果を消費したリクエストのみが計上される。

## 主なポイント
- 修正前: MCP サーバーを1回呼ぶと以降の全ターンがそのサーバーに帰属していた
- 修正後: ツール結果を実際に消費したリクエストのみ計上
- `/usage` は v2.1.149 でスキル・サブエージェント・MCP 別のコスト内訳を表示するようになっている

## NOCTAへの関連メモ
CLAUDE.md は `/usage` の MCP 別コスト内訳をコスト確認手段として挙げている。修正前の数値で「この MCP は重いから無効化する」という判断をしていた場合、前提が水増しされていたことになる。MCP ツール総数80以下維持の運用judgment を、修正後の数値で再確認する価値がある（特に xmcp・voicevox）。
