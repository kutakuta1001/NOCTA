---
title: "Anthropic モデル一覧アップデート（Fable 5 / Mythos 5 / Opus 4.8 effort）"
url: "https://platform.claude.com/docs/en/docs/about-claude/models"
date: "2026-06-15"
domain: "platform.claude.com"
tags: [best-practices, anthropic-docs, models, source:manual]
---

## 要約（3〜5行）
公式モデル一覧の更新点をまとめたメモ。新たに Claude Fable 5（widely released 最上位）と Claude Mythos 5（Project Glasswing 限定）が登場。Opus 4.8 の effort パラメータは全サーフェスでデフォルト high。
（CEO確認: Fable 5 は現在利用不可のため、今回はモデル棲み分け再議論をスキップ。記録のみ）

## 主なポイント
- Claude Fable 5（`claude-fable-5`）: 2026-06-09 GA・1M tokens・最大出力128k・$10/$50/MTok・適応的思考常時ON・拡張思考なし
- Claude Mythos 5（`claude-mythos-5`）: 招待制・防御的サイバーセキュリティ向け・$10/$50/MTok
- Opus 4.8: effort はデフォルト high（別レベルは明示指定が必要）。Batch APIで Opus 4.8/Sonnet 4.6 は最大300k出力（output-300k-2026-03-24）

## NOCTAへの関連メモ
R-09 のモデル棲み分けに将来影響しうるが、Fable 5 が現状利用不可のため対応保留。Opus 4.8 の effort デフォルト high は既に CLAUDE.md の運用と整合。利用可能になった時点で /model-review を再検討。
