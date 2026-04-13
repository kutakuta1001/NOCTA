---
title: "Homebrew: claude-code（安定版）と claude-code@latest（最新版）の 2 cask"
url: "https://docs.anthropic.com/ja/docs/claude-code/overview"
date: "2026-04-13"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Homebrew で Claude Code をインストールする場合、2つの cask から選択できる。
`claude-code` は安定版（stable release）で、約1週間遅れのリリースを追従する（重大な問題のあるバージョンをスキップ）。
`claude-code@latest` は最新版（latest channel）で、リリース即日に更新される。
どちらも自動更新はなく、手動で `brew upgrade claude-code` または `brew upgrade claude-code@latest` が必要。

## 主なポイント
- `claude-code`: 安定版・約1週間遅れ・重大バグ入りバージョンをスキップ
- `claude-code@latest`: 最新版・リリース即日・最新機能をすぐ使える
- 自動更新なし: どちらも手動 `brew upgrade` が必要
- ネイティブインストール（curl スクリプト）は自動バックグラウンド更新あり

## NOCTAへの関連メモ
NOCTA が Homebrew で Claude Code を管理している場合は定期的な手動 upgrade が必要。最新機能（/agents タブ・CJK 修正など）をすぐ使いたい場合は `claude-code@latest` が適切。安定性重視なら `claude-code` で問題ない。
