---
title: "[changelog v2.1.212] /fork バックグラウンド化・Web検索/サブエージェント上限ガード"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-07-29"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
v2.1.212 で `/fork` がバックグラウンドセッションを作成する方式に変更された。またWeb検索のセッション上限200回・サブエージェント生成上限200個の暴走ガードが追加された。

## 主なポイント
- /fork は現セッションを止めずに分岐セッションをバックグラウンドで作る
- Web検索200回/セッション・サブエージェント200個の上限（通常運用では到達しない安全弁）
- 暴走系の事故（無限ループでの検索・エージェント大量生成）が公式にガードされた

## NOCTAへの関連メモ
Agent Teams・収集系スキル（/research・/phase1-trend）の暴走リスクが公式ガードで低減。NOCTA 側の設定変更は不要。
