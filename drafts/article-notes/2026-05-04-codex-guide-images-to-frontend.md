---
title: "@LLMJunky のツイート: Codex Guide - Images to Real UI in 6 Steps"
url: "https://x.com/i/status/2049871598883115376"
date: "2026-05-04"
domain: "x.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
GPT Image 2（GI2）を使ってデザインモックアップ画像からリアルなフロントエンドUIを6ステップで構築するワークフロー（Codex向け）。
変数の多いAI生成の非決定性を「モック→詳細プロンプト自動生成→実装」のフローで抑制するアプローチが核心。
ブラウザ内アノテーションツールを活用した細部修正フローで、10回以内の追加プロンプトで完成に近づける。

## 主なポイント
- Step 1: 業種・サービス・雰囲気・Target・色等を初回一括で詳細記述（Goal+Constraints+Criteria）
- Step 2: 4バリアント生成→好みのデザインを選択
- Step 3: 選択したモック→実装プロンプト自動生成（ここが差別化ポイント・一貫性向上）
- Step 4: モック画像を明示的にコンテキストに含めて実装（「Execution over speed. Accuracy over efficiency」）
- Step 5: ブラウザ内アノテーション（ハイライト+テキスト）で細部を一括修正
- 画像→動画化はBytedance Seedream 2.0推奨

## NOCTAへの関連メモ
`/lp-create` スキルのモックアップ生成フローに直接応用可能。「GPT Image 2でデザインモック生成 → Claude Codeにモック画像+詳細プロンプトで実装指示」という2段階フローをlp-createスキルに組み込むと、LP品質が向上する。また、NOCTA HPのビジュアル改善時にも同ワークフローが使える。
