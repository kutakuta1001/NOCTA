---
title: "Claude Code v2.1.119 — prUrlTemplate 設定・GitLab/GitHub Enterprise対応"
url: "[docs.anthropic.com] リリースノート v2.1.119"
date: "2026-04-27"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.119 で prUrlTemplate 設定が追加。
settings.json に記述するとカスタムコードレビューURLを指定できる。
--from-pr オプションが GitLab・Bitbucket・GitHub Enterprise の PR URLに対応した。
また /config の設定（テーマ・エディタモード等）が settings.json に永続化されるようになった。

## 主なポイント
- `settings.json` の `prUrlTemplate` でカスタムコードレビューURLを設定可能
- `--from-pr` が GitLab / Bitbucket / GitHub Enterprise PR URLに対応
- `/config` の設定（テーマ・Vimモード等）が再起動後も永続化

## NOCTAへの関連メモ
NOCTAは現在 GitHub Pages / GitHub のみ使用のため prUrlTemplate の直接的な恩恵は薄い。/config 永続化はテーマ設定等で日常的に便利。
