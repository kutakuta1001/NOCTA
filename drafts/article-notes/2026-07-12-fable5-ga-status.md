---
title: "モデル一覧 — Fable 5は2026-07-12時点で主要プラットフォーム全てでGA継続中"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-07-12"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
公式モデル一覧ページ（2026-07-12時点）では、Claude Fable 5（`claude-fable-5`）はClaude API・Claude Platform on AWS・Amazon Bedrock・Google Cloud・Microsoft Foundryの全プラットフォームで2026-06-09より一般提供（GA）中と明記されている。輸出管理による断続提供・利用不可に関する記載は見当たらなかった。価格は$10/入力MTok・$50/出力MTok、コンテキスト1Mトークン、最大出力128kトークン、適応思考常時ON。

## 主なポイント
- Fable 5はGA状態を継続、廃止・制限の記載なし（ページ確認時点）
- Claude Mythos 5（`claude-mythos-5`）はProject Glasswing限定・招待制のまま一般提供されていない
- Opus 4.8のeffortパラメータは全サーフェスでデフォルト`high`（既存メモリと一致）

## NOCTAへの関連メモ
[[project_fable5_unavailable]]では「2026-07-07まで選択可、以降は利用不可想定」と記録しているが、本日確認した公式ドキュメントにはその制限が反映されていない。この「利用不可想定」がどの情報源（Xの噂・特定プランの制限等）に基づくものだったか出典を再確認し、次回`/model`実行時の実際の選択可否と合わせてメモリを最新化する必要がある。
