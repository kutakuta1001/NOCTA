---
title: "@MindTheGapMTG — モデルでなくオーケストレーション層がlock-in"
url: "https://x.com/MindTheGapMTG/status/2047008822057701713"
date: "2026-04-25"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
「12個のClaude Codeエージェントを本番で毎日動かしているが、lock-inはモデルではない。CLAUDE.md・hooks・subagent configsのオーケストレーション層がlock-in。それさえ正しく作れば、モデル変更は半日の作業で済む。真のlock-inはIDEのワークフロー前提だ。」
モデルへの依存ではなく、ワークフロー設計の質が長期的資産になるという観点。

## 主なポイント
- モデルはコモディティ化していく（Anthropic→OpenAI→Google等への切り替えが容易になる）
- 真の資産: CLAUDE.md + hooks + subagent configs = オーケストレーション層
- NOCTAのCLAUDE.md・Skills・Agent Teamsはすでに「資産」として機能している

## NOCTAへの関連メモ
NOCTAのアーキテクチャ設計（CLAUDE.md・スキル体系・Agent Teams・xmcp連携）は将来モデルが変わっても引き継げる資産。R-09でOpus/Sonnet/Haikuを使い分けているが、これらのモデルIDが変更になってもオーケストレーション層（CLAUDE.md・スキル）は変更不要でモデルIDのみ更新すればよい。現在の設計方針の正当性が確認された。
