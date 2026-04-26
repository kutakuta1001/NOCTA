---
title: "Claude Codeで情報収集するときにやっている4つのこと"
url: "https://x.com/i/status/2044704524125057504"
date: "2026-04-26"
domain: "x.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Codeを使った情報収集の効率化手法を4つまとめたスレッド。/last30daysスキル（GitHubで2万星・Reddit/X/YouTubeを同時検索）・Routinesによる定期巡回・Claude直接検索・Grokのリアルタイム情報収集を組み合わせることで、リサーチ時間を大幅に削減できる。

## 主なポイント
- `/last30days [トピック]`: Reddit・X・YouTube・TikTok等を同時走査し2〜8分でレポート生成。いいね/RT/コメントでスコアリング、YouTube文字起こし付き
- Routines（定期実行）: 公式サイト・競合ブログ・GitHubリリースページを毎日自動チェックし、朝PCを開くと更新まとめが完成している状態を構築
- Claude直接検索: 組み込みウェブ検索ツールで特定ツールの評判・最近のニュースを即時調査
- Grok併用: X投稿データへのリアルタイムアクセスで「今朝バズっているリポジトリ」など超新鮮情報を取得→Markdown形式でObsidianに保存
- 「調べる→貯める→使う」サイクル: 収集情報をSkill Graphとして整理しCLAUDE.mdに「ナレッジを参照して回答」と書くと精度向上

## NOCTAへの関連メモ
NOCTAの `/x-practices-search` + `/claude-docs-review` + `/weekly-check` は既にRoutinesに近い定期収集サイクルを実現。`/last30days` スキルはClawHubから導入でき、NOCTAの `/phase1-trend` 強化に活用できる可能性がある。
