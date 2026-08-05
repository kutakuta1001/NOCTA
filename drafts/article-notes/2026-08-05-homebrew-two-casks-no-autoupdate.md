---
title: "[code.claude.com] 概要 — Homebrew は2 cask 構成（stable は約1週遅れ）・いずれも自動更新なし"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-08-05"
domain: "code.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code の Homebrew 配布は2つの cask に分かれている。`claude-code` は stable チャネルを追い、通常およそ1週間遅れで、重大なリグレッションを含むリリースはスキップする。`claude-code@latest` は latest チャネルで、リリース直後に新バージョンが降りてくる。**Homebrew 版はどちらも自動更新されない**（`brew upgrade` が必要）。一方ネイティブインストール（`install.sh` 等）はバックグラウンドで自動更新される。

## 主なポイント
- `claude-code`（stable・約1週遅れ・重大リグレッションをスキップ）
- `claude-code@latest`（latest・即時）
- Homebrew 版は自動更新なし。`brew upgrade claude-code` または `brew upgrade claude-code@latest`
- WinGet も自動更新なし。ネイティブインストールのみ自動更新
- Linux は apt / dnf / apk でもインストール可

## NOCTAへの関連メモ
今回のレビューで、v2.1.221 の zsh 権限チェック回避脆弱性修正と v2.1.222 の worktree 破壊的 git 修正という**セキュリティ修正2件**が見つかった。Homebrew 経由で導入している場合は自動更新されないため、これらが未適用のまま動いている可能性がある。導入方式の確認と、stable チャネル（約1週遅れ）を使っている場合の遅延リスクの認識が必要。
