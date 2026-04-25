---
title: "@G1st_oritaka — Claude Codeが「バカになった」と感じたら3点を疑う"
url: "https://x.com/G1st_oritaka/status/2047243618013135342"
date: "2026-04-25"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Codeのパフォーマンス低下を感じたときの診断チェックリスト3点。1）セッション肥大化→タスク分割・リセット、2）必要情報を都度貼り付ける代わりにMCPサーバーで外部記憶化、3）常識が共有されていない→CLAUDE.mdに規約を書く。「モデルのせいではなく運用設計の問題」という診断視点。

## 主なポイント
- パフォーマンス低下の原因は常にモデルではなく運用設計
- セッション肥大化: /clear・/compact・タスク分割で解消
- 必要情報の再入力コスト: MCPサーバーで外部記憶化して省力化
- 前提知識の共有不足: CLAUDE.mdに規約として明文化

## NOCTAへの関連メモ
NOCTAではR-05（最小限読込）・セッション運用テーブル（/clear・/compact）・CLAUDE.mdルール体系でこれらを既に対策済み。「MCPサーバーで外部記憶化」はhandoff.md管理の延長として将来的にMemory MCP（メモリ永続化MCPサーバー）を導入する際の参考になる。
