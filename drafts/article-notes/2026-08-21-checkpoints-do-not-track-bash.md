---
title: "チェックポイントは Bash 経由の変更を追跡しない"
url: "https://code.claude.com/docs/ja/best-practices"
date: "2026-08-21"
domain: "code.claude.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

公式ベストプラクティスの警告として、チェックポイント（`/rewind`・`Esc` 2回）は
Claude が行った変更のみを追跡すると明記されている。
Bash コマンドまたは外部プロセスを通じて行われた変更はキャプチャされない。
「これは git の代替ではない」とも書かれている。

## 主なポイント

- Write / Edit ツール経由の変更は復元できるが、シェルスクリプトが書き出したファイルは復元できない
- チェックポイントはセッションをまたいで保持される（ターミナルを閉じても後で巻き戻せる）
- 危険な試行をチェックポイント前提で行う運用は、Bash 生成物には適用できない

## NOCTAへの関連メモ

NOCTA は MIDI・SVP を Bash 経由（Python スクリプト）で生成している。music-spec-writer と
svp-generator の tools には Bash が含まれる。これらの出力は `/rewind` で戻せないため、
生成物の保護は git（`outputs/` のコミット）に依存する必要がある。R-15 の中間ファイル保存が実質のバックアップ。
