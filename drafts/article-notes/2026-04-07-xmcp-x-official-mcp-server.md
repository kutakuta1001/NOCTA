---
title: "X公式MCPサーバー「xmcp」がリリース。Claude Codeと組み合わせるとX運用が「作業」から「指示」になる"
url: "https://x.com/MakeAI_CEO/status/2041363825631658448"
date: "2026-04-07"
domain: "x.com"
tags: [best-practices]
---

## 要約（3〜5行）

X（Twitter）公式開発チームが「xmcp」という MCP サーバーを GitHub に公開した。Claude Code の MCP として接続することで、X の投稿作成・検索・反応分析が Claude Code のセッション内で完結できる。セットアップは git clone → .env 設定 → Python サーバー起動の手順で、初回のみ OAuth 認証が必要。ただし投稿・いいね・リポスト機能も含まれるため、NOCTA の R-03「SNS自動投稿禁止」ルールとの整合性に注意が必要。

## 主なポイント

- **xmcp の概要**: X 公式開発チームが GitHub で公開した MCP サーバー。Claude Code から HTTP 経由で接続可能
- **対応ツール（設定可能）**: `searchPostsRecent`・`createPosts`・`getUsersMe`・`likePost`・`repostPost` 等
- **Claude Code との相性**: ターミナル内で X が動く。リサーチ→投稿→反応追跡が1セッションで完結
- **セットアップ**: git clone → `cp env.example .env` → X Developer Portal でアプリ作成・APIキー取得 → Python サーバー起動（ポート8976）
- **NOCTA での注意点**: `createPosts`・`likePost`・`repostPost` を有効にすると自動投稿が可能になりR-03に抵触する

## NOCTAへの関連メモ

**安全な活用範囲**: `X_API_TOOL_ALLOWLIST` を `searchPostsRecent,getUsersMe` のみに絞れば読み取り専用になり、`/phase1-trend` の X リアルタイム検索強化に使える（Grok API より公式で低コストの可能性）。**禁止**: `createPosts`・`likePost`・`repostPost` は NOCTA の R-03 に反するため ALLOWLIST から必ず除外する。`.mcp.json` に追加する場合は `disabledMcpjsonServers` でデフォルト無効化し、フェーズ1実行時のみ有効化する運用を推奨。
