---
title: "モデル一覧 — Haiku 4.5は拡張思考（Extended Thinking）対応あり"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-05-12"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
公式モデル一覧によると、Claude Haiku 4.5は拡張思考（Extended Thinking）をサポートしている。
Haiku 4.5はコンテキスト200k tokens・最大出力64k tokensで、適応的思考（Adaptive Thinking）は非対応。
R-09ではHaikuを「調査・短いファイル生成・handoff更新」に推奨しているが、追加情報として記録。

## 主なポイント
- Haiku 4.5: 拡張思考 = あり / 適応的思考 = なし
- Sonnet 4.6: 拡張思考 = あり / 適応的思考 = あり
- Opus 4.7: 拡張思考 = なし / 適応的思考 = あり
- Haiku 4.5の廃止予定はなし（現行最新モデル）
- Haiku 3: 2026年4月19日に廃止済み（NOCTAは使用していないため影響なし）

## NOCTAへの関連メモ
NOCTAはHaiku 4.5をシンプルタスクに使う方針（R-09）。拡張思考対応は知識として持っておくとよい。調査エージェント（trend-analyst）で複雑なトレンド分析をする際の選択肢が増える可能性がある。R-09のHaiku記述に「拡張思考対応あり」を追加してもよい。
