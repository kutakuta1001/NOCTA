---
title: "[changelog v2.1.153] /model でモデル選択をデフォルト保存"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-05-28"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.153 で `/model` コマンドにデフォルト保存機能が追加された。
モデルを選択してデフォルト保存すると次回セッションから自動的にそのモデルが使われる。
`s` キーで現セッションのみ一時切り替えができる（保存なし）。

## 主なポイント
- `/model` でモデル選択後に保存を選ぶと、以降のセッションでそのモデルがデフォルトになる
- `s` キーは現セッション限りの切り替え（保存しない）
- R-09 のモデル使い分け（Opus/Sonnet/Haiku）を設定ファイルに書かなくてもインタラクティブに設定できる

## NOCTAへの関連メモ
重要フェーズ（SVP生成・PVコンセプトレビュー）では Opus 4.7 をデフォルトに保存し、通常の開発作業では Sonnet 4.6 に戻す運用が `/model` だけで完結するようになった。
