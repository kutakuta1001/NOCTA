---
title: "@N_Taisho — AIエージェント普及ボトルネックはCLAUDE.md・Skills・MCP・AGENTS.mdの理解"
url: "https://x.com/N_Taisho/status/2047844741690360204"
date: "2026-04-25"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
AIエージェント（Claude Code等）の普及を妨げるのは「企業内での安全な配布・設定・運用」の難しさ。CLAUDE.md・Skills・MCP・subagents・**AGENTS.md**・hooks・ローカル環境・Git・CLIなど多くの概念理解が必要で、非エンジニアへの展開が困難。

## 主なポイント
- 普及ボトルネック: セットアップの複雑さ・概念の多さ
- 必要な理解要素: CLAUDE.md / Skills / MCP / subagents / **AGENTS.md** / hooks / Git / CLI
- AGENTS.md: CLAUDE.mdと並ぶエージェント設定ファイル（異なるフレームワークで使用）
- エンタープライズでの展開が最大の課題

## NOCTAへの関連メモ
NOCTAはこれらの要素をすべて体系化済みで、「普及ボトルネック」を個人レベルで突破した事例。AGENTS.mdはOpenAI Agents SDK等で使われるファイル名で、NOCTAのCLAUDE.md AGENTS セクションと類似概念。現在NOCTAはCLAUDE.mdに統合しているがAGENTS.mdを別ファイル化するパターンも参考になる。
