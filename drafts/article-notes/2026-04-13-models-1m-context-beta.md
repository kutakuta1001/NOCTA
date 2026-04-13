---
title: "Opus 4.6・Sonnet 4.5 が 1M トークン コンテキストウィンドウ（ベータ）対応"
url: "https://docs.anthropic.com/ja/docs/about-claude/models"
date: "2026-04-13"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Opus 4.6 と Sonnet 4.5 は通常 200K トークンのコンテキストウィンドウに加え、
ベータ機能として 1M トークン（約75万文字）のコンテキストウィンドウに対応している。
有効化には API リクエストに `context-1m-2025-08-07` ベータヘッダーを付与する必要がある。
200K を超えるリクエストにはロングコンテキスト料金が適用される。

## 主なポイント
- 対応モデル: Opus 4.6・Sonnet 4.5（Haiku 4.5 は 200K のみ）
- 有効化: `context-1m-2025-08-07` ベータヘッダーを使用
- 料金: 200K 超過分にロングコンテキスト追加料金あり
- Sonnet 4（レガシー）も同ベータヘッダーで 1M 対応

## NOCTAへの関連メモ
Claude Code CLI 経由の通常会話では直接影響しないが、将来的に大型 SVP ファイルや楽曲仕様書を一括処理する際に参考になる情報。現時点では 200K で充分な範囲内での作業が続いている。
