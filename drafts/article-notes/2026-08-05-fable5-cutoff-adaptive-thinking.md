---
title: "[platform.claude.com] モデル一覧 — Fable 5 の知識カットオフは2026年1月・適応的思考は常にオン・拡張思考なし"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-08-05"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Fable 5 の仕様が公式表で確認できた。信頼できる知識カットオフは2026年1月（トレーニングデータのカットオフも2026年1月）、拡張思考は非対応、適応的思考は「はい（常にオン）」、相対レイテンシは「遅い」、最大出力128k トークン、コンテキスト1M トークン。

## 主なポイント
- 知識カットオフ 2026年1月（Opus 5 の2026年5月より4ヶ月古い）
- 適応的思考は常時オン（他モデルは「はい」だが Fable 5 だけ「常にオン」表記）
- 拡張思考（thinking.type: "enabled"）は非対応
- レイテンシは4モデル中もっとも遅い

## NOCTAへの関連メモ
CLAUDE.md の Fable 5 記述には知識カットオフが書かれていない。**Opus 5（2026年5月）より Fable 5（2026年1月）のほうがカットオフが古い**点は運用上重要で、最新の Claude Code 仕様やモデル情報を扱う判断では Fable 5 が不利になる。「深い推論は Fable 5、最新情報が必要な判断は Opus 5」という切り分けが実態に合う。R-09 への追記候補。
