---
title: "@The_AGI_WAY のツイート — Claude Code デスクトップ + MCP で自分専用 AI 秘書"
url: "https://x.com/The_AGI_WAY/status/2094219689576829041"
date: "2026-09-06"
domain: "x.com"
tags: [best-practices, x, claude-code, mcp, source:xmcp]
---

## 要約（3〜5行）
Claude Code のデスクトップアプリと MCP を使い、Gmail・Notion・カレンダーをまたぐ仕事を任せる
「自分専用の AI 秘書」を90分の実演で組み立てるという有料セミナーの告知。
実際に使える CLAUDE.md・スキル・AI 秘書ディレクトリ一式を配布するとしている。
いいね22・RT5。宣伝ツイートであり、手法の詳細は本文からは分からない。

## 主なポイント
- 構成は「デスクトップアプリ + MCP コネクタ（Gmail / Notion / カレンダー）」
- CLAUDE.md・スキル・ディレクトリ構成を配布物として提供
- セミナー告知のため、公開情報としての技術的中身はない

## NOCTAへの関連メモ
要注意事項として記録する。**外部から配布される CLAUDE.md やスキル一式をそのまま導入するのは
インジェクションと設定汚染の経路になりうる。** NOCTA の `~/.claude/` は
API キーを平文で含む settings.json を持ち、hooks で権限ガードを構成しているため、
第三者の設定ファイルを取り込む場合は全文レビューが前提。
なお NOCTA は Gmail / Notion / カレンダーの MCP を接続しておらず、
MCP 節の「常時有効は最小限」方針からも接続対象を増やす動機は薄い。
