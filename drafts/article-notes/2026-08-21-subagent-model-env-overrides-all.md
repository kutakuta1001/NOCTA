---
title: "CLAUDE_CODE_SUBAGENT_MODEL はセッションとスクリプト両方のモデル指定を上書きする"
url: "https://code.claude.com/docs/ja/workflows"
date: "2026-08-21"
domain: "code.claude.com"
tags: [best-practices, claude-code, cost, source:manual]
---

## 要約

動的ワークフローのドキュメントによると、ワークフロー内のすべてのエージェントは
スクリプトがステージを別のモデルにルーティングしない限りセッションのモデルを使う。
ただし `CLAUDE_CODE_SUBAGENT_MODEL` 環境変数が設定されている場合、これが両方を上書きする。

## 主なポイント

- 優先順位は「環境変数 > スクリプトのモデル指定 > セッションのモデル」
- 環境変数が設定されていると、スクリプト側で「この段だけ Opus」と書いても効かない
- コスト制御の手段としては強力だが、意図した割当を無言で壊す危険もある

## NOCTAへの関連メモ

R-09 と AGENTS セクションは「批評系（lyric-critic / concept-critic）と svp-generator は Opus 5、
explorer 系（analytics-agent）は Haiku、他は Sonnet 5」と割当を定めている。
`CLAUDE_CODE_SUBAGENT_MODEL` が設定されていると、この割当がすべて無効になる。
現在の `~/.claude/settings.json` にこの変数が入っていないかの確認が必要。
