---
title: "@hideki_climax のツイート — Claude Codeの新機能「/checkup」コマンド"
url: "https://x.com/hideki_climax/status/2075115396571840900"
date: "2026-07-12"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Codeに追加された新コマンド「/checkup」の紹介。使っていないSkills/MCP/プラグインの整理、ローカルCLAUDE.mdの見直しなど、環境整理を1コマンドで実行してくれるという内容。

## 主なポイント
- 使っていないSkills/MCP/プラグインを整理し、コンテキストを節約
- ローカルのCLAUDE.mdを整理・分割対象として検出（他ツイートの補足情報では巨大CLAUDE.mdの分割＋スキル化、遅いhooksのオフ、拒否されがちな読取の事前承認も実施）
- 変更は実行前にすべて確認できる

## NOCTAへの関連メモ
NOCTAはMCP管理（ツール総数80以下維持）を手動で`/mcp`確認・`disabledMcpServers`追加で運用している（R-MCP管理節）。`/checkup`が実際に存在し安全に動作するなら、この手動チェックを代替・補助できる可能性がある。次回のClaude Codeバージョン確認時（[[project_model_opus47]]と同様の定期確認）に実在と挙動を検証すべき候補。
