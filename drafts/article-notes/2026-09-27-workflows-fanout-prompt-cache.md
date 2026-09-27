---
title: "Claude Code 動的ワークフロー — ファンアウトのプロンプトキャッシュ共有と TTL 設定"
url: "https://code.claude.com/docs/ja/workflows"
date: "2026-09-27"
domain: "code.claude.com"
tags: [best-practices, claude-code, workflows, cost, source:manual]
---

## 要約（3〜5行）
同じ実行内のエージェントは互いのプロンプトキャッシュを読める。同じモデル・effort・エージェントタイプ・ツール・出力スキーマ・作業ディレクトリで
動く2エージェントは同じプレフィックスを構築するため、先頭エージェントの応答開始後に始まるエージェントは初回リクエストでキャッシュを読む。
ワークフローエージェントはメイン会話の TTL バケット外で既定5分。`subagentPromptCacheTtl: 1h` で1時間に延ばせる（書込は割高）。

## 主なポイント
- ファンアウトで複数の同構成エージェントを同時に始めると、先頭以外を保留し、先頭の応答開始後にまとめて解放する
- 保留の上限は `CLAUDE_CODE_WORKFLOW_PREFIX_STAGGER_MS`（既定5000ms・0で無効）
- スクリプトが `agent()` に渡すプロンプトは、auto mode の分類器では「ユーザーの依頼」と数えない
- `schema` 付き `agent()` は矛盾するスキーマを起動前に弾く。出力検証は5回失敗で例外、`MAX_STRUCTURED_OUTPUT_RETRIES` で変更

## NOCTAへの関連メモ
Agent Teams で4エージェントを並列に走らせる `/phase4-release` では、モデル・ツールが揃っていれば先頭エージェントのキャッシュを他3体が読む。
エージェントごとにモデルを変える R-09 の割当（Haiku / Sonnet / Opus 混在）はキャッシュ共有を分断するため、コストとの兼ね合いで割当を揃える判断もある。
