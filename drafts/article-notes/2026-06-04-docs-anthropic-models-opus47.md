---
title: "モデル一覧: 公式最新推奨は Opus 4.7（Opus 4.8 は未掲載）"
url: "https://docs.anthropic.com/ja/docs/about-claude/models"
date: "2026-06-04"
domain: "docs.anthropic.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

公式ドキュメントの最新モデル一覧で、推奨最高性能モデルは `claude-opus-4-7`（$5/$25/MTok）と記載されている。CLAUDE.md で使用中の `claude-opus-4-8` は公開ドキュメントに掲載されていない。

## 主なポイント

- 公式最新テーブル: Opus 4.7 | Sonnet 4.6 | Haiku 4.5 の3モデル
- Opus 4.7 の仕様: コンテキスト1M tokens（≒555k words・新トークナイザー）、最大出力 128k tokens、$5/$25/MTok
- Sonnet 4.6 の最大出力は **64k tokens**（Opus 4.7 の半分）
- Claude Sonnet 4・Opus 4（古いバージョン）は 2026-06-15 廃止予定（11日後）
- Claude Haiku 3 は 2026-04-19 廃止済み

## NOCTAへの関連メモ

CLAUDE.md は `claude-opus-4-8`（有料先行・2026-05-29 確認済み）を使用中。公開ドキュメントには掲載なし。30日ごとの `/model-review` で継続監視が必要。Sonnet 4/Opus 4 の廃止期限（2026-06-15）まで11日しかないが、NOCTAは未使用のため影響なし。
