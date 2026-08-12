---
title: "@connect24h のツイート — Agent Plugins 1.0.0 の本質は配布の標準化（Skill＝能力 / MCP＝Tool接続 / Plugin＝配布単位）"
url: "https://x.com/connect24h/status/2087157600513356221"
date: "2026-08-12"
domain: "x.com"
tags: [best-practices, claude-code, source:xmcp]
---

## 要約（3〜5行）
Agent Skills の次に来たのは「配布の標準化」だという指摘。Agent Plugins 1.0.0 の本質は新しい Skill 規格ではなく、既存の Agent Skills と MCP を「どの AI エージェントにも配れる箱」にしたことだとする。整理すると Skill＝能力、MCP＝Tool 接続、Plugin＝配布単位。いいね31・ブックマーク17。

## 主なポイント
- Plugin は新規格ではなく既存の Skills + MCP をまとめた配布単位
- 3層の役割分担: Skill（能力）/ MCP（Tool 接続）/ Plugin（配布）
- 「どの AI エージェントにも配れる」= ベンダー間の可搬性が主眼
- 同週に「grok-build も Claude Code の資産（CLAUDE.md・skills・MCP・agents・hooks）をそのまま読む」という報告もあり、可搬性の流れは実際に進んでいる

## NOCTAへの関連メモ
NOCTA は51本のスキルと25のエージェント定義を `~/.claude/` に直置きし、版管理コピーを `claude-config/` に持つ独自運用をしている。Plugin 形式にすれば配布可能になるが、NOCTA はスタッフゼロで配布先がないため直接の利点は薄い。ただし「Skill＝能力 / MCP＝Tool接続 / Plugin＝配布単位」という整理は、正本のスキル設計節（CLAUDE.md には常時適用ルールのみ・状況限定はスキル・参照情報は references）と同じ思想の延長線上にあり、層の切り分けを説明する語彙として使える。
