---
title: "Claude Codeハーネス設計: Generator+Designer+Evaluator 3エージェント構成"
url: "https://x.com/i/status/2049043044130066462"
date: "2026-04-30"
domain: "x.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Generator・Designer・Evaluatorの3エージェント構成でClaude Codeを5〜6時間自律稼働させ、MVPレベルのアプリを完成させる手法の実践報告。
DesignerエージェントはDESIGN.mdを参照し、GPT Image 2でワイヤーフレーム画像を事前準備することでデザイン品質を向上させる。
実際にccmuxがこのパターンでほぼ自律的に開発された実績あり。最終の微修正・セキュリティ確認は人間が担当。

## 主なポイント
- Generator → Designer → Evaluator の直列パイプライン構成
- Designerエージェント: getdesign.md等で収集したDESIGN.mdを参照してデザイン性を向上
- GPT Image 2でワイヤーフレーム画像を事前準備すると品質が更に向上
- 5〜6時間の自律稼働でMVPレベルのアプリが完成（最終微修正・セキュリティは人間）
- ccmuxの開発でこのパターンが実証済み

## NOCTAへの関連メモ
NOCTAのAgent Teams（explorer/architect/executor）にDesignerロールを追加する設計の参考になる。/lp-createスキルでDESIGN.mdを参照するパターンは既に実装済みだが、汎用Designerエージェントとして独立させる価値がある。GPT Image 2ワイヤーフレームをlp-createフローに統合する提案につながる。
