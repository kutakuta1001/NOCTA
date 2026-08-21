---
title: "Dynamic workflow size 設定でワークフロー規模を既定制限する"
url: "https://code.claude.com/docs/ja/workflows"
date: "2026-08-21"
domain: "code.claude.com"
tags: [best-practices, claude-code, cost, source:manual]
---

## 要約

`/config` の Dynamic workflow size 設定で、Claude が作成するワークフローの規模を既定で抑えられる。
値は `unrestricted`（既定・ガイドラインなし）、`small`（5未満）、`medium`（15未満）、`large`（50未満）。
Claude Code はこれを助言として Claude に送るため、異なる規模を要求するプロンプトが優先される。
Claude Code v2.1.202 以降が必要。

## 主なポイント

- 設定値を入れると、「25エージェント超で Large workflow 警告」の閾値がガイドラインのエージェント数に置き換わる
- ランタイムの上限（同時16エージェント・1実行あたり合計1,000エージェント）は設定に関係なく適用される
- ultracode がオンのセッションは警告を表示しない（既に大規模実行にオプトインしているため）

## NOCTAへの関連メモ

COST POLICY は「動的ワークフローは CEO が明示的に要求した場合にのみ使う」と定めているが、
規模の制限は設けていない。`medium`（15未満）を設定しておけば、要求時でも消費が跳ねにくい。
`ultracode` を既定では使わない方針（R-09）と組み合わせると二重の抑制になる。
