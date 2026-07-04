---
title: "CLAUDE.md 1枚構成の限界と層で分ける構成"
url: "https://x.com/AI_Caffeine/status/2071503686636024227"
date: "2026-07-04"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Code をCLAUDE.md 1枚だけの構成で運用すると早期に限界が来ると指摘。保守可能な構成は複数の層に分けることが多いとする（CLAUDE.md=全体context+基本ルール／settings.json=権限・モデル・hooks設定／rules/=主題別詳細）。impression 12.5k・like 176・bookmark 260と高評価。

## 主なポイント
- CLAUDE.md：プロジェクト全体のcontextと基本ルールのみ
- settings.json：権限・モデル・hooks設定を分離
- rules/：主題別の詳細ルールを分離

## NOCTAへの関連メモ
NOCTAは既にCLAUDE.md（常時ルールのみ）とスキル（状況限定ワークフロー）を分離する設計原則を採用済み（R-05設計原則）。settings.jsonでの権限/hooks分離は現状未整理の可能性があるため、次回整理時に確認候補。
