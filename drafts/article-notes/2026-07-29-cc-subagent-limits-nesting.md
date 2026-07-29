---
title: "[changelog v2.1.217/219] サブエージェント同時実行上限20・ネスト生成デフォルト深さ3"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-07-29"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
v2.1.217 でサブエージェントの同時実行上限がデフォルト20になり（CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS で変更可）、ネスト生成が一旦デフォルト無効化された。v2.1.219 でネストはデフォルト深さ3に再設定された（v2.1.172 時点の5階層から変更）。

## 主なポイント
- 同時実行20が上限（1メッセージから無制限にファンアウトしない安全弁）
- ネスト深さはデフォルト3（CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1 で無効化可）
- --max-budget-usd がバックグラウンドサブエージェントにも効くようになった（v2.1.217 修正）

## NOCTAへの関連メモ
Agent Teams（/phase2-music・/phase4-release）は数エージェント規模のため実害なし。CLAUDE.md の「サブエージェント最大5階層（v2.1.172）」記載は古くなったので次回更新時に深さ3へ修正候補。
