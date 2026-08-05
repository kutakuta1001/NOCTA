---
title: "@kodagen のツイート — CLAUDE.md・Skills・Subagents・hooks・MCP を全部シンプル化したらトークン消費が体感半減"
url: "https://x.com/kodagen/status/2083817728494964795"
date: "2026-08-05"
domain: "x.com"
tags: [best-practices, claude-code, source:xmcp]
---

## 要約（3〜5行）
CLAUDE.md・Skills・Subagents・hooks・MCP をすべてシンプル化したところ、Fable 5 のトークン消費量が体感で半分程度になったという実測報告。「Claude Code の場合、モデルが変わるたびにまっさらな状態からやったほうが良さそう」と結論している。いいね7・ブックマーク15。

## 主なポイント
- 対象は CLAUDE.md 単体ではなく、Skills / Subagents / hooks / MCP を含む設定資産の全体
- 効果はトークン消費が体感で約半減（Fable 5 で計測）
- モデル世代が変わったらゼロベースで作り直す方が良いという示唆
- Boris Cherny（Claude Code 開発者）の「6ヶ月ごとに CLAUDE.md・skills・hooks を削除してモデルの素の挙動を見よ」という発言と同趣旨

## NOCTAへの関連メモ
NOCTA はまさに逆方向に積み上げてきた（CLAUDE.md 4ファイル973行・スキル60本超・エージェント11・MCP 2種）。しかも Sonnet 4.6 → Sonnet 5、Opus 4.8 → Opus 5 と2世代のモデル交代を経ているのに、設定資産はゼロベース化していない。Fable 5 は Opus 4.7 トークナイザで同一テキストが約30%多いトークンになるため、この報告の効果はNOCTAでは更に大きく出る可能性がある。公式ベストプラクティスの「削除基準」と合わせて、スリム化の実測根拠として使える。
