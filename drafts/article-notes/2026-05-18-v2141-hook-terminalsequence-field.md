---
title: "v2.1.141: Hook 出力 terminalSequence フィールド追加"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-05-18"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約
Claude Code v2.1.141 で Hook の出力 JSON に `terminalSequence` フィールドが追加された。このフィールドを使うと、デスクトップ通知・ウィンドウタイトル変更・ベル音生成をフックから制御できる。同 v2.1.143 で Stop hook が8回連続ブロックされると警告を出して turn を終了するセーフガードも追加された。

## 主なポイント
- Hook 出力 JSON に `terminalSequence` フィールドを追加するとデスクトップ通知生成が可能（v2.1.141）
- ウィンドウタイトルの変更・ベル音生成も対応
- Stop hook 8回連続ブロック → 警告 + turn 強制終了（v2.1.143 のセーフガード）

## NOCTAへの関連メモ
SVP生成・MIDI生成等の長時間バックグラウンド処理の完了をmacOSデスクトップ通知で受け取れる。現在のNOCTA hooksはdenyリストのみのため、フェーズ2完了通知hookとして将来追加候補。
