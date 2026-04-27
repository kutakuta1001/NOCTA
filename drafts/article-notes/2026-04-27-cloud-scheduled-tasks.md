---
title: "Claude Code — クラウドスケジュール済みタスク（PCオフでも継続）"
url: "[docs.anthropic.com] Claude Code overview"
date: "2026-04-27"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code にクラウドスケジュール済みタスク機能が追加された。
Anthropic管理インフラ上で実行されるため、ローカルPCの電源をオフにしていてもタスクが継続実行される。
デスクトップスケジュール済みタスク（ローカル実行）との使い分けが可能で、長時間エージェント作業の新しい選択肢となる。

## 主なポイント
- Anthropic管理インフラ上で実行 → PCオフ・スリープ中でも継続
- デスクトップ版（ローカル実行）と2種類が存在し目的で使い分けられる
- `/loop` コマンドとの組み合わせで定期繰り返し実行も設計可能

## NOCTAへの関連メモ
夜間の長時間タスク（大型SVP生成・/best-practices-review の大量処理・クローリングなど）をPCオフで実行できる。セッション運用表への追記候補。
