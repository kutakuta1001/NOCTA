---
title: "[changelog v2.1.218] /code-review・context:fork スキルがバックグラウンド実行に"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-07-29"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
v2.1.218 で /code-review がバックグラウンドサブエージェントとして実行されるようになり、レビュー作業が会話コンテキストを埋めなくなった。context:fork 指定のスキルもデフォルトでバックグラウンド実行に変わった（background: false でオプトアウト可）。/deep-research は手動起動のみになった。

## 主なポイント
- /code-review 中もメイン会話を続けられる（コンテキスト節約）
- context:fork スキルは background: false を書かない限りバックグラウンドで走る
- /deep-research の自動起動が廃止（Claude が勝手に起動しない）

## NOCTAへの関連メモ
将来 context:fork を使うエージェントスキルを設計する際（CLAUDE.md に活用検討の記載あり）、同期実行が必要なら background: false の明示が必要になる点に注意。
