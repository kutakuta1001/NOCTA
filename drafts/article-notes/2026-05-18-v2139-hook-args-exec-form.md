---
title: "v2.1.139: Hook args フィールドで exec form 実行対応"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-05-18"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約
Claude Code v2.1.139 で、Hook 設定の `args` フィールドを使った exec form（配列形式）でコマンドをシェル経由せずに実行できるようになった。`["command", "arg1", "arg2"]` 形式で指定するため、シェルインジェクションのリスクを排除した安全なコマンド実行が可能になる。

## 主なポイント
- `args: ["cmd", "arg1", "arg2"]` 形式で exec form 指定（シェル不経由）
- シェル経由コマンド（bash -c "..."形式）よりセキュアな実行方法
- Hook の `command` 文字列形式との併用可能（既存hookに影響なし）

## NOCTAへの関連メモ
現在のNOCTAのhooksはdenyリスト中心でcommand文字列形式。将来的に複雑な引数を持つフック（例: SVP生成完了トリガー）を追加する際は exec form を推奨形式として採用できる。
