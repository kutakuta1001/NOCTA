---
title: "Claude Codeリリースノート — /checkupは/doctorのエイリアス（v2.1.202）"
url: "https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md"
date: "2026-07-12"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Codeのv2.1.202で、既存の`/doctor`コマンドが`/checkup`という別名（エイリアス）でも呼べるようになり、フルセットアップ点検機能に拡張された。セクション別ステータスアイコンも追加されている。2026-07-12時点のX（Twitter）で複数言及されていた「新機能/checkup」の実在を公式CHANGELOGで確認できた。

## 主なポイント
- `/checkup`は新規コマンドではなく`/doctor`のエイリアス（v2.1.202〜）
- フルセットアップチェックアップへ機能拡張、セクション別ステータスアイコン追加
- v2.1.206では追加で「チェックイン済みCLAUDE.mdファイルの短縮を提案」する機能も統合された（別エントリ参照）

## NOCTAへの関連メモ
2026-07-12のベストプラクティスレビュー（xmcp経由・hideki_climaxのツイート）で「実在未確認」としていた`/checkup`の存在を確認できた。MCP/Skill整理運用（`/mcp`手動確認＋`disabledMcpServers`追加）の効率化に使える可能性がある。次回Claude Code起動時に`/checkup`（または`/doctor`）を試し、実際の出力内容を確認するとよい。
