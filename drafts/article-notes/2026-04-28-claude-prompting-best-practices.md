---
title: "Prompting best practices — Claude Opus 4.7 対応版"
url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices"
date: "2026-04-28"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Anthropic 公式のプロンプトエンジニアリングガイド（Opus 4.7 対応版）。
effort レベルの使い方、サブエージェント制御、デザインデフォルト回避、コードレビュー harness 調整など Opus 4.7 特有の挙動を網羅。
初回プロンプトに目的・制約・完了条件を一括して渡す推奨パターンは NOCTA の R-13 と一致。

## 主なポイント
- **effort xhigh**: コーディング・エージェント系ユースケースに最適（max は一部タスクで過剰思考のリスク）
- **Opus 4.7 の literal 性**: プロンプトをより字義通りに解釈。スコープを明示しないと一般化してくれない
- **サブエージェント生成**: デフォルトで少なめ → 明示的に「並列でサブエージェントを生成して」と指示が必要
- **デザインデフォルト**: クリーム背景/セリフ体/テラコッタアクセントが自動適用される → 別デザインには具体的な代替案を明示
- **interactive coding**: 複数ターンで使うと token 増加 → `xhigh`/auto mode + 初回に全制約を渡すことで効率最大化

## NOCTAへの関連メモ
R-09 の `/effort xhigh` は現在「最重要レビュー時のみ」だが、公式はコーディング・エージェント全般に推奨。SVP生成・HP作業・Agent Teams起動時にも xhigh を使う方針への拡張を検討。Opus 4.7 のデザインデフォルトはNuWordのクリーム/ミニマル路線と偶然一致しており、Claude Design との相性が良い。
