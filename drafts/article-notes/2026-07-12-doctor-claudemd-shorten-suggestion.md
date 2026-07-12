---
title: "Claude Codeリリースノート — /doctorがチェックイン済みCLAUDE.mdの短縮を提案（v2.1.206）"
url: "https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md"
date: "2026-07-12"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Codeのv2.1.206で、`/doctor`コマンド（`/checkup`エイリアス含む）が、リポジトリにチェックインされたCLAUDE.mdファイルが長すぎる場合に短縮を提案する機能を追加した。ディレクトリ補完（`/cd`）やMCP認証強化と同時期のリリース。

## 主なポイント
- `/doctor`/`/checkup`実行時、チェックイン済みCLAUDE.mdの短縮提案が表示されるようになった
- 提案は自動適用ではなく、あくまで提案（ユーザー判断が必要）
- 同バージョンで`/cd`のディレクトリパス補完・MCP OAuth再認証強化も同時実装

## NOCTAへの関連メモ
NOCTAの`/NOCTA/CLAUDE.md`・`project_NOCTA/CLAUDE.md`は意図的に詳細なルール群（R-01〜R-15・AGENTS・APPROVAL GATES等）を保持する方針で、2026-07-04のベストプラクティスレビューで「60行目安論」を既に検討・不採用としている。今後`/checkup`や`/doctor`を実行した際にCLAUDE.md短縮の提案が出た場合も、この既存方針に基づき提案を採用しない判断で問題ない（提案自体は自動適用されないため実害はない）。
