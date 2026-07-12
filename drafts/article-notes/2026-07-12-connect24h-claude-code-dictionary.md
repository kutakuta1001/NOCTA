---
title: "@connect24h のツイート — Claude Code機能の「逆引き辞典」という発想"
url: "https://x.com/connect24h/status/2075619153369850200"
date: "2026-07-12"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Codeの機能が多すぎて覚えられない問題に対し、「公式ドキュメントを書き直す」のではなく「○○したい→使う機能」という逆引き辞典形式にまとめたという発想を紹介するツイート。Hook/Skill/MCP/Slash Command/Sub Agentの使い分けが分かりにくいという課題を前提にしている。

## 主なポイント
- 機能一覧ではなく「したいこと」起点で機能を逆引きする設計
- Hook・Skill・MCP・Slash Command・Sub Agentの使い分けが最大の混乱点として挙げられている
- 公式ドキュメントの再構成ではなく別レイヤーの索引を作るアプローチ

## NOCTAへの関連メモ
NOCTAのCLAUDE.mdは「スキル設計原則」でスキルとルールを分離済みだが、「Hook/Skill/MCP/Sub Agent/Slash Commandをどう使い分けるか」の逆引き索引は存在しない。CLAUDE.mdやCODEMAPが肥大化した際、この逆引き形式のインデックスを`~/.claude/references/`に追加する案は検討に値する（低優先度）。
