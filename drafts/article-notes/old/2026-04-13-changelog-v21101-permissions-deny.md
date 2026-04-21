---
title: "v2.1.101: permissions.deny が PreToolUse フック ask 決定を上書きするバグ修正"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-04-13"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.101 で、`permissions.deny` ルールが hooks の PreToolUse フックで
`ask`（ユーザーに確認）を返した決定を上書きしてしまうバグが修正された。
このバグが存在した間、hooks で `ask` を設定していても `deny` ルールが優先されて
ユーザーへの確認なしに操作がブロックされていた可能性がある。

## 主なポイント
- 影響バージョン: v2.1.101 以前（修正済み）
- 症状: hooks の PreToolUse で `ask` を返しても `permissions.deny` に上書きされた
- 修正: `ask` 決定が正しく優先されるようになった
- 関連: settings.json の `permissions.deny` と hooks の併用設定

## NOCTAへの関連メモ
NOCTA が hooks と permissions.deny を併用している場合は、v2.1.101 以降に更新後に動作確認を推奨。現在の hooks 設定が意図通りに動作しているか確認する機会として活用できる。
